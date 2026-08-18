import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PublicEventRegistrationSchema } from "@/lib/validations/registration.schema";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/utils";
import { auditFromRequest, AuditActions } from "@/lib/audit";
import { getSystemConfig } from "@/lib/system_config";
import { calculatePricing } from "@/lib/pricing";
import { findRosterConflict, CapacityError } from "@/lib/registration-checks";

// ─── POST /api/v1/public-registrations/event ───────────────────────────────
// The combined "click Register on an event → fill in your account + your
// team's details → pay" flow for a first-time visitor. Creates the User
// account and the Registration in one atomic transaction. Public route —
// see middleware.ts's PUBLIC_API_ROUTES.

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req.headers);
    const rl = await rateLimit(`public-reg-event:${ip}`, RateLimits.REGISTER);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const config = await getSystemConfig();
    if (!config.allowReg) {
      return NextResponse.json({ success: false, error: "Registrations are currently closed." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = PublicEventRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const event = await prisma.event.findUnique({ where: { id: data.eventId } });
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "REGISTRATION_OPEN") {
      return NextResponse.json({ success: false, error: "Registration is not open for this event" }, { status: 400 });
    }
    if (data.teamMembers.length !== event.teamSize) {
      return NextResponse.json({
        success: false,
        error: `This event requires exactly ${event.teamSize} competitor${event.teamSize === 1 ? "" : "s"}. You submitted ${data.teamMembers.length}.`,
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingUser) {
      // Deliberately generic — do not confirm which emails are registered.
      return NextResponse.json({
        success: false,
        error: "We couldn't create an account with those details. If you already have one, please sign in and register from your dashboard instead.",
        code: "ACCOUNT_EXISTS",
      }, { status: 409 });
    }

    const rosterConflict = await findRosterConflict(data.eventId, data.teamMembers);
    if (rosterConflict) {
      return NextResponse.json({ success: false, error: rosterConflict }, { status: 409 });
    }

    const passwordHash = await hash(data.password, 12);
    const pricing = calculatePricing("INDIVIDUAL_EVENT", 1);

    let result;
    try {
      result = await prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM events WHERE id = ${data.eventId} FOR UPDATE`;

          if (event.maxParticipants) {
            const currentCount = await tx.registration.count({ where: { eventId: data.eventId } });
            if (currentCount >= event.maxParticipants) {
              throw new CapacityError("This event has reached capacity.");
            }
          }

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

          const registration = await tx.registration.create({
            data: {
              userId: user.id,
              eventId: data.eventId,
              teamName: data.teamName ?? null,
              teamMembers: data.teamMembers as any,
              status: "PENDING",
              registrationType: "INDIVIDUAL_EVENT",
              baseAmount: pricing.baseAmount,
              discountPercent: pricing.discountPercent,
              finalAmountDue: pricing.finalAmountDue,
              accommodationRequested: data.teamMembers.some((m) => m.accommodationRequested),
              facultyName: data.facultyName,
              facultyEmail: data.facultyEmail,
              facultyPhone: data.facultyPhone,
            },
          });

          return { user, registration };
        },
        { isolationLevel: "Serializable" }
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
      entityType: "REGISTRATION",
      entityId: result.registration.id,
    });

    return NextResponse.json({ success: true, data: { registrationId: result.registration.id } }, { status: 201 });
  } catch (error) {
    console.error("[Public Event Registration POST] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit registration" }, { status: 500 });
  }
}
