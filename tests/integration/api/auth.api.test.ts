import { authConfig } from "@/lib/auth";
import { POST as registerHandler } from "@/app/api/v1/auth/register/route";
import { testPrisma } from "../../setup/test-db";
import { hash } from "bcryptjs";

const credentialsProvider = authConfig.providers.find(p => p.name === "Credentials") as any;

describe("Auth API Integration Tests", () => {
  describe("NextAuth Authorize Callback", () => {
    it("AUTH-I-001: Successful login as ADMIN returns user object & logs audit", async () => {
      // Find the admin user seeded in db
      const admin = await testPrisma.user.findUnique({ where: { email: "admin@test.ushus" } });
      expect(admin).toBeTruthy();

      const result = await credentialsProvider.authorize({
        email: "admin@test.ushus",
        password: "AdminTest@2026",
        clientIp: "127.0.0.1",
      });

      expect(result).toHaveProperty("role", "ADMIN");
      expect(result).toHaveProperty("email", "admin@test.ushus");
      expect(result).not.toHaveProperty("passwordHash");

      // Verify audit log creation
      const audit = await testPrisma.auditLog.findFirst({
        where: { userId: admin!.id, action: "LOGIN" }
      });
      expect(audit).toBeTruthy();
    });

    it("AUTH-I-006: Wrong password fails authorization", async () => {
      await expect(
        credentialsProvider.authorize({
          email: "admin@test.ushus",
          password: "WrongPassword!",
          clientIp: "127.0.0.1",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("AUTH-I-007: Non-existent email fails with generic message", async () => {
      await expect(
        credentialsProvider.authorize({
          email: "nonexistent@test.ushus",
          password: "SomePassword!",
          clientIp: "127.0.0.1",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("AUTH-I-012: Inactive account login attempt fails", async () => {
      // Deactivate organiser
      await testPrisma.user.update({
        where: { email: "organiser@test.ushus" },
        data: { isActive: false }
      });

      await expect(
        credentialsProvider.authorize({
          email: "organiser@test.ushus",
          password: "OrgTest@2026",
          clientIp: "127.0.0.1",
        })
      ).rejects.toThrow(/deactivated/);
    });
  });

  describe("Register API Endpoint", () => {
    it("AUTH-I-004: Create participant account via register endpoint", async () => {
      const payload = {
        email: "newparticipant@college.edu",
        password: "SecurePass@2026",
        name: "New Joiner",
        phone: "1234567890",
        college: "Christ University"
      };

      const req = new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(201);
      
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty("email", "newparticipant@college.edu");
    });

    it("AUTH-I-008: Reject registration with duplicate email", async () => {
      const payload = {
        email: "participant@test.ushus", // already exists
        password: "SecurePass@2026",
        name: "Duplicate User",
      };

      const req = new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(409);
    });
  });
});
