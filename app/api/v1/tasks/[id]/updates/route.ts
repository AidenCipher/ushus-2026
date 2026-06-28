import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, canModifyTaskInVertical } from "@/lib/permissions";
import { sendPusherNotification, PusherEvents } from "@/lib/pusher";
import { Role, UpdateType, ApprovalStatus, NotificationType } from "@prisma/client";

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

    const updates = await prisma.taskUpdate.findMany({
      where: { taskId: id },
      include: {
        updatedBy: { select: { id: true, name: true, role: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" }, // Thread returns in chronological order
    });

    return NextResponse.json({ success: true, data: updates });
  } catch (error) {
    console.error("[Task Updates GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await req.json();
    const { note, progressPercent, newStatus } = body;

    // Validation checks
    if (!note || typeof note !== "string" || note.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Note is required" }, { status: 400 });
    }

    const trimmedNote = note.trim();
    if (trimmedNote.length < 20) {
      return NextResponse.json(
        { success: false, error: "Note must be at least 20 characters" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { vertical: true },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    // Assignee checks for VOLUNTEER
    const userRole = session.user.role as Role;
    if (userRole === "VOLUNTEER" && task.assignedToId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const isOrganiserOrAdmin = userRole === "ORGANISER" || userRole === "ADMIN";
    const approvalStatus = isOrganiserOrAdmin ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING;

    // Create the task update
    const update = await prisma.taskUpdate.create({
      data: {
        taskId,
        updatedById: session.user.id,
        updateType: UpdateType.PROGRESS_UPDATE,
        previousStatus: task.status,
        newStatus: newStatus || task.status,
        previousProgress: task.progressPercent,
        newProgress: progressPercent !== undefined ? progressPercent : task.progressPercent,
        note: trimmedNote,
        approvalStatus,
        approvedById: isOrganiserOrAdmin ? session.user.id : null,
        approvedAt: isOrganiserOrAdmin ? new Date() : null,
      },
    });

    // If organiser/admin submits, update the task state directly
    if (isOrganiserOrAdmin) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: newStatus || task.status,
          progressPercent: progressPercent !== undefined ? progressPercent : task.progressPercent,
        },
      });
    } else {
      // It's a volunteer's pending update -> notify event/vertical organizers
      const organisers = await prisma.user.findMany({
        where: { role: Role.ORGANISER, verticalId: task.verticalId },
      });

      for (const org of organisers) {
        await prisma.notification.create({
          data: {
            recipientId: org.id,
            senderId: session.user.id,
            type: NotificationType.TASK_UPDATED,
            title: "Task Update Pending",
            body: `${session.user.name} submitted progress on: ${task.title}`,
            relatedTaskId: task.id,
          },
        });

        await sendPusherNotification(org.id, PusherEvents.TASK_UPDATED, {
          taskId: task.id,
          title: "Task Update Pending",
          body: `${session.user.name} submitted progress on: ${task.title}`,
        });
      }
    }

    return NextResponse.json({ success: true, data: update }, { status: 201 });
  } catch (error) {
    console.error("[Task Updates POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit update" },
      { status: 500 }
    );
  }
}
