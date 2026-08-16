/**
 * WS2 — Payment Verification API Integration Tests
 *
 * Tests:
 *  PAY-I-001: Participant submits payment → paymentStatus = SUBMITTED
 *  PAY-I-002: Organiser verifies → paymentStatus = VERIFIED, registration.status = CONFIRMED
 *  PAY-I-003: Organiser rejects → paymentStatus = REJECTED, registration.status = PENDING
 *  PAY-I-004: Resubmit after rejection is allowed
 *  PAY-I-005: Participant cannot verify their own payment
 *  PAY-I-006: Double-verification guard (409 on already VERIFIED)
 */

import { POST as paymentPost, PATCH as paymentPatch } from "@/app/api/v1/registrations/[id]/payment/route";
import { testPrisma, truncateAllTables, seedTestUsers, TEST_USERS } from "../../setup/test-db";

// ─── Mock dependencies ────────────────────────────────────────────────────────

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/email", () => ({
  sendPaymentSubmittedEmail: jest.fn().mockResolvedValue(true),
  sendPaymentOutcomeEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/pusher", () => ({
  getPusherServer: () => null, // no-op in tests
  PusherChannels: {
    organiserPaymentQueue: "organiser-payment-queue",
    userNotifications: (id: string) => `private-user-${id}`,
  },
  PusherEvents: {
    PAYMENT_SUBMITTED: "payment-submitted",
    PAYMENT_STATUS_UPDATED: "payment-status-updated",
  },
}));

import { auth } from "@/lib/auth";
const mockAuth = auth as unknown as jest.Mock;

function makeSession(userId: string, role = "PARTICIPANT", verticalId?: string) {
  return {
    user: { id: userId, role, isActive: true, verticalId: verticalId ?? null, eventId: null },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } as any;
}

// ─── Test fixtures ────────────────────────────────────────────────────────────

let registrationId: string;
let eventId: string;
let participantId: string;
let organiserId: string;

