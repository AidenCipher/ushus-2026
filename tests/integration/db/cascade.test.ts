import { testPrisma, TEST_USERS, truncateAllTables, seedTestUsers } from "../../setup/test-db";
import { TaskStatus, TaskPriority, EventStatus, RegistrationStatus, TeamRole, UpdateType, ApprovalStatus } from "@prisma/client";

describe("Database Cascading & Constraints Integration Tests", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await seedTestUsers();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("should cascade delete all tasks and event configurations when an Event is deleted", async () => {
    // 1. Create a task, registration, and team member associated with the organiser's event
    const eventId = TEST_USERS.organiser.eventId;
    
    // Validate event exists
    const event = await testPrisma.event.findUnique({ where: { id: eventId } });
    expect(event).toBeTruthy();

    // Create a task
    const task = await testPrisma.task.create({
      data: {
        title: "Task to delete",
        eventId: eventId,
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.MEDIUM,
      },
    });

    // Create a registration
    const registration = await testPrisma.registration.create({
      data: {
        userId: TEST_USERS.participant.id,
        eventId: eventId,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    // Create a team member
    const teamMember = await testPrisma.teamMember.create({
      data: {
        userId: TEST_USERS.volunteer.id,
        eventId: eventId,
        roleInTeam: TeamRole.VOLUNTEER,
      },
    });

    // Verify they exist in DB
    expect(await testPrisma.task.findUnique({ where: { id: task.id } })).toBeTruthy();
    expect(await testPrisma.registration.findUnique({ where: { id: registration.id } })).toBeTruthy();
    expect(await testPrisma.teamMember.findUnique({ where: { id: teamMember.id } })).toBeTruthy();

    // 2. Delete the Event
    await testPrisma.event.delete({ where: { id: eventId } });

    // 3. Verify cascading delete wiped all children elements
    expect(await testPrisma.event.findUnique({ where: { id: eventId } })).toBeNull();
    expect(await testPrisma.task.findUnique({ where: { id: task.id } })).toBeNull();
    expect(await testPrisma.registration.findUnique({ where: { id: registration.id } })).toBeNull();
    expect(await testPrisma.teamMember.findUnique({ where: { id: teamMember.id } })).toBeNull();
  });

  it("should prevent duplicate registrations for the same user and event combination (uniqueness constraint)", async () => {
    const eventId = TEST_USERS.organiser.eventId;
    const userId = TEST_USERS.participant.id;

    // Create first registration
    await testPrisma.registration.create({
      data: {
        userId,
        eventId,
        status: RegistrationStatus.PENDING,
      },
    });

    // Attempting to create second registration should fail due to unique constraint
    await expect(
      testPrisma.registration.create({
        data: {
          userId,
          eventId,
          status: RegistrationStatus.CONFIRMED,
        },
      })
    ).rejects.toThrow();
  });

  it("should cascade delete task updates when the parent Task is deleted", async () => {
    const eventId = TEST_USERS.organiser.eventId;
    
    // Create parent task
    const task = await testPrisma.task.create({
      data: {
        title: "Parent Task",
        eventId: eventId,
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.MEDIUM,
      },
    });

    // Create task update
    const update = await testPrisma.taskUpdate.create({
      data: {
        taskId: task.id,
        updatedById: TEST_USERS.organiser.id,
        updateType: UpdateType.PROGRESS_UPDATE,
        note: "This is a detailed update exceeding twenty characters limit",
        approvalStatus: ApprovalStatus.APPROVED,
      },
    });

    expect(await testPrisma.taskUpdate.findUnique({ where: { id: update.id } })).toBeTruthy();

    // Delete task
    await testPrisma.task.delete({ where: { id: task.id } });

    // Verify task update is gone
    expect(await testPrisma.taskUpdate.findUnique({ where: { id: update.id } })).toBeNull();
  });
});
