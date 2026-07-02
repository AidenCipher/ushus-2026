import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations/auth.schema";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { getSystemConfig } from "@/lib/system_config";

export async function POST(req: Request) {
  try {
    const config = getSystemConfig();
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
      return NextResponse.json(
        { success: false, error: "Account with this email already exists" },
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
