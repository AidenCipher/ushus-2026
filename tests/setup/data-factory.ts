import { faker } from "@faker-js/faker";
import { TaskStatus, TaskPriority, Role, ApprovalStatus, UpdateType, EventStatus, RegistrationStatus } from "@prisma/client";

export const DataFactory = {
  user(overrides = {}) {
    return {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      passwordHash: "bcrypt-hash-placeholder",
      phone: faker.phone.number(),
      college: faker.company.name(),
      role: Role.PARTICIPANT,
      isActive: true,
      ...overrides,
    };
  },

  vertical(overrides = {}) {
    return {
      name: `${faker.company.buzzNoun()} ${faker.string.alphanumeric(5)}`,
      description: faker.company.catchPhrase(),
      colorCode: faker.color.rgb(),
      ...overrides,
    };
  },

  event(verticalId: string, overrides = {}) {
    return {
      name: `${faker.word.adjective()} Competition`,
      description: faker.lorem.paragraph(),
      verticalId,
      maxParticipants: faker.number.int({ min: 10, max: 100 }),
      prizePool: "Rs. 50,000",
      status: EventStatus.REGISTRATION_OPEN,
      ...overrides,
    };
  },

  task(verticalId?: string, eventId?: string, overrides = {}) {
    return {
      title: faker.lorem.words(3).substring(0, 50),
      description: faker.lorem.sentence(),
      verticalId,
      eventId,
      status: TaskStatus.NOT_STARTED,
      priority: TaskPriority.MEDIUM,
      progressPercent: 0,
      ...overrides,
    };
  },

  taskUpdate(taskId: string, updatedById: string, overrides = {}) {
    return {
      taskId,
      updatedById,
      updateType: UpdateType.PROGRESS_UPDATE,
      note: faker.lorem.sentence(10), // minimum 20 characters
      approvalStatus: ApprovalStatus.PENDING,
      ...overrides,
    };
  },

  registration(userId: string, eventId: string, overrides = {}) {
    return {
      userId,
      eventId,
      teamName: faker.science.chemicalElement().name,
      status: RegistrationStatus.PENDING,
      confirmationCode: faker.string.alphanumeric(10).toUpperCase(),
      ...overrides,
    };
  },

  calendarEvent(createdById: string, overrides = {}) {
    return {
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      startDatetime: new Date(),
      endDatetime: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 hours
      createdById,
      ...overrides,
    };
  },

  announcement(createdById: string, overrides = {}) {
    return {
      title: faker.lorem.sentence(4),
      body: faker.lorem.paragraph(),
      createdById,
      isActive: true,
      ...overrides,
    };
  }
};
