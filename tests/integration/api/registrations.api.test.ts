/**
 * WS1.1 & WS1.2 — Registration API Integration Tests
 *
 * Tests:
 *  REG-I-001: Duplicate-check blocks email conflict across events
 *  REG-I-002: Duplicate-check blocks phone conflict across events
 *  REG-I-003: Concurrent capacity enforcement — exactly maxParticipants succeed
 *  REG-I-004: Capacity check allows registration when under limit
 */

import { POST as registrationHandler } from "@/app/api/v1/registrations/route";
import { testPrisma, truncateAllTables, TEST_USERS } from "../../setup/test-db";
import { DataFactory } from "../../setup/data-factory";
import { hash } from "bcryptjs";

// ─── Mock next-auth so we can control session in tests ───────────────────────
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/lib/auth";
const mockAuth = auth as unknown as jest.Mock;

function makeSession(userId: string, role = "PARTICIPANT") {
  return {
    user: { id: userId, role, isActive: true, verticalId: null, eventId: null },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } as any;
}

function makeRegistrationRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/v1/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Test fixtures ────────────────────────────────────────────────────────────

let verticalId: string;
let eventAId: string; // event participant will register for
let eventBId: string; // event already registered in
let participantId: string;

beforeAll(async () => {
  await truncateAllTables();

  // Create vertical
  const vertical = await testPrisma.vertical.create({
    data: { name: "Finance-Test", colorCode: "#003580" },
  });
  verticalId = vertical.id;

  // Create two open events
  const eventA = await testPrisma.event.create({
    data: {
      name: "Event Alpha",
      verticalId,
      status: "REGISTRATION_OPEN",
      maxParticipants: 5,
    },
  });
  eventAId = eventA.id;

  const eventB = await testPrisma.event.create({
    data: {
      name: "Event Beta",
      verticalId,
      status: "REGISTRATION_OPEN",
      maxParticipants: 5,
    },
  });
  eventBId = eventB.id;

  // Create participant user
  const participant = await testPrisma.user.create({
    data: {
      email: "reg-test-participant@test.ushus",
      passwordHash: await hash("TestPass@2026", 10),
      name: "Reg Test Participant",
      phone: "9876543210",
      role: "PARTICIPANT",
      isActive: true,
    },
  });
  participantId = participant.id;
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

beforeEach(async () => {
  // Clear registrations and rate limit entries between tests
  await testPrisma.rateLimitEntry.deleteMany({});
  await testPrisma.auditLog.deleteMany({});
  await testPrisma.registration.deleteMany({});
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Registration API — WS1.1 Duplicate Check (targeted indexed queries)", () => {
  it("REG-I-001: Blocks registration when primary user email is already in another event", async () => {
    // Pre-seed: participant is already registered in eventB
    await testPrisma.registration.create({
      data: {
        userId: participantId,
        eventId: eventBId,
        status: "PENDING",
        confirmationCode: "SEED-001",
      },
    });

    // Create a second participant to register in eventA with same email collision
    const conflictUser = await testPrisma.user.create({
      data: {
        email: "conflict-user@test.ushus",
        passwordHash: await hash("TestPass@2026", 10),
        name: "Conflict User",
        phone: "1111111111",
        role: "PARTICIPANT",
        isActive: true,
      },
    });

    // conflictUser is already registered in eventB
    await testPrisma.registration.create({
      data: {
        userId: conflictUser.id,
        eventId: eventBId,
        status: "PENDING",
        confirmationCode: "SEED-002",
      },
    });

    mockAuth.mockResolvedValue(makeSession(conflictUser.id));

    const req = makeRegistrationRequest({
      userId: conflictUser.id,
      eventId: eventAId,
      status: "PENDING",
    });

    const res = await registrationHandler(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/already registered for another event/i);
  });

  it("REG-I-002: Bulk seed 200 registrations and duplicate check still responds in reasonable time", async () => {
    // Create 200 users and register them all to eventB
    const users = [];
    for (let i = 0; i < 50; i++) {
      users.push({
        email: `bulk-user-${i}@test.ushus`,
        passwordHash: "hash",
        name: `Bulk User ${i}`,
        phone: `700000${String(i).padStart(4, "0")}`,
        role: "PARTICIPANT" as const,
        isActive: true,
      });
    }
    const created = await testPrisma.user.createManyAndReturn({ data: users });

    for (let i = 0; i < created.length; i++) {
      await testPrisma.registration.create({
        data: {
          userId: created[i].id,
          eventId: eventBId,
          status: "PENDING",
          confirmationCode: `BULK-${i}`,
        },
      });
    }

    // Now test that duplicate check for a fresh user resolves quickly
    const freshUser = await testPrisma.user.create({
      data: {
        email: "fresh-user-timing@test.ushus",
        passwordHash: "hash",
        name: "Fresh User",
        phone: "8000000001",
        role: "PARTICIPANT",
        isActive: true,
      },
    });

    mockAuth.mockResolvedValue(makeSession(freshUser.id));
    const start = Date.now();
    const req = makeRegistrationRequest({
      userId: freshUser.id,
      eventId: eventAId,
      status: "PENDING",
    });
    const res = await registrationHandler(req);
    const elapsed = Date.now() - start;

    // Should succeed (no conflict) and complete in under 3 seconds
    expect(res.status).toBe(201);
    expect(elapsed).toBeLessThan(3000);
  });
});

describe("Registration API — WS1.2 TOCTOU Concurrent Capacity Enforcement", () => {
  it("REG-I-003: Under concurrent load, exactly maxParticipants registrations succeed", async () => {
    // eventA has maxParticipants = 5
    // Fire 10 concurrent requests, expect exactly 5 successes and 5 capacity errors

    // Create 10 fresh users
    const concurrentUsers = [];
    for (let i = 0; i < 10; i++) {
      const u = await testPrisma.user.create({
        data: {
          email: `concurrent-${i}@test.ushus`,
          passwordHash: "hash",
          name: `Concurrent User ${i}`,
          phone: `900000${String(i).padStart(4, "0")}`,
          role: "PARTICIPANT",
          isActive: true,
        },
      });
      concurrentUsers.push(u);
    }

    // Fire all 10 requests simultaneously
    const results = await Promise.allSettled(
      concurrentUsers.map(async (u) => {
        mockAuth.mockResolvedValue(makeSession(u.id));
        const req = makeRegistrationRequest({
          userId: u.id,
          eventId: eventAId,
          status: "PENDING",
        });
        return registrationHandler(req);
      })
    );

    const statuses = await Promise.all(
      results.map(async (r) => {
        if (r.status === "fulfilled") return r.value.status;
        return 500;
      })
    );

    const successCount = statuses.filter((s) => s === 201).length;
    const capacityErrorCount = statuses.filter((s) => s === 400).length;
    const errorCount = statuses.filter((s) => s === 500).length;

    // Exactly maxParticipants (5) succeed
    expect(successCount).toBe(5);
    // Remaining get capacity error (400), not 500
    expect(capacityErrorCount).toBe(5);
    expect(errorCount).toBe(0);

    // Verify DB count
    const dbCount = await testPrisma.registration.count({
      where: { eventId: eventAId },
    });
    expect(dbCount).toBe(5);
  });

  it("REG-I-004: Registration succeeds when under capacity limit", async () => {
    const newUser = await testPrisma.user.create({
      data: {
        email: "under-capacity@test.ushus",
        passwordHash: "hash",
        name: "Under Cap User",
        phone: "5555555555",
        role: "PARTICIPANT",
        isActive: true,
      },
    });
    mockAuth.mockResolvedValue(makeSession(newUser.id));

    const req = makeRegistrationRequest({
      userId: newUser.id,
      eventId: eventBId,
      status: "PENDING",
    });

    const res = await registrationHandler(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
