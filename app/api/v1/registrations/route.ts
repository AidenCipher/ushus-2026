import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RegistrationCreateSchema } from "@/lib/validations/registration.schema";
import { hasPermission } from "@/lib/permissions";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { auditFromRequest } from "@/lib/audit";
import { findRosterConflict, CapacityError } from "@/lib/registration-checks";
import { Prisma } from "@prisma/client";
import type { Role } from "@prisma/client";

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

    // Every competitor slot for this event must be filled — no more, no fewer.
    if (data.teamMembers.length !== event.teamSize) {
      return NextResponse.json({
        success: false,
        error: `This event requires exactly ${event.teamSize} competitor${event.teamSize === 1 ? "" : "s"}. You submitted ${data.teamMembers.length}.`,
      }, { status: 400 });
    }

    // Same-event roster conflict: a student can compete in multiple different
    // events, but can't appear on two different teams for the SAME event.
    const rosterConflict = await findRosterConflict(data.eventId, data.teamMembers);
    if (rosterConflict) {
      return NextResponse.json({ success: false, error: `Registration blocked: ${rosterConflict}` }, { status: 409 });
    }

    // ─── WS2A: Compute Pricing ──────────────────────────────────────────────
    const { calculatePricing } = await import("@/lib/pricing");
    const pricing = calculatePricing(data.registrationType ?? "INDIVIDUAL_EVENT", 1);

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
              teamMembers: data.teamMembers as any,
              externalFormRef: data.externalFormRef ?? null,
              notes: data.notes ?? null,
              // Status is never client-controlled — every registration starts
              // PENDING; transitions only happen via payment verification.
              status: "PENDING",
              registrationType: data.registrationType,
              contingentId: data.contingentId ?? null,
              baseAmount: pricing.baseAmount,
              discountPercent: pricing.discountPercent,
              finalAmountDue: pricing.finalAmountDue,
              // Derived from the roster, not trusted from a separate client field.
              accommodationRequested: data.teamMembers.some((m) => m.accommodationRequested),
              facultyName: data.facultyName,
              facultyEmail: data.facultyEmail,
              facultyPhone: data.facultyPhone,
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

