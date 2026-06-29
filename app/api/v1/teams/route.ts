import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TeamMemberCreateSchema } from "@/lib/validations/team.schema";
import { hasPermission, canManageTeamInEvent } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "VIEW_TEAM")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    
    // Default to the user's event if not specified and they are an organiser
    const targetEventId = eventId || session.user.eventId;

    if (!targetEventId) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Admins can view any team, Organisers/Volunteers can view their own vertical events' teams
    if (userRole !== "ADMIN") {
      const targetEvent = await prisma.event.findUnique({
        where: { id: targetEventId },
        select: { verticalId: true }
      });
      if (!targetEvent || session.user.verticalId !== targetEvent.verticalId) {
        return NextResponse.json({ success: false, error: "Forbidden: Event vertical mismatch" }, { status: 403 });
      }
    }

    const team = await prisma.teamMember.findMany({
      where: { eventId: targetEventId, isActive: true },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, profilePictureUrl: true } },
      },
      orderBy: [
        { roleInTeam: "asc" },
        { user: { name: "asc" } }
      ]
    });

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("[Team GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "MANAGE_TEAM")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = TeamMemberCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify organiser can manage this vertical event team
    if (userRole !== "ADMIN") {
      const targetEvent = await prisma.event.findUnique({
        where: { id: data.eventId },
        select: { verticalId: true }
      });
      if (!targetEvent || session.user.verticalId !== targetEvent.verticalId) {
        return NextResponse.json({ success: false, error: "Forbidden: Event vertical mismatch" }, { status: 403 });
      }
    }

    // Check if user is already in the team
    const existing = await prisma.teamMember.findUnique({
      where: {
        userId_eventId: {
          userId: data.userId,
          eventId: data.eventId,
        },
      },
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate
        const reactivated = await prisma.teamMember.update({
          where: { id: existing.id },
          data: { isActive: true, roleInTeam: data.roleInTeam },
          include: { user: { select: { name: true } } },
        });
        return NextResponse.json({ success: true, data: reactivated });
      }
      return NextResponse.json({ success: false, error: "User is already in this team" }, { status: 409 });
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        ...data,
        addedById: session.user.id,
      },
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
        entityId: teamMember.id,
        metadata: { action: "add", role: data.roleInTeam },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: teamMember }, { status: 201 });
  } catch (error) {
    console.error("[Team POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add team member" },
      { status: 500 }
    );
  }
}
