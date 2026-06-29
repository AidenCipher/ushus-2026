import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "VIEW_ANNOUNCEMENTS")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Fetch active announcements targeted to the user's role or to all roles (null)
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { targetRole: userRole },
          { targetRole: null }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        createdBy: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("[Announcements GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcements" },
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
    if (!hasPermission(userRole, "CREATE_ANNOUNCEMENT")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, body: contentText, targetRole, expiresAt } = body;

    if (!title || !contentText) {
      return NextResponse.json(
        { success: false, error: "Title and body are required" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: contentText,
        targetRole: targetRole || null,
        createdById: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Create an audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_ANNOUNCEMENT",
        entityType: "ANNOUNCEMENT",
        entityId: announcement.id,
        metadata: { title },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    console.error("[Announcements POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
