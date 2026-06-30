import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskCreateSchema } from "@/lib/validations/task.schema";
import { hasPermission, canModifyTaskInVertical } from "@/lib/permissions";
import { sendPusherNotification, PusherEvents } from "@/lib/pusher";
import { sendTaskAssignmentEmail } from "@/lib/email";
import type { Prisma, Role } from "@prisma/client";
import { NotificationType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assigneeId");
    const verticalId = searchParams.get("verticalId");
    const eventId = searchParams.get("eventId");
    const view = searchParams.get("view"); // "my" or "all"
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Base query
    const where: Prisma.TaskWhereInput = {};

    // Apply role-based visibility constraints
    const userRole = session.user.role as Role;
    if (userRole === "VOLUNTEER") {
      // Volunteers can only see tasks assigned specifically to them
      where.assignedToId = session.user.id;
    } else if (userRole === "ORGANISER") {
      // Organisers can see all tasks in their vertical
      if (view !== "all") {
        where.verticalId = session.user.verticalId || undefined;
      }
    }

    // Apply explicit filters
    if (view === "my") where.assignedToId = session.user.id;
    else if (assigneeId) where.assignedToId = assigneeId;

    if (status) where.status = { in: status.split(",") as any };
    if (priority) where.priority = { in: priority.split(",") as any };
    if (verticalId) where.verticalId = verticalId;
    if (eventId) where.eventId = eventId;

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          assignedBy: { select: { id: true, name: true } },
          vertical: { select: { id: true, name: true } },
          event: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Tasks GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
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
    if (!hasPermission(userRole, "CREATE_TASK")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = TaskCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify organiser can create in this vertical
    if (!canModifyTaskInVertical(userRole, session.user.verticalId, data.verticalId)) {
      return NextResponse.json(
        { success: false, error: "Can only create tasks in your own vertical" },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        assignedById: session.user.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_TASK",
        entityType: "TASK",
        entityId: task.id,
        metadata: { title: task.title },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    // Notifications
    if (task.assignedToId && task.assignedToId !== session.user.id) {
      const assignedUser = task.assignedTo;
      if (assignedUser) {
        // DB Notification
        await prisma.notification.create({
          data: {
            recipientId: assignedUser.id,
            senderId: session.user.id,
            type: NotificationType.TASK_ASSIGNED,
            title: "New Task Assigned",
            body: `You have been assigned to: ${task.title}`,
            relatedTaskId: task.id,
          },
        });

        // Real-time Notification
        await sendPusherNotification(assignedUser.id, PusherEvents.NEW_NOTIFICATION, {
          title: "New Task Assigned",
          body: `You have been assigned to: ${task.title}`,
          taskId: task.id,
        });

        // Email Notification
        await sendTaskAssignmentEmail(assignedUser.email, task.title, session.user.name);
      }
    }

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("[Tasks POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
