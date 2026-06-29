import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TeamMemberUpdateSchema } from "@/lib/validations/team.schema";
import { hasPermission, canManageTeamInEvent } from "@/lib/permissions";
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

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "MANAGE_TEAM")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = TeamMemberUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const existingMember = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json({ success: false, error: "Team member not found" }, { status: 404 });
    }

    if (userRole !== "ADMIN") {
      const targetEvent = await prisma.event.findUnique({
        where: { id: existingMember.eventId },
        select: { verticalId: true }
      });
      if (!targetEvent || session.user.verticalId !== targetEvent.verticalId) {
        return NextResponse.json({ success: false, error: "Forbidden: Event vertical mismatch" }, { status: 403 });
      }
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: parsed.data,
      include: {
        user: { select: { name: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_TEAM",
        entityType: "TEAM_MEMBER",
        entityId: updated.id,
        metadata: { action: "update", changes: parsed.data as any },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[Team Member PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update team member" },
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

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "MANAGE_TEAM")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    
    const existingMember = await prisma.teamMember.findUnique({
      where: { id },
      include: { user: { select: { name: true } } }
    });

    if (!existingMember) {
      return NextResponse.json({ success: false, error: "Team member not found" }, { status: 404 });
    }

    if (userRole !== "ADMIN") {
      const targetEvent = await prisma.event.findUnique({
        where: { id: existingMember.eventId },
        select: { verticalId: true }
      });
      if (!targetEvent || session.user.verticalId !== targetEvent.verticalId) {
        return NextResponse.json({ success: false, error: "Forbidden: Event vertical mismatch" }, { status: 403 });
      }
    }

    // Instead of hard delete, we might just set isActive to false to preserve history
    const updated = await prisma.teamMember.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_TEAM",
        entityType: "TEAM_MEMBER",
        entityId: id,
        metadata: { action: "remove", user: existingMember.user.name },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[Team Member DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
