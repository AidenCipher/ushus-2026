import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PublicContingentRegistrationSchema } from "@/lib/validations/registration.schema";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/utils";
import { auditFromRequest, AuditActions } from "@/lib/audit";
import { getSystemConfig } from "@/lib/system_config";
import { calculatePricing } from "@/lib/pricing";
import { findRosterConflict, CapacityError } from "@/lib/registration-checks";

// ─── POST /api/v1/public-registrations/contingent ──────────────────────────
// The combined "click Register Full Contingent → create your account once →
// fill in all 10 rosters → pay once" flow for a first-time coordinator.
// Creates the User account and every Registration in one atomic transaction.

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req.headers);
    const rl = await rateLimit(`public-reg-contingent:${ip}`, RateLimits.REGISTER);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const config = await getSystemConfig();
    if (!config.allowReg) {
      return NextResponse.json({ success: false, error: "Registrations are currently closed." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = PublicContingentRegistrationSchema.safeParse(body);
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

    const existingUser = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "We couldn't create an account with those details. If you already have one, please sign in and register from your dashboard instead.",
        code: "ACCOUNT_EXISTS",
      }, { status: 409 });
    }

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

      const rosterConflict = await findRosterConflict(entry.eventId, entry.teamMembers);
      if (rosterConflict) {
        return NextResponse.json({ success: false, error: `"${event.name}": ${rosterConflict}` }, { status: 409 });
      }
    }

    const passwordHash = await hash(data.password, 12);
    const pricing = calculatePricing("CONTINGENT", data.entries.length);
    const perEventBase = Math.round(pricing.baseAmount / data.entries.length);
    const perEventFinal = Math.round(pricing.finalAmountDue / data.entries.length);

    let result;
    try {
      result = await prisma.$transaction(
        async (tx) => {
          const user = await tx.user.create({
            data: {
              email: data.email.toLowerCase(),
              passwordHash,
              name: data.name,
              phone: data.phone,
              college: data.college,
              role: Role.PARTICIPANT,
              isActive: true,
            },
          });

          const registrations = [];
          for (const entry of data.entries) {
            const event = eventById.get(entry.eventId)!;

            await tx.$queryRaw`SELECT id FROM events WHERE id = ${entry.eventId} FOR UPDATE`;

            if (event.maxParticipants) {
              const currentCount = await tx.registration.count({ where: { eventId: entry.eventId } });
              if (currentCount >= event.maxParticipants) {
                throw new CapacityError(`"${event.name}" has reached capacity`);
              }
            }

            // College/city are captured once and applied to every member's
            // record — the roster still carries full per-person data, it
            // just isn't retyped ten times by the coordinator.
            const teamMembers = entry.teamMembers.map((m) => ({
              ...m,
              college: data.collegeName,
              city: data.city,
            }));

            const reg = await tx.registration.create({
              data: {
                userId: user.id,
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
            registrations.push(reg);
          }

          return { user, registrations };
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
      userId: result.user.id,
      action: AuditActions.USER_CREATED,
      entityType: "USER",
      entityId: result.user.id,
    });
    await auditFromRequest(req.headers, {
      userId: result.user.id,
      action: AuditActions.REGISTRATION_CREATED,
      entityType: "CONTINGENT",
      entityId: data.contingentId,
      metadata: { eventCount: result.registrations.length, collegeName: data.collegeName },
    });

    return NextResponse.json(
      { success: true, data: { registrationCount: result.registrations.length } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Public Contingent Registration POST] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit contingent registration" }, { status: 500 });
  }
}
