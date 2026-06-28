import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CalendarEventCreateSchema } from "@/lib/validations/calendar.schema";
import { hasPermission } from "@/lib/permissions";
import type { Prisma, Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "VIEW_CALENDAR")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start"); // ISO date string
    const end = searchParams.get("end");     // ISO date string
    const verticalId = searchParams.get("verticalId");

    const where: Prisma.CalendarEventWhereInput = {};

    if (start && end) {
      where.OR = [
        { startDatetime: { gte: new Date(start), lte: new Date(end) } },
        { endDatetime: { gte: new Date(start), lte: new Date(end) } },
        {
          AND: [
            { startDatetime: { lte: new Date(start) } },
            { endDatetime: { gte: new Date(end) } },
          ],
        },
      ];
    }

    if (verticalId) {
      where.verticalId = verticalId;
    } else if (userRole === "ORGANISER" || userRole === "VOLUNTEER") {
      // Show global events (verticalId=null) AND vertical-specific events
      where.OR = [
        ...(where.OR ? (where.OR as any) : []),
        { verticalId: null },
        { verticalId: session.user.verticalId || undefined }
      ];
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        vertical: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
      },
      orderBy: { startDatetime: "asc" },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("[Calendar GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch calendar events" },
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
    if (!hasPermission(userRole, "MANAGE_CALENDAR")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CalendarEventCreateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Organisers can only create events for their vertical
    if (userRole === "ORGANISER") {
      if (data.verticalId !== session.user.verticalId) {
        return NextResponse.json({ success: false, error: "Forbidden: Can only create calendar events for your vertical" }, { status: 403 });
      }
    }

    const event = await prisma.calendarEvent.create({
      data: {
        ...data,
        createdById: session.user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_CALENDAR_EVENT",
        entityType: "CALENDAR_EVENT",
        entityId: event.id,
        metadata: { title: event.title },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("[Calendar POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
