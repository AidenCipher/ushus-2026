import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations/auth.schema";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name, phone, college } = parsed.data;
    const { emailOtp, phoneOtp } = body;

    if (!emailOtp || !phoneOtp) {
      return NextResponse.json(
        { success: false, error: "Email and phone verification codes are required" },
        { status: 400 }
      );
    }

    // Verify email OTP
    const emailOtpRecord = await prisma.verificationOtp.findUnique({
      where: { type_target: { type: "EMAIL", target: email.toLowerCase().trim() } }
    });

    if (!emailOtpRecord || emailOtpRecord.code !== emailOtp.trim() || emailOtpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired email verification code" },
        { status: 400 }
      );
    }

    // Verify phone OTP
    const phoneOtpRecord = await prisma.verificationOtp.findUnique({
      where: { type_target: { type: "PHONE", target: phone.trim() } }
    });

    if (!phoneOtpRecord || phoneOtpRecord.code !== phoneOtp.trim() || phoneOtpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired phone verification code" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    // Delete OTP records on successful validation
    await prisma.verificationOtp.deleteMany({
      where: {
        OR: [
          { type: "EMAIL", target: email.toLowerCase().trim() },
          { type: "PHONE", target: phone.trim() }
        ]
      }
    });

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
    await prisma.auditLog.create({
      data: {
        userId: user.id, // They performed the action themselves
        action: "USER_REGISTERED",
        entityType: "USER",
        entityId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
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
