import { GET, POST } from "@/app/api/v1/tasks/[id]/updates/route";
import { PATCH } from "@/app/api/v1/tasks/[id]/updates/[uid]/route";
import { auth } from "@/lib/auth";
import { testPrisma, TEST_USERS } from "../../setup/test-db";
import { TaskStatus, TaskPriority, ApprovalStatus, UpdateType } from "@prisma/client";

// Mock next-auth, email, and pusher
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/pusher", () => ({
  sendPusherNotification: jest.fn().mockResolvedValue({}),
  PusherEvents: { TASK_UPDATED: "task-updated" },
}));

describe("Task Updates API Integration Tests", () => {
  let taskId: string;
  let volunteerTaskId: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create Verticals first
    await testPrisma.vertical.createMany({
      data: [
        { id: TEST_USERS.organiser.verticalId, name: "Marketing", colorCode: "#6366F1" },
        { id: TEST_USERS.otherOrganiser.verticalId, name: "Finance", colorCode: "#EC4899" }
      ],
      skipDuplicates: true,
    });

    // Create a task in the organiser's vertical
    const task = await testPrisma.task.create({
      data: {
        title: "Test Task for Updates",
        verticalId: TEST_USERS.organiser.verticalId,
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.MEDIUM,
      },
    });
    taskId = task.id;

    // Create a task assigned to the volunteer
    const vTask = await testPrisma.task.create({
      data: {
        title: "Volunteer Task",
        verticalId: TEST_USERS.organiser.verticalId,
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.MEDIUM,
        assignedToId: TEST_USERS.volunteer.id,
      },
    });
    volunteerTaskId = vTask.id;
  });

  describe("GET /api/v1/tasks/[id]/updates", () => {
    it("should reject unauthenticated requests", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const req = new Request(`http://localhost/api/v1/tasks/${taskId}/updates`);
      const res = await GET(req, { params: Promise.resolve({ id: taskId }) });
      expect(res.status).toBe(401);
    });

    it("should fetch empty list when no updates exist", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      const req = new Request(`http://localhost/api/v1/tasks/${taskId}/updates`);
      const res = await GET(req, { params: Promise.resolve({ id: taskId }) });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
    });
  });

  describe("POST /api/v1/tasks/[id]/updates", () => {
    it("should reject note shorter than 20 characters", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      const payload = {
        note: "Too short comment",
        progressPercent: 50,
      };

      const req = new Request(`http://localhost/api/v1/tasks/${taskId}/updates`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req, { params: Promise.resolve({ id: taskId }) });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain("at least 20 characters");
    });

    it("should auto-approve update for Organiser and modify task status directly", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      const payload = {
        note: "This is a detailed update description exceeding twenty characters limit",
        progressPercent: 60,
        newStatus: TaskStatus.IN_PROGRESS,
      };

      const req = new Request(`http://localhost/api/v1/tasks/${taskId}/updates`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req, { params: Promise.resolve({ id: taskId }) });
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.approvalStatus).toBe(ApprovalStatus.APPROVED);

      // Verify the task itself was updated directly
      const updatedTask = await testPrisma.task.findUnique({ where: { id: taskId } });
      expect(updatedTask?.status).toBe(TaskStatus.IN_PROGRESS);
      expect(updatedTask?.progressPercent).toBe(60);
    });

    it("should keep Volunteer update as pending and notify organisers", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.volunteer });

      const payload = {
        note: "This is a detailed update submitted by volunteer for approval",
        progressPercent: 30,
        newStatus: TaskStatus.IN_PROGRESS,
      };

      const req = new Request(`http://localhost/api/v1/tasks/${volunteerTaskId}/updates`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req, { params: Promise.resolve({ id: volunteerTaskId }) });
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.approvalStatus).toBe(ApprovalStatus.PENDING);

      // Parent task should NOT be updated yet
      const task = await testPrisma.task.findUnique({ where: { id: volunteerTaskId } });
      expect(task?.status).toBe(TaskStatus.NOT_STARTED);
      expect(task?.progressPercent).toBe(0);

      // A notification should be created for organisers
      const notification = await testPrisma.notification.findFirst({
        where: { relatedTaskId: volunteerTaskId, type: "TASK_UPDATED" },
      });
      expect(notification).toBeTruthy();
      expect(notification?.body).toContain("submitted progress");
    });

    it("should block Volunteer from updating a task they are not assigned to", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.volunteer });

      const payload = {
        note: "Attempting to update a task I am not assigned to by volunteer",
        progressPercent: 40,
      };

      const req = new Request(`http://localhost/api/v1/tasks/${taskId}/updates`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req, { params: Promise.resolve({ id: taskId }) });
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/tasks/[id]/updates/[uid]", () => {
    let updateId: string;

    beforeEach(async () => {
      // Create a pending update by volunteer
      const update = await testPrisma.taskUpdate.create({
        data: {
          taskId: volunteerTaskId,
          updatedById: TEST_USERS.volunteer.id,
          updateType: UpdateType.PROGRESS_UPDATE,
          previousStatus: TaskStatus.NOT_STARTED,
          newStatus: TaskStatus.IN_PROGRESS,
          previousProgress: 0,
          newProgress: 40,
          note: "Volunteer completed coding core structures for this task",
          approvalStatus: ApprovalStatus.PENDING,
        },
      });
      updateId = update.id;
    });

    it("should allow Organiser to APPROVE the update", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      const req = new Request(`http://localhost/api/v1/tasks/${volunteerTaskId}/updates/${updateId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "APPROVE" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: volunteerTaskId, uid: updateId }) });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.approvalStatus).toBe(ApprovalStatus.APPROVED);

      // Parent task must be updated
      const task = await testPrisma.task.findUnique({ where: { id: volunteerTaskId } });
      expect(task?.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task?.progressPercent).toBe(40);

      // Verify notification to volunteer
      const notification = await testPrisma.notification.findFirst({
        where: { recipientId: TEST_USERS.volunteer.id, type: "UPDATE_APPROVED" },
      });
      expect(notification).toBeTruthy();
    });

    it("should allow Organiser to REJECT the update with a reason", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      const req = new Request(`http://localhost/api/v1/tasks/${volunteerTaskId}/updates/${updateId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "REJECT", reason: "Please provide tests for your changes first." }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: volunteerTaskId, uid: updateId }) });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.approvalStatus).toBe(ApprovalStatus.REJECTED);
      expect(body.data.rejectionReason).toBe("Please provide tests for your changes first.");

      // Parent task must NOT be updated
      const task = await testPrisma.task.findUnique({ where: { id: volunteerTaskId } });
      expect(task?.status).toBe(TaskStatus.NOT_STARTED);
      expect(task?.progressPercent).toBe(0);

      // Verify notification to volunteer
      const notification = await testPrisma.notification.findFirst({
        where: { recipientId: TEST_USERS.volunteer.id, type: "UPDATE_REJECTED" },
      });
      expect(notification).toBeTruthy();
      expect(notification?.body).toContain("Please provide tests for your changes first.");
    });

    it("should reject rejection attempts without a reason", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      const req = new Request(`http://localhost/api/v1/tasks/${volunteerTaskId}/updates/${updateId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "REJECT" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: volunteerTaskId, uid: updateId }) });
      expect(res.status).toBe(400);
    });

    it("should block Volunteer from approving or rejecting updates", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.volunteer });

      const req = new Request(`http://localhost/api/v1/tasks/${volunteerTaskId}/updates/${updateId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "APPROVE" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: volunteerTaskId, uid: updateId }) });
      expect(res.status).toBe(403);
    });
  });
});
