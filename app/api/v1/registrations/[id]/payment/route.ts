import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { auditFromRequest } from "@/lib/audit";
import { sendPaymentSubmittedEmail, sendPaymentOutcomeEmail } from "@/lib/email";
import { getPusherServer, PusherChannels, PusherEvents } from "@/lib/pusher";
import type { Role } from "@prisma/client";

// ─── POST /api/v1/registrations/[id]/payment ──────────────────────────────────
// Participant submits their transaction reference (+ optional screenshot URL).
// Sets paymentStatus = SUBMITTED.

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: registrationId } = await params;
    const body = await req.json();
    const { transactionRef, paymentScreenshotUrl } = body as {
      transactionRef?: string;
      paymentScreenshotUrl?: string;
    };

    if (!transactionRef || transactionRef.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Transaction reference is required" },
        { status: 400 }
      );
    }

    // Fetch the registration with the related user and event
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { name: true } },
        payment: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    // Validate that the session user owns this registration
    const userRole = session.user.role as Role;
    if (registration.userId !== session.user.id && userRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Block if payment is already verified
    if (registration.payment?.paymentStatus === "VERIFIED") {
      return NextResponse.json(
        { success: false, error: "Payment is already verified. No changes needed." },
        { status: 409 }
      );
    }

    // Upsert the payment record (create or update if previously rejected)
    const payment = await prisma.payment.upsert({
      where: { registrationId },
      create: {
        registrationId,
        transactionRef: transactionRef.trim(),
        paymentScreenshotUrl: paymentScreenshotUrl ?? null,
        paymentSubmittedAt: new Date(),
        paymentStatus: "SUBMITTED",
      },
      update: {
        transactionRef: transactionRef.trim(),
        paymentScreenshotUrl: paymentScreenshotUrl ?? null,
        paymentSubmittedAt: new Date(),
        paymentStatus: "SUBMITTED",
        paymentVerifiedAt: null,
        paymentVerifiedById: null,
        rejectionReason: null,
      },
    });

    // Audit log
    await auditFromRequest(req.headers, {
      userId: session.user.id,
      action: "PAYMENT_SUBMITTED",
      entityType: "PAYMENT",
      entityId: payment.id,
      metadata: {
        registrationId,
        eventName: registration.event.name,
        transactionRef: transactionRef.trim(),
      },
    });

    // Pusher: notify organiser payment queue channel
    const pusher = getPusherServer();
    if (pusher) {
      await pusher.trigger(
        PusherChannels.organiserPaymentQueue,
        PusherEvents.PAYMENT_SUBMITTED,
        {
          paymentId: payment.id,
          registrationId,
          participantName: registration.user.name,
          eventName: registration.event.name,
          transactionRef: transactionRef.trim(),
          submittedAt: payment.paymentSubmittedAt,
        }
      );
    }

    // Email: send receipt to participant (fire-and-forget, do not block response)
    sendPaymentSubmittedEmail(
      registration.user.email,
      registration.user.name,
      registration.event.name,
      transactionRef.trim()
    ).catch((e) => console.error("[Payment POST] Email send failed:", e));

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error("[Payment POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit payment" },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/v1/registrations/[id]/payment ─────────────────────────────────
// Organiser/Admin verifies or rejects a submitted payment.
// On VERIFIED: cascades Registration.status → CONFIRMED in the same transaction.
// On REJECTED: keeps Registration.status as PENDING, stores rejection reason.

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "VERIFY_PAYMENT")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id: registrationId } = await params;
    const body = await req.json();
    const { action, rejectionReason } = body as {
      action?: "VERIFY" | "REJECT";
      rejectionReason?: string;
    };

    if (!action || !["VERIFY", "REJECT"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "action must be VERIFY or REJECT" },
        { status: 400 }
      );
    }

    if (action === "REJECT" && (!rejectionReason || rejectionReason.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: "rejectionReason is required when rejecting a payment" },
        { status: 400 }
      );
    }

    // Fetch the registration with its current payment and related user/event
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, name: true, verticalId: true } },
        payment: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    if (!registration.payment) {
      return NextResponse.json(
        { success: false, error: "No payment submission found for this registration" },
        { status: 404 }
      );
    }

    if (registration.payment.paymentStatus !== "SUBMITTED") {
      return NextResponse.json(
        { success: false, error: `Payment is already ${registration.payment.paymentStatus}` },
        { status: 409 }
      );
    }

    // RBAC scoping: ORGANISER can only verify payments for their own vertical's events
    if (userRole === "ORGANISER") {
      const organiserVerticalId = session.user.verticalId;
      if (organiserVerticalId && registration.event.verticalId !== organiserVerticalId) {
        return NextResponse.json(
          { success: false, error: "Forbidden — event is outside your vertical" },
          { status: 403 }
        );
      }
    }

    const isVerifying = action === "VERIFY";

    // Perform the update in a single transaction to keep payment + registration status in sync
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: registration.payment.id },
        data: {
          paymentStatus: isVerifying ? "VERIFIED" : "REJECTED",
          paymentVerifiedAt: new Date(),
          paymentVerifiedById: session.user.id,
          rejectionReason: isVerifying ? null : rejectionReason?.trim() ?? null,
        },
      }),
      // On VERIFIED: cascade registration status to CONFIRMED
      ...(isVerifying
        ? [
            prisma.registration.update({
              where: { id: registrationId },
              data: { status: "CONFIRMED" },
            }),
          ]
        : []),
    ]);

    // Audit log
    await auditFromRequest(req.headers, {
      userId: session.user.id,
      action: isVerifying ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
      entityType: "PAYMENT",
      entityId: updatedPayment.id,
      metadata: {
        registrationId,
        eventName: registration.event.name,
        participantId: registration.user.id,
        ...(isVerifying ? {} : { rejectionReason: rejectionReason?.trim() }),
      },
    });

    // Pusher: notify the participant of the outcome
    const pusher = getPusherServer();
    if (pusher) {
      await pusher.trigger(
        PusherChannels.userNotifications(registration.user.id),
        PusherEvents.PAYMENT_STATUS_UPDATED,
        {
          registrationId,
          paymentStatus: isVerifying ? "VERIFIED" : "REJECTED",
          eventName: registration.event.name,
          ...(isVerifying ? {} : { rejectionReason: rejectionReason?.trim() }),
        }
      );
    }

    // Email: outcome to participant (fire-and-forget)
    sendPaymentOutcomeEmail(
      registration.user.email,
      registration.user.name,
      registration.event.name,
      isVerifying ? "VERIFIED" : "REJECTED",
      isVerifying ? undefined : rejectionReason?.trim()
    ).catch((e) => console.error("[Payment PATCH] Email send failed:", e));

    return NextResponse.json({ success: true, data: updatedPayment });
  } catch (error) {
    console.error("[Payment PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payment verification" },
      { status: 500 }
    );
  }
}
