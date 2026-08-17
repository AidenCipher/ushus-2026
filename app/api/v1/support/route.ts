import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SupportMessageSchema } from "@/lib/validations/support.schema";
import { sendSupportRequestEmail } from "@/lib/email";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { auditFromRequest } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit(`support:${session.user.id}`, RateLimits.FORGOT_PASSWORD);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const body = await req.json();
    const parsed = SupportMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { subject, message } = parsed.data;
    const sent = await sendSupportRequestEmail(
      session.user.name,
      session.user.email,
      subject,
      message
    );

    if (!sent) {
      return NextResponse.json(
        { success: false, error: "Could not send your message right now. Please try again or use the contact details on this page." },
        { status: 502 }
      );
    }

    await auditFromRequest(req.headers, {
      userId: session.user.id,
      action: "SUPPORT_MESSAGE_SENT",
      entityType: "SUPPORT",
    });

    return NextResponse.json({ success: true, message: "Message sent." });
  } catch (error) {
    console.error("[Support POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
