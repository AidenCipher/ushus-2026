import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations/auth.schema";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { getSystemConfig } from "@/lib/system_config";
import { rateLimit, rateLimitResponse, RateLimits } from "@/lib/rate-limit";
import { auditFromRequest } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    // ─── WS1.3: Rate limit — 10 req / 15 min per IP ──────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rl = await rateLimit(`register:${ip}`, RateLimits.REGISTER);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const config = await getSystemConfig();
    if (!config.allowReg) {
      return NextResponse.json(
        { success: false, error: "Registrations are currently closed." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name, phone, college } = parsed.data;
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Deliberately generic — do not confirm which emails are registered.
      return NextResponse.json(
        { success: false, error: "Registration failed. Please check your details and try again, or sign in if you already have an account." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone,
        college,
        role: Role.PARTICIPANT, // Default role for public registration
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // We do NOT require a session to register, but we log the audit against the system
    await auditFromRequest(req.headers, {
      userId: user.id, // They performed the action themselves
      action: "USER_REGISTERED",
      entityType: "USER",
      entityId: user.id,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("[Auth Register POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
