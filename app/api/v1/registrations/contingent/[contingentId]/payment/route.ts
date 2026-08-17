import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { auditFromRequest } from "@/lib/audit";
import { sendPaymentSubmittedEmail } from "@/lib/email";
import { getPusherServer, PusherChannels, PusherEvents } from "@/lib/pusher";

// ─── POST /api/v1/registrations/contingent/[contingentId]/payment ─────────
// One transaction reference, submitted once, applied to every Registration
// that shares this contingentId and belongs to the submitting account.

export async function POST(
  req: Request,
  { params }: { params: Promise<{ contingentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { contingentId } = await params;
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

    const registrations = await prisma.registration.findMany({
      where: { contingentId, userId: session.user.id },
      include: { payment: true, event: { select: { name: true } } },
    });

    if (registrations.length === 0) {
      return NextResponse.json({ success: false, error: "Contingent registration not found" }, { status: 404 });
    }

    if (registrations.some((r) => r.payment?.paymentStatus === "VERIFIED")) {
      return NextResponse.json(
        { success: false, error: "Part of this contingent is already verified. Contact the organisers if you need changes." },
        { status: 409 }
      );
    }

    const ref = transactionRef.trim();
    const screenshot = paymentScreenshotUrl ?? null;

    await prisma.$transaction(
      registrations.map((reg) =>
        prisma.payment.upsert({
          where: { registrationId: reg.id },
          create: {
            registrationId: reg.id,
            transactionRef: ref,
            paymentScreenshotUrl: screenshot,
            paymentSubmittedAt: new Date(),
            paymentStatus: "SUBMITTED",
          },
          update: {
            transactionRef: ref,
            paymentScreenshotUrl: screenshot,
            paymentSubmittedAt: new Date(),
            paymentStatus: "SUBMITTED",
            paymentVerifiedAt: null,
            paymentVerifiedById: null,
            rejectionReason: null,
          },
        })
      )
    );

    await auditFromRequest(req.headers, {
      userId: session.user.id,
      action: "PAYMENT_SUBMITTED",
      entityType: "CONTINGENT",
      entityId: contingentId,
      metadata: { transactionRef: ref, eventCount: registrations.length },
    });

    const pusher = getPusherServer();
    if (pusher) {
      await Promise.all(
        registrations.map((reg) =>
          pusher.trigger(PusherChannels.organiserPaymentQueue, PusherEvents.PAYMENT_SUBMITTED, {
            registrationId: reg.id,
            participantName: session.user.name,
            eventName: reg.event.name,
            transactionRef: ref,
            submittedAt: new Date(),
            contingentId,
          })
        )
      );
    }

    sendPaymentSubmittedEmail(
      session.user.email,
      session.user.name,
      `Full Contingent (${registrations.length} events)`,
      ref
    ).catch((e) => console.error("[Contingent Payment POST] Email send failed:", e));

    return NextResponse.json({ success: true, data: { contingentId, registrationCount: registrations.length } }, { status: 201 });
  } catch (error) {
    console.error("[Contingent Payment POST] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit payment" }, { status: 500 });
  }
}
