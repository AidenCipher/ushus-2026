import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "ACCESS_ADMIN_SETTINGS")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (body.confirmation !== "FACTORY RESET") {
      return NextResponse.json(
        { success: false, error: "Invalid factory reset confirmation phrase" },
        { status: 400 }
      );
    }

    // Execute atomic db cleaning using $transaction
    await prisma.$transaction([
      prisma.rateLimitEntry.deleteMany({}),
      prisma.notification.deleteMany({}),
      prisma.taskUpdate.deleteMany({}),
      prisma.task.deleteMany({}),
      prisma.teamMember.deleteMany({}),
      prisma.registration.deleteMany({}),
      prisma.calendarEvent.deleteMany({}),
      prisma.announcement.deleteMany({}),
      prisma.auditLog.deleteMany({}),
      // Delete non-admin accounts
      prisma.user.deleteMany({
        where: {
          role: { not: "ADMIN" },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Database factory reset completed successfully. Re-seeding required.",
    });
  } catch (error) {
    console.error("[Database Reset POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform database factory reset" },
      { status: 500 }
    );
  }
}
