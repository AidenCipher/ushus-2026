import { POST } from "@/app/api/cron/reminders/route";
import { testPrisma, TEST_USERS, seedTestEvent } from "../../setup/test-db";
import { TaskStatus, TaskPriority, NotificationType } from "@prisma/client";
import { sendTaskReminderEmail } from "@/lib/email";

// Mock email library
jest.mock("@/lib/email", () => ({
  sendTaskReminderEmail: jest.fn().mockResolvedValue(true),
}));

describe("Cron Reminders API Integration Tests", () => {
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    await seedTestEvent();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should fail authentication if CRON_SECRET is set and header is missing or incorrect", async () => {
    process.env.CRON_SECRET = "super-secret-cron-key";

    const reqNoHeader = new Request("http://localhost/api/cron/reminders", {
      method: "POST",
    });
    const resNoHeader = await POST(reqNoHeader);
    expect(resNoHeader.status).toBe(401);

    const reqWrongHeader = new Request("http://localhost/api/cron/reminders", {
      method: "POST",
      headers: {
        Authorization: "Bearer wrong-secret",
      },
    });
    const resWrongHeader = await POST(reqWrongHeader);
    expect(resWrongHeader.status).toBe(401);
  });

  it("should succeed authentication if CRON_SECRET is set and correct header is provided", async () => {
    process.env.CRON_SECRET = "super-secret-cron-key";

    const req = new Request("http://localhost/api/cron/reminders", {
      method: "POST",
      headers: {
        Authorization: "Bearer super-secret-cron-key",
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("NOTIF-I-005: should send a reminder notification if a task is due in 23 hours", async () => {
    // Create a task due in 23 hours
    const dueIn23Hours = new Date(Date.now() + 23 * 60 * 60 * 1000);

    const task = await testPrisma.task.create({
      data: {
        title: "Submit Final Budget Report",
        description: "Submit to Organiser",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: dueIn23Hours,
        assignedToId: TEST_USERS.volunteer.id,
        verticalId: TEST_USERS.organiser.verticalId,
        eventId: TEST_USERS.organiser.eventId,
      },
    });

    const req = new Request("http://localhost/api/cron/reminders", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.summary.remindersSent).toBe(1);

    // Verify notification was created in database
    const notification = await testPrisma.notification.findFirst({
      where: {
        recipientId: TEST_USERS.volunteer.id,
        type: NotificationType.REMINDER,
        relatedTaskId: task.id,
      },
    });
    expect(notification).toBeTruthy();
    expect(notification?.body).toContain("Submit Final Budget Report");

    // Verify email was sent
    expect(sendTaskReminderEmail).toHaveBeenCalledWith(
      TEST_USERS.volunteer.email,
      "Submit Final Budget Report",
      expect.any(String)
    );
  });

  it("should NOT send a reminder if the task is already COMPLETED", async () => {
    const dueIn23Hours = new Date(Date.now() + 23 * 60 * 60 * 1000);

    await testPrisma.task.create({
      data: {
        title: "Completed Budget Report",
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: dueIn23Hours,
        assignedToId: TEST_USERS.volunteer.id,
        verticalId: TEST_USERS.organiser.verticalId,
      },
    });

    const req = new Request("http://localhost/api/cron/reminders", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.summary.remindersSent).toBe(0);
  });

  it("NOTIF-I-006: should NOT send duplicate reminders if run twice on the same day", async () => {
    const dueIn23Hours = new Date(Date.now() + 23 * 60 * 60 * 1000);

    await testPrisma.task.create({
      data: {
        title: "Deduplicated Task",
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.HIGH,
        dueDate: dueIn23Hours,
        assignedToId: TEST_USERS.volunteer.id,
        verticalId: TEST_USERS.organiser.verticalId,
      },
    });

    // First Run
    const req1 = new Request("http://localhost/api/cron/reminders", {
      method: "POST",
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    expect(body1.summary.remindersSent).toBe(1);
    expect(body1.summary.remindersSkipped).toBe(0);

    // Second Run
    const req2 = new Request("http://localhost/api/cron/reminders", {
      method: "POST",
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.summary.remindersSent).toBe(0);
    expect(body2.summary.remindersSkipped).toBe(1);

    // Verify there is still only 1 notification in the database
    const notificationsCount = await testPrisma.notification.count({
      where: {
        recipientId: TEST_USERS.volunteer.id,
        type: NotificationType.REMINDER,
      },
    });
    expect(notificationsCount).toBe(1);
  });
});
