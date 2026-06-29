import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import type { Prisma, Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "VIEW_GANTT")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view"); // "myVertical", "myEvent", "myTasks", "all"
    const verticalId = searchParams.get("verticalId");

    // Start with all verticals
    let verticalWhere: Prisma.VerticalWhereInput = {};

    // Filter based on role or explicit view request
    if (view === "myVertical" || userRole === "ORGANISER" || userRole === "VOLUNTEER") {
      verticalWhere.id = session.user.verticalId || undefined;
    } else if (verticalId) {
      verticalWhere.id = verticalId;
    }

    // Fetch the hierarchy
    const verticals = await prisma.vertical.findMany({
      where: verticalWhere,
      include: {
        events: {
          where: view === "myEvent" && session.user.eventId ? { id: session.user.eventId } : undefined,
          include: {
            tasks: {
              where: view === "myTasks" ? { assignedToId: session.user.id } : undefined,
              include: {
                assignedTo: { select: { id: true, name: true } },
              },
              orderBy: { startDate: "asc" },
            },
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        verticalId: { in: verticals.map((v) => v.id) },
      },
      orderBy: { startDatetime: "asc" },
    });

    // Format data into standard GanttNode tree structure
    const treeData = verticals.map((vertical) => {
      const verticalNodeId = `v_${vertical.id}`;

      // Calendar events belonging directly to the vertical (no eventId)
      const verticalSchedules = calendarEvents
        .filter((ce) => ce.verticalId === vertical.id && !ce.eventId)
        .map((ce) => ({
          id: `ce_${ce.id}`,
          type: "task",
          title: `[Schedule] ${ce.title}`,
          depth: 1,
          isExpanded: false,
          parentId: verticalNodeId,
          children: [],
          taskData: {
            assignedTo: null,
            status: ce.status || "PLANNED",
            priority: "MEDIUM",
            startDate: ce.startDatetime,
            endDate: ce.endDatetime,
            dueDate: ce.endDatetime,
            progressPercent: ce.status === "COMPLETED" ? 100 : 0,
            dependsOnIds: [],
          },
        }));

      const eventNodes = vertical.events.map((event) => {
        const eventNodeId = `e_${event.id}`;
        
        // Calendar events belonging directly to this event
        const eventSchedules = calendarEvents
          .filter((ce) => ce.eventId === event.id)
          .map((ce) => ({
            id: `ce_${ce.id}`,
            type: "task",
            title: `[Schedule] ${ce.title}`,
            depth: 2,
            isExpanded: false,
            parentId: eventNodeId,
            children: [],
            taskData: {
              assignedTo: null,
              status: ce.status || "PLANNED",
              priority: "MEDIUM",
              startDate: ce.startDatetime,
              endDate: ce.endDatetime,
              dueDate: ce.endDatetime,
              progressPercent: ce.status === "COMPLETED" ? 100 : 0,
              dependsOnIds: [],
            },
          }));

        const taskNodes = event.tasks.map((task) => ({
          id: task.id, // Tasks use their actual UUID
          type: "task",
          title: task.title,
          depth: 2,
          isExpanded: false,
          parentId: eventNodeId,
          children: [],
          taskData: {
            assignedTo: task.assignedTo,
            status: task.status,
            priority: task.priority,
            startDate: task.startDate,
            endDate: task.endDate,
            dueDate: task.dueDate,
            progressPercent: task.progressPercent,
            dependsOnIds: task.dependsOnIds,
          },
        }));

        return {
          id: eventNodeId,
          type: "event",
          title: event.name,
          depth: 1,
          isExpanded: true,
          parentId: verticalNodeId,
          children: [...taskNodes, ...eventSchedules],
        };
      });

      return {
        id: verticalNodeId,
        type: "vertical",
        title: vertical.name,
        colorCode: vertical.colorCode,
        depth: 0,
        isExpanded: true,
        parentId: null,
        children: [...eventNodes, ...verticalSchedules],
      };
    });

    return NextResponse.json({ success: true, data: treeData });
  } catch (error) {
    console.error("[Gantt GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Gantt data" },
      { status: 500 }
    );
  }
}