beforeAll(async () => {
  await truncateAllTables();
  await seedTestUsers();

  eventId = TEST_USERS.organiser.eventId!;
  participantId = TEST_USERS.participant.id;
  organiserId = TEST_USERS.organiser.id;

  // Create a registration for the participant
  const reg = await testPrisma.registration.create({
    data: {
      userId: participantId,
      eventId,
      status: "PENDING",
      confirmationCode: "PAY-TEST-001",
    },
  });
  registrationId = reg.id;
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

beforeEach(async () => {
  // Reset payment record between tests
  await testPrisma.payment.deleteMany({ where: { registrationId } });
  // Reset registration status to PENDING
  await testPrisma.registration.update({
    where: { id: registrationId },
    data: { status: "PENDING" },
  });
  await testPrisma.auditLog.deleteMany({});
});

// ─── Helper functions ─────────────────────────────────────────────────────────

function makePaymentRequest(body: object, method = "POST") {
  return new Request(`http://localhost/api/v1/registrations/${registrationId}/payment`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe("Payment API — WS2 Submit (POST)", () => {
  it("PAY-I-001: Participant can submit transaction reference", async () => {
    mockAuth.mockResolvedValue(makeSession(participantId));

    const req = makePaymentRequest({ transactionRef: "UPI/TXN/PAY001" });
    const res = await paymentPost(req, { params: Promise.resolve({ id: registrationId }) });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.paymentStatus).toBe("SUBMITTED");
    expect(body.data.transactionRef).toBe("UPI/TXN/PAY001");

    // Verify DB
    const dbPayment = await testPrisma.payment.findUnique({
      where: { registrationId },
    });
    expect(dbPayment?.paymentStatus).toBe("SUBMITTED");
  });

  it("PAY-I-001b: Transaction reference is required", async () => {
    mockAuth.mockResolvedValue(makeSession(participantId));
    const req = makePaymentRequest({ transactionRef: "" });
    const res = await paymentPost(req, { params: Promise.resolve({ id: registrationId }) });
    expect(res.status).toBe(400);
  });
});

describe("Payment API — WS2 Verify (PATCH)", () => {
  async function submitPayment() {
    mockAuth.mockResolvedValue(makeSession(participantId));
    const req = makePaymentRequest({ transactionRef: "UPI/TXN/VERIFY001" });
    await paymentPost(req, { params: Promise.resolve({ id: registrationId }) });
  }

  it("PAY-I-002: Organiser verifies → paymentStatus = VERIFIED and registration.status = CONFIRMED", async () => {
    await submitPayment();

    mockAuth.mockResolvedValue(
      makeSession(organiserId, "ORGANISER", TEST_USERS.organiser.verticalId)
    );
    const req = makePaymentRequest({ action: "VERIFY" }, "PATCH");
    const res = await paymentPatch(req, { params: Promise.resolve({ id: registrationId }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.paymentStatus).toBe("VERIFIED");

    // Verify registration status cascade
    const reg = await testPrisma.registration.findUnique({ where: { id: registrationId } });
    expect(reg?.status).toBe("CONFIRMED");
  });

  it("PAY-I-003: Organiser rejects → paymentStatus = REJECTED, registration stays PENDING", async () => {
    await submitPayment();

    mockAuth.mockResolvedValue(
      makeSession(organiserId, "ORGANISER", TEST_USERS.organiser.verticalId)
    );
    const req = makePaymentRequest(
      { action: "REJECT", rejectionReason: "Invalid transaction ID" },
      "PATCH"
    );
    const res = await paymentPatch(req, { params: Promise.resolve({ id: registrationId }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.paymentStatus).toBe("REJECTED");
    expect(body.data.rejectionReason).toBe("Invalid transaction ID");

    // Verify registration status stays PENDING
    const reg = await testPrisma.registration.findUnique({ where: { id: registrationId } });
    expect(reg?.status).toBe("PENDING");
  });

  it("PAY-I-004: Participant can resubmit after rejection", async () => {
    await submitPayment();

    // Organiser rejects
    mockAuth.mockResolvedValue(makeSession(organiserId, "ORGANISER", TEST_USERS.organiser.verticalId));
    const rejectReq = makePaymentRequest(
      { action: "REJECT", rejectionReason: "Wrong ref" },
      "PATCH"
    );
    await paymentPatch(rejectReq, { params: Promise.resolve({ id: registrationId }) });

    // Participant resubmits
    mockAuth.mockResolvedValue(makeSession(participantId));
    const resubmitReq = makePaymentRequest({ transactionRef: "UPI/TXN/RESUBMIT002" });
    const res = await paymentPost(resubmitReq, { params: Promise.resolve({ id: registrationId }) });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.paymentStatus).toBe("SUBMITTED");
    expect(body.data.transactionRef).toBe("UPI/TXN/RESUBMIT002");
    // Rejection reason should be cleared
    expect(body.data.rejectionReason).toBeNull();
  });

  it("PAY-I-005: Participant cannot verify their own payment", async () => {
    await submitPayment();

    // Participant tries to call PATCH (VERIFY)
    mockAuth.mockResolvedValue(makeSession(participantId, "PARTICIPANT"));
    const req = makePaymentRequest({ action: "VERIFY" }, "PATCH");
    const res = await paymentPatch(req, { params: Promise.resolve({ id: registrationId }) });

    expect(res.status).toBe(403);
  });

  it("PAY-I-006: Double-verification guard — 409 on already VERIFIED", async () => {
    await submitPayment();

    // First verification succeeds
    mockAuth.mockResolvedValue(makeSession(organiserId, "ORGANISER", TEST_USERS.organiser.verticalId));
    const first = makePaymentRequest({ action: "VERIFY" }, "PATCH");
    await paymentPatch(first, { params: Promise.resolve({ id: registrationId }) });

    // Participant tries to submit again after VERIFIED
    mockAuth.mockResolvedValue(makeSession(participantId));
    const resubmitAfterVerified = makePaymentRequest({ transactionRef: "UPI/TXN/AGAIN" });
    const res = await paymentPost(resubmitAfterVerified, {
      params: Promise.resolve({ id: registrationId }),
    });
    expect(res.status).toBe(409);

    // Organiser tries to verify again
    mockAuth.mockResolvedValue(makeSession(organiserId, "ORGANISER", TEST_USERS.organiser.verticalId));
    const second = makePaymentRequest({ action: "VERIFY" }, "PATCH");
    const res2 = await paymentPatch(second, { params: Promise.resolve({ id: registrationId }) });
    expect(res2.status).toBe(409);
  });
});
