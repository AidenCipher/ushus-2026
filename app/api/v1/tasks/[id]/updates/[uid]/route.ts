import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, canModifyTaskInVertical } from "@/lib/permissions";
import { sendPusherNotification, PusherEvents } from "@/lib/pusher";
import { Role, ApprovalStatus, NotificationType } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; uid: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId, uid: updateId } = await params;
    const body = await req.json();
    const { action, reason } = body; // action is 'APPROVE' or 'REJECT'

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "APPROVE_TASK_UPDATE")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Fetch task and task update
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    // Scope check: Organiser must belong to task vertical
    if (!canModifyTaskInVertical(userRole, session.user.verticalId, task.verticalId)) {
      return NextResponse.json({ success: false, error: "Forbidden to modify other vertical's task" }, { status: 403 });
    }

    const update = await prisma.taskUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      return NextResponse.json({ success: false, error: "Update not found" }, { status: 404 });
    }

    if (update.approvalStatus !== ApprovalStatus.PENDING) {
      return NextResponse.json({ success: false, error: "Update already processed" }, { status: 400 });
    }

    if (action === "APPROVE") {
      // Set update as approved
      const approvedUpdate = await prisma.taskUpdate.update({
        where: { id: updateId },
        data: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedById: session.user.id,
          approvedAt: new Date(),
        },
      });

      // Update parent task details
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: update.newStatus || task.status,
          progressPercent: update.newProgress !== null ? update.newProgress : task.progressPercent,
        },
      });

      // Notify the assignee
      if (task.assignedToId) {
        await prisma.notification.create({
          data: {
            recipientId: task.assignedToId,
            senderId: session.user.id,
            type: NotificationType.UPDATE_APPROVED,
            title: "Task Update Approved",
            body: `Your update on task "${task.title}" has been approved.`,
            relatedTaskId: task.id,
          },
        });

        await sendPusherNotification(task.assignedToId, PusherEvents.TASK_UPDATED, {
          taskId: task.id,
          title: "Task Update Approved",
          body: `Your update on task "${task.title}" has been approved.`,
        });
      }

      return NextResponse.json({ success: true, data: approvedUpdate });
    } else if (action === "REJECT") {
      if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
        return NextResponse.json({ success: false, error: "Rejection reason is required" }, { status: 400 });
      }

      const rejectedUpdate = await prisma.taskUpdate.update({
        where: { id: updateId },
        data: {
          approvalStatus: ApprovalStatus.REJECTED,
          rejectionReason: reason.trim(),
          approvedById: session.user.id,
          approvedAt: new Date(),
        },
      });

      // Notify assignee with reason
      if (task.assignedToId) {
        await prisma.notification.create({
          data: {
            recipientId: task.assignedToId,
            senderId: session.user.id,
            type: NotificationType.UPDATE_REJECTED,
            title: "Task Update Rejected",
            body: `Your update on task "${task.title}" was rejected: ${reason.trim()}`,
            relatedTaskId: task.id,
          },
        });

        await sendPusherNotification(task.assignedToId, PusherEvents.TASK_UPDATED, {
          taskId: task.id,
          title: "Task Update Rejected",
          body: `Your update on task "${task.title}" was rejected.`,
        });
      }

      return NextResponse.json({ success: true, data: rejectedUpdate });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Task Updates Approval PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process update" },
      { status: 500 }
    );
  }
}
