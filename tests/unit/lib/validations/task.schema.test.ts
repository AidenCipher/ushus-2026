import { TaskCreateSchema, TaskUpdateSchema } from "@/lib/validations/task.schema";
import { TaskStatus, TaskPriority } from "@prisma/client";

describe("Task Validation Schema", () => {
  describe("TaskCreateSchema", () => {
    it("should accept valid task inputs", () => {
      const validTask = {
        title: "Test Task Title",
        description: "Valid description",
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.MEDIUM,
        startDate: new Date(2026, 0, 1),
        endDate: new Date(2026, 0, 10),
      };
      const result = TaskCreateSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it("should reject title shorter than 3 characters", () => {
      const invalidTask = {
        title: "Ab",
      };
      const result = TaskCreateSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Title must be at least 3 characters");
      }
    });

    it("should reject end date earlier than start date", () => {
      const invalidTask = {
        title: "Test Date Checks",
        startDate: new Date(2026, 0, 10),
        endDate: new Date(2026, 0, 1),
      };
      const result = TaskCreateSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("End date must be on or after start date");
      }
    });
  });

  describe("TaskUpdateSchema", () => {
    it("should allow partial updates", () => {
      const validUpdate = {
        status: TaskStatus.IN_PROGRESS,
        progressPercent: 45,
      };
      const result = TaskUpdateSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("should reject progressPercent > 100", () => {
      const invalidUpdate = {
        progressPercent: 101,
      };
      const result = TaskUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("should reject progressPercent < 0", () => {
      const invalidUpdate = {
        progressPercent: -5,
      };
      const result = TaskUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});
