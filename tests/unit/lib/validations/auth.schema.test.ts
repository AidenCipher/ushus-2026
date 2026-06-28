import { LoginSchema, ResetPasswordSchema } from "@/lib/validations/auth.schema";

describe("Auth Validation Schemas", () => {
  describe("LoginSchema", () => {
    it("should accept valid credentials", () => {
      const validCreds = {
        email: "admin@test.ushus",
        password: "AdminPassword@123",
      };
      const result = LoginSchema.safeParse(validCreds);
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const invalidCreds = {
        email: "admin@test.ushus",
        password: "",
      };
      const result = LoginSchema.safeParse(invalidCreds);
      expect(result.success).toBe(false);
    });
  });

  describe("ResetPasswordSchema", () => {
    it("should accept matching passwords and token", () => {
      const validReset = {
        token: "some-reset-token",
        password: "NewPassword@2026",
        confirmPassword: "NewPassword@2026",
      };
      const result = ResetPasswordSchema.safeParse(validReset);
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const invalidReset = {
        token: "some-reset-token",
        password: "NewPassword@2026",
        confirmPassword: "DifferentPassword@2026",
      };
      const result = ResetPasswordSchema.safeParse(invalidReset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });
  });
});
