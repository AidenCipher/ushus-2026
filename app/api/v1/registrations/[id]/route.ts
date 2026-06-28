import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RegistrationUpdateSchema } from "@/lib/validations/registration.schema";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = RegistrationUpdateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userRole = session.user.role as Role;

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { event: true }
    });

    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    // Participants can update their own registration (e.g. team name) if event allows
    // Organisers/Admins can update status
    if (registration.userId !== session.user.id && !hasPermission(userRole, "MANAGE_EVENTS")) {
       return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Only admins/organisers can update the status or notes
    if (registration.userId === session.user.id && userRole === "PARTICIPANT") {
      delete data.status;
      delete data.notes;
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: {
        ...data,
        teamMembers: data.teamMembers as any,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_REGISTRATION",
        entityType: "REGISTRATION",
        entityId: updated.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[Registration PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userRole = session.user.role as Role;

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    // Participants can cancel their own, Admins can delete any
    if (registration.userId !== session.user.id && !hasPermission(userRole, "MANAGE_EVENTS")) {
       return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await prisma.registration.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_REGISTRATION",
        entityType: "REGISTRATION",
        entityId: id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("[Registration DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete registration" },
      { status: 500 }
    );
  }
}
