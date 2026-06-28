import { GET, POST } from "@/app/api/v1/tasks/route";
import { auth } from "@/lib/auth";
import { testPrisma, TEST_USERS } from "../../setup/test-db";
import { TaskStatus, TaskPriority } from "@prisma/client";

// Mock next-auth, email, and pusher
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/email", () => ({
  sendTaskAssignmentEmail: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/pusher", () => ({
  sendPusherNotification: jest.fn().mockResolvedValue({}),
  PusherEvents: { NEW_NOTIFICATION: "new-notification" },
}));

describe("Tasks API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/tasks", () => {
    it("should reject unauthenticated requests", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const req = new Request("http://localhost/api/v1/tasks");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("should allow ADMIN to view all tasks", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.admin });

      // Create multiple tasks in different verticals
      await testPrisma.task.createMany({
        data: [
          { title: "Task 1", verticalId: "test-vertical-uuid", status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM },
          { title: "Task 2", verticalId: "test-other-vertical-uuid", status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM },
        ],
      });

      const req = new Request("http://localhost/api/v1/tasks");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
    });

    it("should scope tasks visibility for ORGANISER to their vertical", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      await testPrisma.task.createMany({
        data: [
          { title: "Task in Vertical", verticalId: TEST_USERS.organiser.verticalId, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM },
          { title: "Task in Other", verticalId: "test-other-vertical-uuid", status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM },
        ],
      });

      const req = new Request("http://localhost/api/v1/tasks");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      
      // Organiser must only see task in their vertical
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toBe("Task in Vertical");
    });
  });

  describe("POST /api/v1/tasks", () => {
    it("TASK-I-001: Allow ORGANISER to create a task in their vertical", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      const payload = {
        title: "Initial Budget Review",
        verticalId: TEST_USERS.organiser.verticalId,
        priority: TaskPriority.HIGH,
      };

      const req = new Request("http://localhost/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.title).toBe("Initial Budget Review");

      // Verify Audit Log creation
      const audit = await testPrisma.auditLog.findFirst({
        where: { userId: TEST_USERS.organiser.id, action: "CREATE_TASK" }
      });
      expect(audit).toBeTruthy();
    });

    it("TASK-I-002: Reject ORGANISER creating a task in another vertical", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.organiser });

      const payload = {
        title: "Intruder Vertical Task",
        verticalId: "test-other-vertical-uuid", // Different vertical
        priority: TaskPriority.HIGH,
      };

      const req = new Request("http://localhost/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("TASK-I-004: Reject VOLUNTEER from creating a task", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: TEST_USERS.volunteer });

      const payload = {
        title: "Volunteer Task Attempt",
        verticalId: "test-vertical-uuid",
      };

      const req = new Request("http://localhost/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
    });
  });
});
