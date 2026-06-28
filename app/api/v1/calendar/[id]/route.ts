import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CalendarEventUpdateSchema } from "@/lib/validations/calendar.schema";
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

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "MANAGE_CALENDAR")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = CalendarEventUpdateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ success: false, error: "Calendar event not found" }, { status: 404 });
    }

    // Organisers can only edit events for their vertical
    if (userRole === "ORGANISER") {
      if (existingEvent.verticalId !== session.user.verticalId) {
        return NextResponse.json({ success: false, error: "Forbidden: Can only edit calendar events in your vertical" }, { status: 403 });
      }
      if (data.verticalId && data.verticalId !== session.user.verticalId) {
         return NextResponse.json({ success: false, error: "Forbidden: Cannot move event to another vertical" }, { status: 403 });
      }
    }

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_CALENDAR_EVENT",
        entityType: "CALENDAR_EVENT",
        entityId: updated.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[Calendar PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update calendar event" },
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
    if (!hasPermission(userRole, "MANAGE_CALENDAR")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ success: false, error: "Calendar event not found" }, { status: 404 });
    }

    // Organisers can only delete events for their vertical
    if (userRole === "ORGANISER") {
      if (existingEvent.verticalId !== session.user.verticalId) {
        return NextResponse.json({ success: false, error: "Forbidden: Can only delete calendar events in your vertical" }, { status: 403 });
      }
    }

    await prisma.calendarEvent.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_CALENDAR_EVENT",
        entityType: "CALENDAR_EVENT",
        entityId: id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("[Calendar DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
