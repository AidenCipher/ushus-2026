import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ForgotPasswordSchema } from "@/lib/validations/auth.schema";
import { generateResetToken } from "@/lib/auth-helpers";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/utils";
import { auditFromRequest, AuditActions } from "@/lib/audit";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour, matches the email copy

// Always the same response body, whether or not the email is registered —
// this is the one place account enumeration must never be possible. A fresh
// NextResponse is created per call since a Response body can only be read once.
function genericResponse() {
  return NextResponse.json({
    success: true,
    message: "If an account with that email exists, a password reset link has been sent.",
  });
}

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req.headers);
    const rl = await rateLimit(`forgot-password:${ip}`, RateLimits.FORGOT_PASSWORD);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      // Still generic — a malformed email shouldn't behave differently
      // from a well-formed but unregistered one.
      return genericResponse();
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user && user.isActive) {
      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      await sendPasswordResetEmail(user.email, resetToken);

      await auditFromRequest(req.headers, {
        userId: user.id,
        action: AuditActions.PASSWORD_RESET_REQUESTED,
        entityType: "USER",
        entityId: user.id,
      });
    }

    return genericResponse();
  } catch (error) {
    console.error("[Forgot Password POST] Error:", error);
    // Even on an internal error, don't leak whether the account exists.
    return genericResponse();
  }
}
