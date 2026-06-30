import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserUpdateSchema } from "@/lib/validations/user.schema";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET(
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

    // Users can view their own profile. Admins can view anyone.
    // Organisers can view users in their team.
    if (session.user.id !== id && !hasPermission(userRole, "MANAGE_USERS") && !hasPermission(userRole, "VIEW_TEAM")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        college: true,
        isActive: true,
        profilePictureUrl: true,
        vertical: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Additional check for organisers viewing team members
    if (userRole === "ORGANISER" && session.user.id !== id && user.vertical?.id !== session.user.verticalId) {
       return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[User GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

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
    const userRole = session.user.role as Role;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isOrganiserManagingVolunteer = 
      userRole === "ORGANISER" && 
      targetUser.role === "VOLUNTEER" && 
      targetUser.verticalId === session.user.verticalId;

    if (session.user.id !== id && !hasPermission(userRole, "MANAGE_USERS") && !isOrganiserManagingVolunteer) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UserUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Prevent non-admins from assigning roles other than VOLUNTEER or changing vertical
    if (!hasPermission(userRole, "MANAGE_USERS")) {
      if (data.role && data.role !== "VOLUNTEER") {
        return NextResponse.json({ success: false, error: "Organisers can only manage volunteers" }, { status: 400 });
      }
      if (data.verticalId && data.verticalId !== session.user.verticalId) {
        return NextResponse.json({ success: false, error: "Organisers can only manage volunteers within their own vertical" }, { status: 400 });
      }
      
      // If user is editing themselves, they can't change status or role
      if (session.user.id === id) {
        delete data.role;
        delete data.isActive;
        delete data.verticalId;
        delete data.eventId;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER",
        entityType: "USER",
        entityId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[User PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
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

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isOrganiserManagingVolunteer = 
      userRole === "ORGANISER" && 
      targetUser.role === "VOLUNTEER" && 
      targetUser.verticalId === session.user.verticalId;

    if (!hasPermission(userRole, "MANAGE_USERS") && !isOrganiserManagingVolunteer) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (session.user.id === id) {
      return NextResponse.json({ success: false, error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.teamMember.deleteMany({ where: { userId: id } }),
      prisma.registration.deleteMany({ where: { userId: id } }),
      prisma.taskUpdate.deleteMany({ where: { updatedById: id } }),
      prisma.taskUpdate.deleteMany({ where: { approvedById: id } }),
      prisma.notification.deleteMany({ where: { recipientId: id } }),
      prisma.notification.deleteMany({ where: { senderId: id } }),
      prisma.calendarEvent.deleteMany({ where: { createdById: id } }),
      prisma.announcement.deleteMany({ where: { createdById: id } }),
      prisma.auditLog.deleteMany({ where: { userId: id } }),
      prisma.task.updateMany({
        where: { assignedToId: id },
        data: { assignedToId: null }
      }),
      prisma.task.updateMany({
        where: { assignedById: id },
        data: { assignedById: null }
      }),
      prisma.user.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("[User DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
