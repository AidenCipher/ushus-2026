import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ResetPasswordSchema } from "@/lib/validations/auth.schema";
import { isTokenExpired } from "@/lib/auth-helpers";
import { hash } from "bcryptjs";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/utils";
import { auditFromRequest, AuditActions } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req.headers);
    const rl = await rateLimit(`reset-password:${ip}`, RateLimits.FORGOT_PASSWORD);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || isTokenExpired(user.resetTokenExpiry)) {
      return NextResponse.json(
        { success: false, error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await auditFromRequest(req.headers, {
      userId: user.id,
      action: AuditActions.PASSWORD_RESET_COMPLETED,
      entityType: "USER",
      entityId: user.id,
    });

    return NextResponse.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("[Reset Password POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
