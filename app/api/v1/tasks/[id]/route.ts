import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskUpdateSchema } from "@/lib/validations/task.schema";
import { hasPermission, canModifyTaskInVertical } from "@/lib/permissions";
import { sendPusherNotification, PusherEvents } from "@/lib/pusher";
import type { Role } from "@prisma/client";
import { NotificationType, UpdateType, ApprovalStatus } from "@prisma/client";

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
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, profilePictureUrl: true } },
        assignedBy: { select: { id: true, name: true } },
        vertical: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
        updates: {
          include: {
            updatedBy: { select: { id: true, name: true } },
            approvedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (task) {
      const dependencies = await prisma.task.findMany({
        where: { id: { in: task.dependsOnIds } },
        select: { id: true, title: true, status: true },
      });
      const dependentOnBy = await prisma.task.findMany({
        where: { dependsOnIds: { has: task.id } },
        select: { id: true, title: true, status: true },
      });
      (task as any).dependsOn = dependencies;
      (task as any).dependedOnBy = dependentOnBy;
    }

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("[Task GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch task" },
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
    const body = await req.json();
    const parsed = TaskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userRole = session.user.role as Role;

    // Fetch existing task to check permissions
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { assignedTo: true },
    });

    if (!existingTask) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    // Permission checks
    const isAssignee = existingTask.assignedToId === session.user.id;
    const canUpdateOwn = hasPermission(userRole, "UPDATE_OWN_TASK") && isAssignee;
    const canUpdateAny = hasPermission(userRole, "UPDATE_ANY_TASK") && 
                         canModifyTaskInVertical(userRole, session.user.verticalId, existingTask.verticalId);

    if (!canUpdateOwn && !canUpdateAny) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // If volunteer is updating, create a task update that might need approval
    // (In a real implementation, we'd check if the fields changed require approval)
    // For now, we'll just apply the update and log it.
    
    const updatedTask = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_TASK",
        entityType: "TASK",
        entityId: updatedTask.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    // If assigned to someone else, notify them
    if (updatedTask.assignedToId && updatedTask.assignedToId !== session.user.id) {
      await sendPusherNotification(updatedTask.assignedToId, PusherEvents.TASK_UPDATED, {
        taskId: updatedTask.id,
        title: "Task Updated",
        body: `${updatedTask.title} was updated by ${session.user.name}`,
      });
    }

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("[Task PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update task" },
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
    if (!hasPermission(userRole, "DELETE_TASK")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (!canModifyTaskInVertical(userRole, session.user.verticalId, existingTask.verticalId)) {
      return NextResponse.json({ success: false, error: "Forbidden to delete task in this vertical" }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_TASK",
        entityType: "TASK",
        entityId: id,
        metadata: { title: existingTask.title },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("[Task DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
