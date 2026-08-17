import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ContingentCreateSchema } from "@/lib/validations/registration.schema";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { auditFromRequest } from "@/lib/audit";
import { calculatePricing } from "@/lib/pricing";
import { Prisma } from "@prisma/client";

// ─── POST /api/v1/registrations/contingent ─────────────────────────────────
// Creates one Registration per event in a single atomic transaction, all
// tagged with the same contingentId, all owned by the submitting account.
// Payment is still 1:1 per Registration (see contingent/[id]/payment) — this
// endpoint only handles roster creation.

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit(`registrations-contingent-post:${session.user.id}`, RateLimits.REGISTRATION_POST);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const body = await req.json();
    const parsed = ContingentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const eventIds = data.entries.map((e) => e.eventId);
    if (new Set(eventIds).size !== eventIds.length) {
      return NextResponse.json({ success: false, error: "Duplicate event in contingent submission" }, { status: 400 });
    }

    const events = await prisma.event.findMany({ where: { id: { in: eventIds } } });
    const eventById = new Map(events.map((e) => [e.id, e]));

    // Validate every entry before touching the database.
    for (const entry of data.entries) {
      const event = eventById.get(entry.eventId);
      if (!event) {
        return NextResponse.json({ success: false, error: `Event ${entry.eventId} not found` }, { status: 404 });
      }
      if (event.status !== "REGISTRATION_OPEN") {
        return NextResponse.json({ success: false, error: `Registration is not open for "${event.name}"` }, { status: 400 });
      }
      if (entry.teamMembers.length !== event.teamSize) {
        return NextResponse.json({
          success: false,
          error: `"${event.name}" requires exactly ${event.teamSize} competitor${event.teamSize === 1 ? "" : "s"}. You submitted ${entry.teamMembers.length}.`,
        }, { status: 400 });
      }

      const existing = await prisma.registration.findUnique({
        where: { userId_eventId: { userId: session.user.id, eventId: entry.eventId } },
      });
      if (existing) {
        return NextResponse.json({ success: false, error: `Already registered for "${event.name}"` }, { status: 409 });
      }

      const registerNumbersToCheck = entry.teamMembers.map((m) => m.registerNumber.trim().toLowerCase());
      const emailsToCheck = entry.teamMembers.map((m) => m.email.toLowerCase());
      const phonesToCheck = entry.teamMembers.map((m) => normalisePhone(m.phone));

      const siblingRegs = await prisma.registration.findMany({
        where: { eventId: entry.eventId, teamMembers: { not: Prisma.JsonNull } },
        select: { teamMembers: true },
      });

      for (const reg of siblingRegs) {
        if (!reg.teamMembers || !Array.isArray(reg.teamMembers)) continue;
        for (const m of reg.teamMembers as Array<{ name?: string; registerNumber?: string; email?: string; phone?: string }>) {
          const mRegNo = m.registerNumber ? m.registerNumber.trim().toLowerCase() : "";
          const mEmail = m.email ? m.email.toLowerCase() : "";
          const mPhone = m.phone ? normalisePhone(m.phone) : "";
          if (
            (mRegNo && registerNumbersToCheck.includes(mRegNo)) ||
            (mEmail && emailsToCheck.includes(mEmail)) ||
            (mPhone && phonesToCheck.includes(mPhone))
          ) {
            return NextResponse.json({
              success: false,
              error: `"${m.name ?? "A competitor"}" is already on another team registered for "${event.name}".`,
            }, { status: 409 });
          }
        }
      }
    }

    const pricing = calculatePricing("CONTINGENT", data.entries.length);
    const perEventBase = Math.round(pricing.baseAmount / data.entries.length);
    const perEventFinal = Math.round(pricing.finalAmountDue / data.entries.length);

    let registrations;
    try {
      registrations = await prisma.$transaction(
        async (tx) => {
          const created = [];
          for (const entry of data.entries) {
            const event = eventById.get(entry.eventId)!;

            await tx.$queryRaw`SELECT id FROM events WHERE id = ${entry.eventId} FOR UPDATE`;

            if (event.maxParticipants) {
              const currentCount = await tx.registration.count({ where: { eventId: entry.eventId } });
              if (currentCount >= event.maxParticipants) {
                throw new CapacityError(`"${event.name}" has reached capacity`);
              }
            }

            // College/city are captured once in the wizard and applied to
            // every member's record — the roster still carries full per-
            // person data, it just isn't retyped ten times by the coordinator.
            const teamMembers = entry.teamMembers.map((m) => ({
              ...m,
              college: data.collegeName,
              city: data.city,
            }));

            const reg = await tx.registration.create({
              data: {
                userId: session.user.id,
                eventId: entry.eventId,
                teamMembers: teamMembers as any,
                status: "PENDING",
                registrationType: "CONTINGENT",
                contingentId: data.contingentId,
                baseAmount: perEventBase,
                discountPercent: pricing.discountPercent,
                finalAmountDue: perEventFinal,
                accommodationRequested: teamMembers.some((m) => m.accommodationRequested),
                facultyName: data.facultyName,
                facultyEmail: data.facultyEmail,
                facultyPhone: data.facultyPhone,
              },
            });
            created.push(reg);
          }
          return created;
        },
        { isolationLevel: "Serializable", timeout: 20000 }
      );
    } catch (err) {
      if (err instanceof CapacityError) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
      }
      throw err;
    }

    await auditFromRequest(req.headers, {
      userId: session.user.id,
      action: "REGISTRATION_CREATED",
      entityType: "CONTINGENT",
      entityId: data.contingentId,
      metadata: { eventCount: registrations.length, collegeName: data.collegeName },
    });

    return NextResponse.json({ success: true, data: registrations }, { status: 201 });
  } catch (error) {
    console.error("[Contingent Registrations POST] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create contingent registration" }, { status: 500 });
  }
}

function normalisePhone(p: string): string {
  return p.replace(/[\s\-()+]/g, "");
}

class CapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CapacityError";
  }
}
