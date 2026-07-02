import { PrismaClient, Role, TeamRole, TaskStatus, TaskPriority, UpdateType, ApprovalStatus, NotificationType, EventStatus, RegistrationStatus, CalendarEventStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting USHUS 2026 database seed...\n");

  // ─── Clean existing data ──────────────────────────────────────────────────
  console.log("🧹 Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.taskUpdate.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vertical.deleteMany();
  await prisma.rateLimitEntry.deleteMany();

  const passwordHash = await hash("Admin@2026", 12);
  const volunteerHash = await hash("Volunteer@2026", 12);
  const participantHash = await hash("Participant@2026", 12);

  // ─── Create Event Verticals ─────────────────────────────────────────────────────
  console.log("📁 Creating event verticals...");
  const verticalsData = [
    { name: "Best Manager", description: "Best Manager event vertical", colorCode: "#E63946" },
    { name: "Best Management Team", description: "Best Management Team event vertical", colorCode: "#2A9D8F" },
    { name: "B Quiz", description: "B Quiz event vertical", colorCode: "#E9C46A" },
    { name: "Finance", description: "Finance event vertical", colorCode: "#264653" },
    { name: "Marketing", description: "Marketing event vertical", colorCode: "#F4A261" },
    { name: "Operations", description: "Operations event vertical", colorCode: "#8338EC" },
    { name: "HR", description: "HR event vertical", colorCode: "#3A86FF" },
    { name: "Business Analytics", description: "Business Analytics event vertical", colorCode: "#FF006E" },
    { name: "Sustainability", description: "Sustainability event vertical", colorCode: "#38B000" },
  ];

  const verticals = await Promise.all(
    verticalsData.map((v) =>
      prisma.vertical.create({
        data: { id: uuid(), name: v.name, description: v.description, colorCode: v.colorCode },
      })
    )
  );

  // Get index maps for easy reference
  const verticalMap: Record<string, typeof verticals[0]> = {};
  verticals.forEach(v => {
    verticalMap[v.name] = v;
  });

  const marketingVertical = verticalMap["Marketing"];

  // ─── Create EXACTLY 1 Admin User ───────────────────────────────────────────
  console.log("👤 Creating 1 admin user...");
  const admin = await prisma.user.create({
    data: { 
      id: uuid(), 
      email: "abhinav@ushus2026.com", 
      passwordHash, 
      name: "Abhinav", 
      role: Role.ADMIN, 
      phone: "+91 98765 43210" 
    },
  });

  // ─── Create EXACTLY 1 Organiser User ───────────────────────────────────────
  console.log("👥 Creating 1 organiser user...");
  const organiser = await prisma.user.create({
    data: {
      id: uuid(),
      email: "priya.marketing@ushus2026.com",
      passwordHash,
      name: "Priya Marketing",
      role: Role.ORGANISER,
      verticalId: marketingVertical.id,
      phone: "+91 99887 10001",
    },
  });

  // ─── Create EXACTLY 1 Volunteer User ───────────────────────────────────────
  console.log("🙋 Creating 1 volunteer user...");
  const volunteer = await prisma.user.create({
    data: { 
      id: uuid(), 
      email: "sneha.reddy@ushus2026.com", 
      passwordHash: volunteerHash, 
      name: "Sneha Reddy", 
      role: Role.VOLUNTEER, 
      verticalId: marketingVertical.id 
    },
  });

  // ─── Create EXACTLY 1 Participant User ─────────────────────────────────────
  console.log("🎓 Creating 1 participant user...");
  const participant = await prisma.user.create({
    data: { 
      id: uuid(), 
      email: "aditya.kumar@student.com", 
      passwordHash: participantHash, 
      name: "Aditya Kumar", 
      role: Role.PARTICIPANT, 
      college: "IIM Bangalore", 
      phone: "+91 98989 81234" 
    },
  });

  // ─── Create Events (9 events corresponding to verticals) ─────────────────────
  console.log("🎪 Creating events...");
  const baseFestDateStart = new Date("2026-11-06T09:00:00");
  const baseFestDateEnd = new Date("2026-11-07T18:00:00");
  const baseDeadline = new Date("2026-10-27T23:59:59");

  const eventData = [
    { name: "Best Manager", vertical: verticalMap["Best Manager"], head: null, desc: "The ultimate leadership and business acumen test.", venue: "Auditorium A", prize: "₹50,000", max: 50 },
    { name: "Best Management Team", vertical: verticalMap["Best Management Team"], head: null, desc: "Collaboration challenge testing group strategy.", venue: "Seminar Hall 1", prize: "₹40,000", max: 40 },
    { name: "B Quiz", vertical: verticalMap["B Quiz"], head: null, desc: "Corporate quiz bowl.", venue: "Auditorium B", prize: "₹20,000", max: 100 },
    { name: "Finance", vertical: verticalMap["Finance"], head: null, desc: "Asset valuations and portfolio defense.", venue: "Computer Lab 2", prize: "₹30,000", max: 80 },
    { name: "Marketing", vertical: verticalMap["Marketing"], head: organiser, desc: "Disruptive brand campaigns.", venue: "Seminar Hall 2", prize: "₹30,000", max: 80 },
    { name: "Operations", vertical: verticalMap["Operations"], head: null, desc: "Logistics bottlenecks and lean process design.", venue: "Computer Lab 1", prize: "₹30,000", max: 80 },
    { name: "HR", vertical: verticalMap["HR"], head: null, desc: "Negotiations and talent optimization.", venue: "Conference Room A", prize: "₹30,000", max: 60 },
    { name: "Business Analytics", vertical: verticalMap["Business Analytics"], head: null, desc: "Data insights and predictive modeling.", venue: "Computer Lab 3", prize: "₹30,000", max: 80 },
    { name: "Sustainability", vertical: verticalMap["Sustainability"], head: null, desc: "Carbon footprint and green strategy.", venue: "Seminar Hall 3", prize: "₹30,000", max: 60 },
  ];

  const events = await Promise.all(
    eventData.map((e) =>
      prisma.event.create({
        data: {
          id: uuid(),
          name: e.name,
          description: e.desc,
          verticalId: e.vertical.id,
          eventHeadId: e.head ? e.head.id : null,
          dateStart: baseFestDateStart,
          dateEnd: baseFestDateEnd,
          venue: e.venue,
          maxParticipants: e.max,
          registrationDeadline: baseDeadline,
          prizePool: e.prize,
          status: EventStatus.REGISTRATION_OPEN,
        },
      })
    )
  );

  const marketingEvent = events.find(e => e.name === "Marketing")!;

  // ─── Update organiser with eventId ────────────────────────────────────────
  await prisma.user.update({
    where: { id: organiser.id },
    data: { eventId: marketingEvent.id },
  });

  // ─── Create Team Members (Organiser and Volunteer) ────────────────────────
  console.log("👥 Creating team members...");
  // Link organiser as event head
  await prisma.teamMember.create({
    data: { userId: organiser.id, eventId: marketingEvent.id, roleInTeam: TeamRole.EVENT_HEAD, addedById: admin.id },
  });

  // Link volunteer to Marketing Event
  await prisma.teamMember.create({
    data: { userId: volunteer.id, eventId: marketingEvent.id, roleInTeam: TeamRole.VOLUNTEER, addedById: organiser.id },
  });

  // ─── Create Registrations ─────────────────────────────────────────────────
  console.log("📋 Creating registrations...");
  await prisma.registration.create({
    data: {
      userId: participant.id,
      eventId: marketingEvent.id,
      teamName: "Team Aditya",
      teamMembers: [{ name: participant.name, email: participant.email, phone: participant.phone || "+91 98989 81234", college: participant.college }],
      status: RegistrationStatus.CONFIRMED,
    },
  });

  // Also register for Best Manager
  const bestManagerEvent = events.find(e => e.name === "Best Manager")!;
  await prisma.registration.create({
    data: {
      userId: participant.id,
      eventId: bestManagerEvent.id,
      teamName: "Aditya BM",
      teamMembers: [{ name: participant.name, email: participant.email, phone: participant.phone || "+91 98989 81234", college: participant.college }],
      status: RegistrationStatus.CONFIRMED,
    },
  });

  // ─── Create Tasks (50+) ───────────────────────────────────────────────────
  console.log("✅ Creating tasks...");
  const day = (d: number) => {
    return new Date(baseFestDateStart.getTime() + d * 24 * 60 * 60 * 1000);
  };

  interface SeedTaskTemplate {
    title: string;
    vertIdx: number;
    evtIdx: number;
    status: TaskStatus;
    priority: TaskPriority;
    progress: number;
    start: number;
    end: number;
  }

  const taskTemplates: SeedTaskTemplate[] = [
    // Best Manager Vertical Tasks
    { title: "Design leadership rounds", vertIdx: 0, evtIdx: 0, status: TaskStatus.COMPLETED, priority: TaskPriority.CRITICAL, progress: 100, start: -30, end: -20 },
    { title: "Onboard judges for Best Manager", vertIdx: 0, evtIdx: 0, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 60, start: -15, end: -5 },
    { title: "Prepare strategy case study", vertIdx: 0, evtIdx: 0, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 50, start: -10, end: -1 },
    
    // Best Management Team Tasks
    { title: "Draft Best Management Team schedule", vertIdx: 1, evtIdx: 1, status: TaskStatus.NOT_STARTED, priority: TaskPriority.HIGH, progress: 0, start: -5, end: 0 },
    { title: "Reserve presentation rooms", vertIdx: 1, evtIdx: 1, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -25, end: -15 },

    // B Quiz Tasks
    { title: "Formulate B-Quiz round rules", vertIdx: 2, evtIdx: 2, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -20, end: -10 },
    { title: "Purchase buzzer system licenses", vertIdx: 2, evtIdx: 2, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 80, start: -8, end: -2 },

    // Finance Tasks
    { title: "Establish corporate sponsorship tier list", vertIdx: 3, evtIdx: 3, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -30, end: -15 },
    { title: "Draft budget spreadsheet", vertIdx: 3, evtIdx: 3, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, progress: 90, start: -12, end: -3 },

    // Marketing Tasks
    { title: "Configure quiz buzzers", vertIdx: 4, evtIdx: 4, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -22, end: -12 },
    { title: "Design social media banners", vertIdx: 4, evtIdx: 4, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 70, start: -10, end: -2 },

    // Operations Tasks
    { title: "Deliver lab computers configuration", vertIdx: 5, evtIdx: 5, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -18, end: -8 },
    { title: "Formulate logistics routes", vertIdx: 5, evtIdx: 5, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 40, start: -10, end: -1 },

    // HR Tasks
    { title: "Coordinate hotel bookings", vertIdx: 6, evtIdx: 6, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -25, end: -10 },
    { title: "Design guest greeting protocol", vertIdx: 6, evtIdx: 6, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 30, start: -12, end: -2 },

    // Business Analytics Tasks
    { title: "Print participant badges", vertIdx: 7, evtIdx: 7, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: -3, end: -1 },
    { title: "Deploy analytics dataset", vertIdx: 7, evtIdx: 7, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -20, end: -10 },

    // Sustainability Tasks
    { title: "Design digital certificates", vertIdx: 8, evtIdx: 8, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -15, end: -5 },
    { title: "Prepare recycle bins and decor", vertIdx: 8, evtIdx: 8, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 50, start: -8, end: -1 },
  ];

  // Duplicate to ensure 50+ total tasks
  const extraTemplates: typeof taskTemplates = [];
  for (let i = 0; i < 35; i++) {
    const template = taskTemplates[i % taskTemplates.length];
    extraTemplates.push({
      title: `${template.title} — Iteration ${Math.floor(i / taskTemplates.length) + 1}`,
      vertIdx: template.vertIdx,
      evtIdx: template.evtIdx,
      status: i % 3 === 0 ? TaskStatus.COMPLETED : i % 3 === 1 ? TaskStatus.IN_PROGRESS : TaskStatus.NOT_STARTED,
      priority: i % 4 === 0 ? TaskPriority.CRITICAL : i % 4 === 1 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
      progress: i % 3 === 0 ? 100 : i % 3 === 1 ? 40 : 0,
      start: template.start + 2,
      end: template.end + 2,
    });
  }

  const allTemplates = [...taskTemplates, ...extraTemplates];

  const createdTasks: Awaited<ReturnType<typeof prisma.task.create>>[] = [];
  for (let idx = 0; idx < allTemplates.length; idx++) {
    const t = allTemplates[idx];
    const task = await prisma.task.create({
      data: {
        id: uuid(),
        title: t.title,
        description: `Task: ${t.title} — assigned for USHUS 2026 fest preparation.`,
        verticalId: verticals[t.vertIdx].id,
        eventId: events[t.evtIdx].id,
        assignedToId: volunteer.id,
        assignedById: organiser.id,
        startDate: day(t.start),
        endDate: day(t.end),
        dueDate: day(t.end),
        status: t.status,
        priority: t.priority,
        progressPercent: t.progress,
      },
    });
    createdTasks.push(task);
  }
  console.log(`   Created ${createdTasks.length} tasks`);

  // ─── Create Subtask Relationships ─────────────────────────────────────
  console.log("🔗 Creating subtask relationships...");
  for (let i = 0; i < 15; i++) {
    const parentIdx = i;
    const childIdx = i + 15;
    if (createdTasks[parentIdx] && createdTasks[childIdx]) {
      await prisma.task.update({
        where: { id: createdTasks[childIdx].id },
        data: { parentTaskId: createdTasks[parentIdx].id },
      });
    }
  }

  // ─── Create Dependencies ──────────────────────────────────────────────
  console.log("🔗 Creating task dependencies...");
  for (let i = 0; i < 10; i++) {
    const predIdx = i;
    const succIdx = i + 20;
    if (createdTasks[predIdx] && createdTasks[succIdx]) {
      await prisma.task.update({
        where: { id: createdTasks[succIdx].id },
        data: { dependsOnIds: [createdTasks[predIdx].id] },
      });
    }
  }

  // ─── Create Task Updates ───────────────────────────────────────────────────
  console.log("📝 Creating task updates...");
  const inProgressTasks = createdTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.COMPLETED);

  for (const task of inProgressTasks.slice(0, 15)) {
    // Update 1: Started
    await prisma.taskUpdate.create({
      data: {
        taskId: task.id,
        updatedById: task.assignedToId!,
        updateType: UpdateType.STATUS_CHANGE,
        previousStatus: TaskStatus.NOT_STARTED,
        newStatus: TaskStatus.IN_PROGRESS,
        note: "Started working on this task. Will update progress regularly as milestones are reached.",
        approvalStatus: ApprovalStatus.APPROVED,
        approvedById: organiser.id,
        approvedAt: day(-5),
        createdAt: day(-5),
      },
    });

    // Update 2: Progress
    await prisma.taskUpdate.create({
      data: {
        taskId: task.id,
        updatedById: task.assignedToId!,
        updateType: UpdateType.PROGRESS_UPDATE,
        previousProgress: 0,
        newProgress: Math.floor(task.progressPercent / 2),
        note: "Making steady progress on this task. Halfway through the initial requirements. Need a few more days.",
        approvalStatus: ApprovalStatus.APPROVED,
        approvedById: organiser.id,
        approvedAt: day(-3),
        createdAt: day(-3),
      },
    });
  }

  // ─── Create Calendar Events (20 events) ──────────────────────────────────
  console.log("🗓 Creating calendar events...");
  const calendarData = [
    { title: "Team Kickoff Meeting 2026", offset: -30, duration: 2, vertIdx: 4, evtIdx: 4 },
    { title: "Registration Process Setup", offset: -25, duration: 2, vertIdx: 7, evtIdx: 7 },
    { title: "Finance Corporate outreach review", offset: -20, duration: 2, vertIdx: 3, evtIdx: 3 },
    { title: "Marketing Social design brainstorm", offset: -18, duration: 2, vertIdx: 4, evtIdx: 4 },
    { title: "Logistics checklist validation", offset: -15, duration: 3, vertIdx: 5, evtIdx: 5 },
    { title: "Creative art selection meeting", offset: -10, duration: 2, vertIdx: 8, evtIdx: 8 },
    { title: "Hospitality stays booking sync", offset: -8, duration: 2, vertIdx: 6, evtIdx: 6 },
    { title: "First-round analytics challenge check", offset: -5, duration: 2, vertIdx: 7, evtIdx: 7 },
    { title: "Best Manager round layout walkthrough", offset: -3, duration: 3, vertIdx: 0, evtIdx: 0 },
    { title: "Pre-event Volunteer briefing day", offset: -1, duration: 4, vertIdx: null, evtIdx: null },
    
    // Fest Day 1 & 2 events
    { title: "Inauguration Ceremony", offset: 0, duration: 1, vertIdx: null, evtIdx: null },
    { title: "Best Manager Round 1", offset: 0, duration: 3, vertIdx: 0, evtIdx: 0 },
    { title: "Finance Trading Challenge", offset: 0, duration: 3, vertIdx: 3, evtIdx: 3 },
    { title: "Marketing Presentation Pitch", offset: 0, duration: 3, vertIdx: 4, evtIdx: 4 },
    { title: "B Quiz Prelims", offset: 0, duration: 2, vertIdx: 2, evtIdx: 2 },
    { title: "Operations Case Defense", offset: 0, duration: 3, vertIdx: 5, evtIdx: 5 },
    { title: "HR Boardroom Simulation", offset: 1, duration: 4, vertIdx: 6, evtIdx: 6 },
    { title: "Business Analytics Submissions", offset: 1, duration: 3, vertIdx: 7, evtIdx: 7 },
    { title: "Sustainability Project Pitch", offset: 1, duration: 3, vertIdx: 8, evtIdx: 8 },
    { title: "Valedictory & Awards Ceremony", offset: 1, duration: 2, vertIdx: null, evtIdx: null },
  ];

  for (const ce of calendarData) {
    const startDatetime = day(ce.offset);
    startDatetime.setHours(9, 0, 0, 0);
    const endDatetime = new Date(startDatetime.getTime() + ce.duration * 60 * 60 * 1000);

    await prisma.calendarEvent.create({
      data: {
        title: ce.title,
        description: `${ce.title} — part of USHUS 2026 events and planning.`,
        eventId: ce.evtIdx !== null ? events[ce.evtIdx].id : null,
        verticalId: ce.vertIdx !== null ? verticals[ce.vertIdx].id : null,
        startDatetime,
        endDatetime,
        status: ce.offset < 0 ? CalendarEventStatus.COMPLETED : CalendarEventStatus.PLANNED,
        createdById: admin.id,
        colorCode: ce.vertIdx !== null ? verticals[ce.vertIdx].colorCode : "#003580",
      },
    });
  }

  // ─── Create Notifications ──────────────────────────────────────────────────
  console.log("🔔 Creating notifications...");
  await prisma.notification.create({
    data: {
      recipientId: organiser.id,
      senderId: admin.id,
      type: NotificationType.ANNOUNCEMENT,
      title: "Welcome to USHUS 2026 Dashboard!",
      body: "All systems are live. Please review tasks, assign team members, and check schedules.",
      isRead: false,
      createdAt: new Date(),
    },
  });

  // ─── Create Announcements ─────────────────────────────────────────────────
  console.log("📢 Creating announcements...");
  await prisma.announcement.create({
    data: {
      title: "Welcome to USHUS 2026!",
      body: "We are thrilled to launch the USHUS 2026 platform. All organisers, faculty coordinators, and volunteers are ready to roll. Let us build a spectacular show!",
      createdById: admin.id,
      isActive: true,
    },
  });

  // ─── Create Audit Logs ────────────────────────────────────────────────────
  console.log("📋 Creating audit logs...");
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "LOGIN",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("\n✅ USHUS 2026 database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
