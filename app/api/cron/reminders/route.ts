import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TaskStatus, NotificationType } from "@prisma/client";
import { sendTaskReminderEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. Authorize the request
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Check header if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch tasks due in the next 24 hours that are not completed or cancelled
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: next24Hours,
        },
        status: {
          notIn: [TaskStatus.COMPLETED],
        },
        assignedToId: {
          not: null,
        },
      },
      include: {
        assignedTo: true,
      },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let remindersSent = 0;
    let remindersSkipped = 0;

    // 3. Process each task and send reminders
    for (const task of tasks) {
      if (!task.assignedToId || !task.assignedTo) continue;

      // Deduplication check: check if a reminder notification has already been created today for this task
      const existingReminder = await prisma.notification.findFirst({
        where: {
          relatedTaskId: task.id,
          recipientId: task.assignedToId,
          type: NotificationType.REMINDER,
          createdAt: {
            gte: startOfToday,
          },
        },
      });

      if (existingReminder) {
        remindersSkipped++;
        continue;
      }

      // Create internal in-app notification
      await prisma.notification.create({
        data: {
          recipientId: task.assignedToId,
          type: NotificationType.REMINDER,
          title: "⏰ Task Due Reminder",
          body: `The task "${task.title}" is due soon (on ${task.dueDate?.toLocaleDateString()}). Please update its progress.`,
          relatedTaskId: task.id,
          relatedEventId: task.eventId,
        },
      });

      // Send email reminder if assignee has an email
      if (task.assignedTo.email) {
        const dueDateString = task.dueDate
          ? task.dueDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "soon";

        await sendTaskReminderEmail(
          task.assignedTo.email,
          task.title,
          dueDateString
        );
      }

      remindersSent++;
    }

    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully",
      summary: {
        totalTasksFound: tasks.length,
        remindersSent,
        remindersSkipped,
      },
    });
  } catch (error) {
    console.error("[Cron Reminders Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

// Allow GET request for easier testing in browser/Postman if CRON_SECRET is not enforced or matching
export async function GET(request: Request) {
  return POST(request);
}
