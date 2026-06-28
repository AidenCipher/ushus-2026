import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EventCreateSchema } from "@/lib/validations/event.schema";
import { hasPermission } from "@/lib/permissions";
import type { Prisma, Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const verticalId = searchParams.get("verticalId");
    const status = searchParams.get("status");

    // Public route - no auth required for basic viewing
    const where: Prisma.EventWhereInput = {};
    if (verticalId) where.verticalId = verticalId;
    if (status) where.status = status as any;

    const events = await prisma.event.findMany({
      where,
      include: {
        vertical: { select: { name: true, colorCode: true } },
        eventHead: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("[Events GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
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
    if (!hasPermission(userRole, "MANAGE_EVENTS")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = EventCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: parsed.data,
      include: {
        vertical: { select: { name: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_EVENT",
        entityType: "EVENT",
        entityId: event.id,
        metadata: { name: event.name },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("[Events POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
