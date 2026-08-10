import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

/**
 * GET /api/v1/payments/queue
 *
 * Returns all payment records (SUBMITTED status) visible to the requesting
 * organiser, scoped by their vertical (matching existing RBAC pattern).
 * Admins see all.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "VERIFY_PAYMENT")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") ?? "SUBMITTED";

    // Build the vertical scope: ORGANISER sees their vertical; ADMIN sees all
    const verticalScope =
      userRole === "ORGANISER" && session.user.verticalId
        ? { registration: { event: { verticalId: session.user.verticalId } } }
        : {};

    const payments = await prisma.payment.findMany({
      where: {
        paymentStatus: statusFilter as any,
        ...verticalScope,
      },
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true, college: true } },
            event: {
              select: {
                id: true,
                name: true,
                verticalId: true,
                vertical: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { paymentSubmittedAt: "asc" },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("[Payment Queue GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment queue" },
      { status: 500 }
    );
  }
}
