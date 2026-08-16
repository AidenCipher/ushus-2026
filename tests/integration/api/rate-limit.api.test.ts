/**
 * WS1.3 — Rate Limit API Integration Tests
 *
 * Tests:
 *  RATE-I-001: Auth register endpoint returns 429 after RATE_LIMIT_REGISTER attempts
 *  RATE-I-002: Registration POST endpoint returns 429 after RATE_LIMIT_REG_POST attempts
 *  RATE-I-003: Rate limit resets after window expiry
 */

import { POST as registerHandler } from "@/app/api/v1/auth/register/route";
import { POST as registrationHandler } from "@/app/api/v1/registrations/route";
import { testPrisma, truncateAllTables } from "../../setup/test-db";
import { RateLimits } from "@/lib/rate-limit";

// ─── Mock next-auth ───────────────────────────────────────────────────────────
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/lib/auth";
const mockAuth = auth as unknown as jest.Mock;

// ─── Mock system config to allow registrations ────────────────────────────────
jest.mock("@/lib/system_config", () => ({
  getSystemConfig: () => ({
    phase: "pre-event",
    maxReg: "50",
    allowReg: true,
    maintenance: false,
    festStartDate: "2026-11-04",
    paymentLink: "",
  }),
}));

const TEST_IP = "127.0.99.1"; // unique IP to avoid cross-test pollution

beforeAll(async () => {
  await truncateAllTables();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

beforeEach(async () => {
  // Clear rate limit entries between tests
  await testPrisma.rateLimitEntry.deleteMany({});
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Rate Limiting — WS1.3", () => {
  describe("RATE-I-001: /api/v1/auth/register endpoint", () => {
    it("Returns 429 after RATE_LIMIT_REGISTER + 1 requests from same IP", async () => {
      const limit = RateLimits.REGISTER; // defaults to 10

      const responses: Response[] = [];
      for (let i = 0; i <= limit; i++) {
        const req = new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": TEST_IP,
          },
          // Use unique emails to avoid 409 conflicts — we're testing rate limiting, not duplicate check
          body: JSON.stringify({
            email: `rate-test-register-${i}@unique${i}.edu`,
            password: "SecurePass@2026",
            name: `Rate Test ${i}`,
          }),
        });
        responses.push(await registerHandler(req));
      }

      const statuses = responses.map((r) => r.status);
      const successOrOtherCount = statuses.filter((s) => s !== 429).length;
      const rateLimitedCount = statuses.filter((s) => s === 429).length;

      // First `limit` requests should be allowed (201 or other non-429)
      expect(successOrOtherCount).toBe(limit);
      // The (limit + 1)th request should be rate-limited
      expect(rateLimitedCount).toBe(1);

      // Verify the 429 response has proper structure
      const lastResponse = responses[responses.length - 1];
      const body = await lastResponse.json();
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/too many requests/i);
      expect(typeof body.retryAfterSeconds).toBe("number");
      expect(body.retryAfterSeconds).toBeGreaterThan(0);

      // Verify Retry-After header is set
      expect(lastResponse.headers.get("Retry-After")).toBeTruthy();
    });
  });

  describe("RATE-I-002: /api/v1/registrations POST endpoint", () => {
    it("Returns 429 after RATE_LIMIT_REG_POST + 1 requests from same user", async () => {
      const limit = RateLimits.REGISTRATION_POST; // defaults to 20

      // Create a vertical and event for the requests
      const vertical = await testPrisma.vertical.create({
        data: { name: "Rate-Test-Vertical", colorCode: "#aabbcc" },
      });
      const event = await testPrisma.event.create({
        data: {
          name: "Rate Test Event",
          verticalId: vertical.id,
          status: "REGISTRATION_OPEN",
        },
      });
      const user = await testPrisma.user.create({
        data: {
          email: `rate-reg-user@test.ushus`,
          passwordHash: "hash",
          name: "Rate Reg User",
          phone: "6000000001",
          role: "PARTICIPANT",
          isActive: true,
        },
      });

      mockAuth.mockResolvedValue({
        user: { id: user.id, role: "PARTICIPANT", isActive: true, verticalId: null, eventId: null },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any);

      const responses: Response[] = [];
      for (let i = 0; i <= limit; i++) {
        const req = new Request("http://localhost/api/v1/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            eventId: event.id,
            status: "PENDING",
          }),
        });
        responses.push(await registrationHandler(req));
      }

      const statuses = responses.map((r) => r.status);
      const rateLimitedCount = statuses.filter((s) => s === 429).length;

      // At least 1 request should be rate-limited
      expect(rateLimitedCount).toBeGreaterThanOrEqual(1);

      // The very last request (index limit) should be 429
      expect(responses[limit].status).toBe(429);
    });
  });

  describe("RATE-I-003: Rate limit window expiry", () => {
    it("After window expiry, requests are allowed again", async () => {
      const limit = RateLimits.REGISTER;

      // Exhaust the limit
      for (let i = 0; i < limit; i++) {
        const req = new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "127.0.99.2",
          },
          body: JSON.stringify({
            email: `expiry-test-${i}@unique${i}.edu`,
            password: "SecurePass@2026",
            name: `Expiry Test ${i}`,
          }),
        });
        await registerHandler(req);
      }

      // Simulate window expiry by manually expiring all rate limit entries
      await testPrisma.rateLimitEntry.updateMany({
        where: { key: `register:127.0.99.2` },
        data: { expiresAt: new Date(Date.now() - 1000) }, // 1 second in the past
      });

      // Now a fresh request should be allowed
      const freshReq = new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "127.0.99.2",
        },
        body: JSON.stringify({
          email: "expiry-fresh@unique.edu",
          password: "SecurePass@2026",
          name: "Fresh After Expiry",
        }),
      });
      const freshRes = await registerHandler(freshReq);
      expect(freshRes.status).not.toBe(429);
    });
  });
});
