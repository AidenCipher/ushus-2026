import { UserCreateSchema } from "@/lib/validations/user.schema";
import { Role } from "@prisma/client";

describe("User Validation Schema", () => {
  describe("UserCreateSchema", () => {
    it("should accept valid user inputs", () => {
      const validUser = {
        email: "test@college.edu",
        password: "SecurePassword@123",
        name: "Alice Smith",
        role: Role.PARTICIPANT,
      };
      const result = UserCreateSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email formatting", () => {
      const invalidUser = {
        email: "invalid-email-format",
        password: "SecurePassword@123",
        name: "Alice Smith",
      };
      const result = UserCreateSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("should reject password failing complexity regex", () => {
      const invalidUser = {
        email: "test@college.edu",
        password: "simplepassword", // no uppercase, numbers, special characters
        name: "Alice Smith",
      };
      const result = UserCreateSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password must contain uppercase, lowercase, number, and special character");
      }
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidUser = {
        email: "test@college.edu",
        password: "SecurePassword@123",
        name: "A",
      };
      const result = UserCreateSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });
});
