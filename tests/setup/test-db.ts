import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// Database URL for tests should point to ushus_test
const testDbUrl = process.env.TEST_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ushus_test";
process.env.DATABASE_URL = testDbUrl;
process.env.DIRECT_URL = testDbUrl;

export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl,
    },
  },
});

export const TEST_USERS = {
  admin: {
    id: "test-admin-uuid",
    email: "admin@test.ushus",
    password: "AdminTest@2026",
    role: "ADMIN" as const,
    name: "Test Admin"
  },
  organiser: {
    id: "test-organiser-uuid",
    email: "organiser@test.ushus",
    password: "OrgTest@2026",
    role: "ORGANISER" as const,
    name: "Test Organiser",
    verticalId: "test-vertical-uuid",
    eventId: "test-event-uuid"
  },
  volunteer: {
    id: "test-volunteer-uuid",
    email: "volunteer@test.ushus",
    password: "VolTest@2026",
    role: "VOLUNTEER" as const,
    name: "Test Volunteer"
  },
  participant: {
    id: "test-participant-uuid",
    email: "participant@test.ushus",
    password: "PartTest@2026",
    role: "PARTICIPANT" as const,
    name: "Test Participant",
    college: "Test College"
  },
  otherOrganiser: {
    id: "test-other-org-uuid",
    email: "otherorg@test.ushus",
    password: "OtherOrg@2026",
    role: "ORGANISER" as const,
    name: "Other Organiser",
    verticalId: "test-other-vertical-uuid"
  }
};

export async function truncateAllTables() {
  const tableNames = [
    "audit_logs",
    "notifications",
    "rate_limit_entries",
    "announcements",
    "calendar_events",
    "task_updates",
    "tasks",
    "team_members",
    "registrations",
    "events",
    "users",
    "verticals"
  ];

  for (const tableName of tableNames) {
    try {
      await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
    } catch (e) {
      console.warn(`Truncating ${tableName} failed:`, e);
    }
  }
}

export async function seedTestUsers() {
  // Create Verticals first for Organisers
  await testPrisma.vertical.createMany({
    data: [
      { id: TEST_USERS.organiser.verticalId, name: "Marketing", colorCode: "#6366F1" },
      { id: TEST_USERS.otherOrganiser.verticalId, name: "Finance", colorCode: "#EC4899" }
    ],
    skipDuplicates: true,
  });

  // Create Events
  await testPrisma.event.createMany({
    data: [
      {
        id: TEST_USERS.organiser.eventId,
        name: "Marketing Maverick",
        verticalId: TEST_USERS.organiser.verticalId,
        status: "REGISTRATION_OPEN"
      }
    ],
    skipDuplicates: true,
  });

  // Seed standard users
  for (const user of Object.values(TEST_USERS)) {
    const passwordHash = await hash(user.password, 10);
    await testPrisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        verticalId: 'verticalId' in user ? user.verticalId : null,
        eventId: 'eventId' in user ? user.eventId : null,
        college: 'college' in user ? user.college : null,
        isActive: true,
      }
    });
  }

  // Update Event Head relations
  await testPrisma.event.update({
    where: { id: TEST_USERS.organiser.eventId },
    data: { eventHeadId: TEST_USERS.organiser.id }
  });
}

export async function seedTestEvent() {
  // Ensure base structure is set up
  await truncateAllTables();
  await seedTestUsers();

  // Create event details
  const teamId = "test-team-uuid";
  
  // Register Participant to Event
  await testPrisma.registration.create({
    data: {
      id: "test-reg-uuid",
      userId: TEST_USERS.participant.id,
      eventId: TEST_USERS.organiser.eventId,
      status: "CONFIRMED",
      confirmationCode: "CONF-MARKETING-1234",
      teamName: "Team Apex",
      teamMembers: JSON.stringify([TEST_USERS.participant.name])
    }
  });

  // Add Volunteer to Event Team
  await testPrisma.teamMember.create({
    data: {
      id: "test-teammember-uuid",
      userId: TEST_USERS.volunteer.id,
      eventId: TEST_USERS.organiser.eventId,
      roleInTeam: "VOLUNTEER",
      isActive: true
    }
  });
}

export async function resetDb() {
  await truncateAllTables();
  await seedTestUsers();
}
