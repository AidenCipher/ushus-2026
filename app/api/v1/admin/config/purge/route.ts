import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "ACCESS_ADMIN_SETTINGS")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully purged ${result.count} audit logs older than 30 days.`,
    });
  } catch (error) {
    console.error("[Purge Logs POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to purge audit logs" },
      { status: 500 }
    );
  }
}
