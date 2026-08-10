import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RegistrationCreateSchema } from "@/lib/validations/registration.schema";
import { hasPermission } from "@/lib/permissions";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { auditFromRequest } from "@/lib/audit";
import type { Prisma, Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view"); // "my" or "all"
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const where: Prisma.RegistrationWhereInput = {};

    // Determine visibility based on role
    if (userRole === "PARTICIPANT" || view === "my") {
      where.userId = session.user.id;
    } else if (userRole === "VOLUNTEER" || userRole === "ORGANISER") {
      // Organisers/Volunteers can see registrations for their event/vertical
      where.event = { verticalId: session.user.verticalId || undefined };
    }

    if (eventId) where.eventId = eventId;
    if (status) where.status = status as any;

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        event: { select: { name: true, dateStart: true, vertical: { select: { name: true } } } },
        user: { select: { name: true, email: true, college: true } },
        payment: { select: { paymentStatus: true, transactionRef: true, paymentSubmittedAt: true } },
      },
      orderBy: { registrationDate: "desc" },
    });

    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("[Registrations GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // ─── WS1.3: Rate limit — 20 req / 15 min per authenticated user ─────────
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitKey = `registrations-post:${session.user.id}`;
    const rl = await rateLimit(rateLimitKey, RateLimits.REGISTRATION_POST);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const body = await req.json();
    const parsed = RegistrationCreateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // A participant can only register themselves unless admin
    const userRole = session.user.role as Role;
    if (data.userId !== session.user.id && userRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Check if event exists and registration is open
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "REGISTRATION_OPEN") {
      return NextResponse.json({ success: false, error: "Registration is not open for this event" }, { status: 400 });
    }

    // Check if already registered
    const existing = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: data.userId,
          eventId: data.eventId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Already registered for this event" }, { status: 409 });
    }

    const primaryUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!primaryUser) {
      return NextResponse.json({ success: false, error: "Primary user not found" }, { status: 404 });
    }

    // ─── WS1.1: Targeted indexed duplicate-check queries ─────────────────────
    // Build lists of emails and phones to check
    const emailsToCheck: string[] = [primaryUser.email.toLowerCase()];
    const phonesToCheck: string[] = [];
    if (primaryUser.phone) phonesToCheck.push(normalisePhone(primaryUser.phone));

    if (data.teamMembers && Array.isArray(data.teamMembers)) {
      for (const member of data.teamMembers) {
        emailsToCheck.push(member.email.toLowerCase());
        if (member.phone) phonesToCheck.push(normalisePhone(member.phone));
      }
    }

    // Check primary-user conflicts via indexed relation query (one DB round-trip)
    const primaryUserConflict = await prisma.registration.findFirst({
      where: {
        eventId: { not: data.eventId },
        user: {
          OR: [
            { email: { in: emailsToCheck } },
            ...(phonesToCheck.length > 0 ? [{ phone: { in: phonesToCheck } }] : []),
          ],
        },
      },
      include: {
        event: { select: { name: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (primaryUserConflict) {
      const conflictUser = primaryUserConflict.user;
      const matchedEmail = emailsToCheck.find(
        (e) => e === conflictUser.email.toLowerCase()
      );
      return NextResponse.json({
        success: false,
        error: `Registration blocked: "${conflictUser.name}" (${matchedEmail ? `email: ${conflictUser.email}` : `phone: ${conflictUser.phone}`}) is already registered for another event: "${primaryUserConflict.event.name}".`,
      }, { status: 409 });
    }

    // Check team-member-in-JSON cross-event conflicts:
    // Fetch only registrations for OTHER events where the primary user appears
    // as a team-member JSON entry (email match). This is a narrower scan than
    // the original full-table fetch — scoped to other events only, and we only
    // fetch what we need (teamMembers JSON + event name).
    if (data.teamMembers && data.teamMembers.length > 0) {
      const otherRegsWithTeamMembers = await prisma.registration.findMany({
        where: {
          eventId: { not: data.eventId },
          teamMembers: { not: null },
        },
        select: {
          teamMembers: true,
          event: { select: { name: true } },
        },
      });

      for (const reg of otherRegsWithTeamMembers) {
        if (!reg.teamMembers || !Array.isArray(reg.teamMembers)) continue;
        const membersList = reg.teamMembers as Array<{
          name?: string;
          email?: string;
          phone?: string;
        }>;

        for (const m of membersList) {
          const mEmail = m.email ? m.email.toLowerCase() : "";
          const mPhone = m.phone ? normalisePhone(m.phone) : "";

          const emailMatch = mEmail && emailsToCheck.includes(mEmail);
          const phoneMatch = mPhone && phonesToCheck.includes(mPhone);

          if (emailMatch || phoneMatch) {
            const checkName = emailMatch
              ? data.teamMembers.find(
                  (tm) => tm.email.toLowerCase() === mEmail
                )?.name ?? primaryUser.name
              : data.teamMembers.find(
                  (tm) => normalisePhone(tm.phone) === mPhone
                )?.name ?? primaryUser.name;

            return NextResponse.json({
              success: false,
              error: `Registration blocked: "${checkName}" (${emailMatch ? `email: ${mEmail}` : `phone: ${m.phone}`}) is already registered as a team member in another event: "${reg.event.name}".`,
            }, { status: 409 });
          }
        }
      }
    }

    // ─── WS1.2: TOCTOU fix — transactional capacity check + create ───────────
    let registration;
    try {
      registration = await prisma.$transaction(
        async (tx) => {
          // Lock the event row to serialise concurrent registration attempts
          await tx.$queryRaw`SELECT id FROM events WHERE id = ${data.eventId} FOR UPDATE`;

          // Re-read count inside the transaction to avoid TOCTOU
          if (event.maxParticipants) {
            const currentCount = await tx.registration.count({
              where: { eventId: data.eventId },
            });

            if (currentCount >= event.maxParticipants) {
              throw new CapacityError("Event capacity reached");
            }
          }

          return tx.registration.create({
            data: {
              userId: data.userId,
              eventId: data.eventId,
              teamName: data.teamName ?? null,
              teamMembers: data.teamMembers as any ?? null,
              externalFormRef: data.externalFormRef ?? null,
              notes: data.notes ?? null,
              status: data.status,
            },
          });
        },
        { isolationLevel: "Serializable" }
      );
    } catch (err) {
      if (err instanceof CapacityError) {
        return NextResponse.json(
          { success: false, error: err.message },
          { status: 400 }
        );
      }
      throw err;
    }

    // Audit log
    await auditFromRequest(req.headers, {
      userId: session.user.id,
      action: "REGISTRATION_CREATED",
      entityType: "REGISTRATION",
      entityId: registration.id,
      metadata: { eventId: registration.eventId },
    });

    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error) {
    console.error("[Registrations POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create registration" },
      { status: 500 }
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalisePhone(p: string): string {
  return p.replace(/[\s\-()+]/g, "");
}

class CapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CapacityError";
  }
}
