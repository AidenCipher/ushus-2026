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

  // ─── Create Verticals ─────────────────────────────────────────────────────
  console.log("📁 Creating verticals...");
  const verticals = await Promise.all([
    prisma.vertical.create({
      data: { id: uuid(), name: "Marketing", description: "Marketing strategy, advertising, and brand management events", colorCode: "#E63946" },
    }),
    prisma.vertical.create({
      data: { id: uuid(), name: "Finance", description: "Financial analysis, investment, and budgeting events", colorCode: "#2A9D8F" },
    }),
    prisma.vertical.create({
      data: { id: uuid(), name: "HR", description: "Human resources, talent management, and organisational behaviour events", colorCode: "#E9C46A" },
    }),
    prisma.vertical.create({
      data: { id: uuid(), name: "Operations", description: "Supply chain, process improvement, and logistics events", colorCode: "#264653" },
    }),
    prisma.vertical.create({
      data: { id: uuid(), name: "Entrepreneurship", description: "Startup ideation, business model innovation, and venture pitching events", colorCode: "#F4A261" },
    }),
  ]);
  const [marketing, finance, hr, operations, entrepreneurship] = verticals;

  // ─── Create Admin Users ────────────────────────────────────────────────────
  console.log("👤 Creating admin users...");
  const admins = await Promise.all([
    prisma.user.create({
      data: { id: uuid(), email: "abhinav@ushus2026.com", passwordHash, name: "Abhinav", role: Role.ADMIN, phone: "+91 98765 43210" },
    }),
    prisma.user.create({
      data: { id: uuid(), email: "aishwarya@ushus2026.com", passwordHash, name: "Aishwarya G.", role: Role.ADMIN, phone: "+91 98765 43211" },
    }),
    prisma.user.create({
      data: { id: uuid(), email: "faculty@christuniversity.in", passwordHash, name: "Dr. Ramesh Kumar", role: Role.ADMIN, phone: "+91 98765 43212" },
    }),
  ]);

  // ─── Create Organiser Users (1 per vertical) ──────────────────────────────
  console.log("👥 Creating organiser users...");
  const organisers = await Promise.all([
    prisma.user.create({
      data: { id: uuid(), email: "priya.marketing@ushus2026.com", passwordHash, name: "Priya Nair", role: Role.ORGANISER, verticalId: marketing.id, phone: "+91 99887 10001" },
    }),
    prisma.user.create({
      data: { id: uuid(), email: "arjun.finance@ushus2026.com", passwordHash, name: "Arjun Mehta", role: Role.ORGANISER, verticalId: finance.id, phone: "+91 99887 10002" },
    }),
    prisma.user.create({
      data: { id: uuid(), email: "kavya.hr@ushus2026.com", passwordHash, name: "Kavya Sharma", role: Role.ORGANISER, verticalId: hr.id, phone: "+91 99887 10003" },
    }),
    prisma.user.create({
      data: { id: uuid(), email: "rohit.ops@ushus2026.com", passwordHash, name: "Rohit Iyer", role: Role.ORGANISER, verticalId: operations.id, phone: "+91 99887 10004" },
    }),
    prisma.user.create({
      data: { id: uuid(), email: "ananya.entre@ushus2026.com", passwordHash, name: "Ananya Kulkarni", role: Role.ORGANISER, verticalId: entrepreneurship.id, phone: "+91 99887 10005" },
    }),
  ]);

  // ─── Create Volunteer Users (3 per vertical = 15) ─────────────────────────
  console.log("🙋 Creating volunteer users...");
  const volunteerNames = [
    ["Sneha Reddy", "Karthik Rao", "Meera Joshi"],
    ["Vikram Singh", "Pooja Gupta", "Siddharth Das"],
    ["Anjali Menon", "Rahul Pillai", "Divya Agarwal"],
    ["Varun Hegde", "Neha Bhat", "Aman Saxena"],
    ["Tanya Verma", "Nikhil Mohan", "Ritu Kapoor"],
  ];

  const volunteers: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  for (let v = 0; v < 5; v++) {
    for (let i = 0; i < 3; i++) {
      const name = volunteerNames[v][i];
      const email = `${name.toLowerCase().replace(/\s/g, ".")}@ushus2026.com`;
      const volunteer = await prisma.user.create({
        data: { id: uuid(), email, passwordHash: volunteerHash, name, role: Role.VOLUNTEER, verticalId: verticals[v].id },
      });
      volunteers.push(volunteer);
    }
  }

  // ─── Create Participant Users (8) ──────────────────────────────────────────
  console.log("🎓 Creating participant users...");
  const participantData = [
    { name: "Aditya Kumar", email: "aditya.kumar@student.com", college: "IIM Bangalore" },
    { name: "Riya Patel", email: "riya.patel@student.com", college: "XLRI Jamshedpur" },
    { name: "Mohammed Ashraf", email: "ashraf.m@student.com", college: "SIBM Pune" },
    { name: "Lakshmi Sundaram", email: "lakshmi.s@student.com", college: "NMIMS Mumbai" },
    { name: "Devesh Tiwari", email: "devesh.t@student.com", college: "MDI Gurgaon" },
    { name: "Shreya Banerjee", email: "shreya.b@student.com", college: "ISB Hyderabad" },
    { name: "Farhan Khan", email: "farhan.k@student.com", college: "Great Lakes Chennai" },
    { name: "Nithya Ramesh", email: "nithya.r@student.com", college: "Christ University" },
  ];

  const participants = await Promise.all(
    participantData.map((p) =>
      prisma.user.create({
        data: { id: uuid(), email: p.email, passwordHash: participantHash, name: p.name, role: Role.PARTICIPANT, college: p.college },
      })
    )
  );

  // ─── Create Events (2 per vertical = 10) ──────────────────────────────────
  console.log("🎪 Creating events...");
  const eventData = [
    { name: "Marketing Maverick", vertical: marketing, head: organisers[0], desc: "High-octane marketing strategy competition with live case studies.", venue: "Auditorium A", prize: "₹30,000", max: 100 },
    { name: "Ad Blitz", vertical: marketing, head: organisers[0], desc: "Full-scale advertising campaign creation and pitch.", venue: "Seminar Hall 1", prize: "₹25,000", max: 80 },
    { name: "Finvest League", vertical: finance, head: organisers[1], desc: "Simulated stock market trading and financial analysis.", venue: "Computer Lab 2", prize: "₹35,000", max: 120 },
    { name: "Budget Battlefield", vertical: finance, head: organisers[1], desc: "Corporate budgeting under pressure with conflicting priorities.", venue: "Seminar Hall 2", prize: "₹25,000", max: 80 },
    { name: "Talent Forge", vertical: hr, head: organisers[2], desc: "Immersive HR simulation with complex people management scenarios.", venue: "Conference Room A", prize: "₹30,000", max: 100 },
    { name: "Boardroom Blitz", vertical: hr, head: organisers[2], desc: "Rapid-fire HR case study competition.", venue: "Conference Room B", prize: "₹20,000", max: 60 },
    { name: "Supply Chain Sprint", vertical: operations, head: organisers[3], desc: "End-to-end supply chain optimisation simulation.", venue: "Computer Lab 1", prize: "₹30,000", max: 100 },
    { name: "Ops Matrix", vertical: operations, head: organisers[3], desc: "Process improvement and lean management challenge.", venue: "Seminar Hall 3", prize: "₹25,000", max: 80 },
    { name: "Startup Showdown", vertical: entrepreneurship, head: organisers[4], desc: "Pitch original business ideas to real VCs.", venue: "Main Auditorium", prize: "₹40,000", max: 150 },
    { name: "Venture Vault", vertical: entrepreneurship, head: organisers[4], desc: "Business model pivot and innovation challenge.", venue: "Seminar Hall 4", prize: "₹30,000", max: 100 },
  ];

  const events = await Promise.all(
    eventData.map((e) =>
      prisma.event.create({
        data: {
          id: uuid(),
          name: e.name,
          description: e.desc,
          verticalId: e.vertical.id,
          eventHeadId: e.head.id,
          dateStart: new Date("2026-11-20T09:00:00"),
          dateEnd: new Date("2026-11-21T18:00:00"),
          venue: e.venue,
          maxParticipants: e.max,
          registrationDeadline: new Date("2026-11-10T23:59:59"),
          prizePool: e.prize,
          status: EventStatus.REGISTRATION_OPEN,
        },
      })
    )
  );

  // ─── Update organisers with eventId ────────────────────────────────────────
  for (let i = 0; i < organisers.length; i++) {
    await prisma.user.update({
      where: { id: organisers[i].id },
      data: { eventId: events[i * 2].id },
    });
  }

  // ─── Create Team Members ──────────────────────────────────────────────────
  console.log("👥 Creating team members...");
  for (let v = 0; v < 5; v++) {
    // Organiser as EVENT_HEAD
    await prisma.teamMember.create({
      data: { userId: organisers[v].id, eventId: events[v * 2].id, roleInTeam: TeamRole.EVENT_HEAD, addedById: admins[0].id },
    });
    await prisma.teamMember.create({
      data: { userId: organisers[v].id, eventId: events[v * 2 + 1].id, roleInTeam: TeamRole.EVENT_HEAD, addedById: admins[0].id },
    });

    // Volunteers as team members
    for (let i = 0; i < 3; i++) {
      const vol = volunteers[v * 3 + i];
      const role = i === 0 ? TeamRole.SUB_HEAD : i === 1 ? TeamRole.CORE_VOLUNTEER : TeamRole.VOLUNTEER;
      await prisma.teamMember.create({
        data: { userId: vol.id, eventId: events[v * 2].id, roleInTeam: role, addedById: organisers[v].id },
      });
      if (i < 2) {
        await prisma.teamMember.create({
          data: { userId: vol.id, eventId: events[v * 2 + 1].id, roleInTeam: TeamRole.VOLUNTEER, addedById: organisers[v].id },
        });
      }
    }
  }

  // ─── Create Registrations ─────────────────────────────────────────────────
  console.log("📋 Creating registrations...");
  for (let p = 0; p < participants.length; p++) {
    const eventIndex1 = p % events.length;
    const eventIndex2 = (p + 3) % events.length;

    await prisma.registration.create({
      data: {
        userId: participants[p].id,
        eventId: events[eventIndex1].id,
        teamName: `Team ${participants[p].name.split(" ")[0]}`,
        teamMembers: [{ name: participants[p].name, email: participants[p].email, college: participantData[p].college }],
        status: RegistrationStatus.CONFIRMED,
      },
    });
    await prisma.registration.create({
      data: {
        userId: participants[p].id,
        eventId: events[eventIndex2].id,
        teamName: `Team ${participants[p].name.split(" ")[0]} B`,
        status: RegistrationStatus.CONFIRMED,
      },
    });
  }

  // ─── Create Tasks (50+) ───────────────────────────────────────────────────
  console.log("✅ Creating tasks...");
  const now = new Date();
  const day = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const taskTemplates = [
    // Marketing tasks
    { title: "Design event poster", vertIdx: 0, evtIdx: 0, vol: 0, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -14, end: -7 },
    { title: "Social media campaign plan", vertIdx: 0, evtIdx: 0, vol: 1, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 65, start: -7, end: 7 },
    { title: "Sponsor outreach — Marketing vertical", vertIdx: 0, evtIdx: 0, vol: 2, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, progress: 40, start: -10, end: 5 },
    { title: "Prepare case study content", vertIdx: 0, evtIdx: 0, vol: 0, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: 3, end: 14 },
    { title: "Arrange judging panel", vertIdx: 0, evtIdx: 0, vol: 1, status: TaskStatus.DELAYED, priority: TaskPriority.HIGH, progress: 20, start: -5, end: -1 },
    { title: "Create Ad Blitz brief document", vertIdx: 0, evtIdx: 1, vol: 0, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -20, end: -14 },
    { title: "Book venue for Ad Blitz", vertIdx: 0, evtIdx: 1, vol: 2, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -15, end: -10 },
    { title: "Print marketing materials", vertIdx: 0, evtIdx: 1, vol: 1, status: TaskStatus.BLOCKED, priority: TaskPriority.MEDIUM, progress: 10, start: -3, end: 5 },

    // Finance tasks
    { title: "Set up trading simulator", vertIdx: 1, evtIdx: 2, vol: 3, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, progress: 75, start: -10, end: 3 },
    { title: "Prepare stock datasets", vertIdx: 1, evtIdx: 2, vol: 4, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -14, end: -5 },
    { title: "Draft scoring rubric", vertIdx: 1, evtIdx: 2, vol: 5, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 50, start: -5, end: 7 },
    { title: "Contact industry mentors", vertIdx: 1, evtIdx: 2, vol: 3, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: 5, end: 15 },
    { title: "Budget Battlefield scenario creation", vertIdx: 1, evtIdx: 3, vol: 4, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 60, start: -7, end: 5 },
    { title: "Arrange projectors and screens", vertIdx: 1, evtIdx: 3, vol: 5, status: TaskStatus.DELAYED, priority: TaskPriority.MEDIUM, progress: 0, start: -3, end: 2 },

    // HR tasks
    { title: "Write HR simulation scenarios", vertIdx: 2, evtIdx: 4, vol: 6, status: TaskStatus.COMPLETED, priority: TaskPriority.CRITICAL, progress: 100, start: -21, end: -7 },
    { title: "Recruit role-play volunteers", vertIdx: 2, evtIdx: 4, vol: 7, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 80, start: -10, end: 3 },
    { title: "Prepare evaluation sheets", vertIdx: 2, evtIdx: 4, vol: 8, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: 5, end: 14 },
    { title: "Boardroom Blitz case studies", vertIdx: 2, evtIdx: 5, vol: 6, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 55, start: -8, end: 4 },
    { title: "Timer and scoring app setup", vertIdx: 2, evtIdx: 5, vol: 7, status: TaskStatus.BLOCKED, priority: TaskPriority.MEDIUM, progress: 15, start: -2, end: 6 },

    // Operations tasks
    { title: "Configure supply chain simulation", vertIdx: 3, evtIdx: 6, vol: 9, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, progress: 70, start: -12, end: 2 },
    { title: "Create logistics datasets", vertIdx: 3, evtIdx: 6, vol: 10, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -18, end: -8 },
    { title: "Set up team workstations", vertIdx: 3, evtIdx: 6, vol: 11, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: 7, end: 14 },
    { title: "Ops Matrix process map design", vertIdx: 3, evtIdx: 7, vol: 9, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 45, start: -6, end: 8 },
    { title: "Industry judge coordination", vertIdx: 3, evtIdx: 7, vol: 10, status: TaskStatus.DELAYED, priority: TaskPriority.HIGH, progress: 30, start: -8, end: -2 },

    // Entrepreneurship tasks
    { title: "Design pitch template", vertIdx: 4, evtIdx: 8, vol: 12, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -16, end: -10 },
    { title: "Invite VC panel judges", vertIdx: 4, evtIdx: 8, vol: 13, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, progress: 60, start: -10, end: 5 },
    { title: "Startup Showdown stage setup", vertIdx: 4, evtIdx: 8, vol: 14, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: 10, end: 18 },
    { title: "Prepare audience voting system", vertIdx: 4, evtIdx: 8, vol: 12, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 35, start: -3, end: 7 },
    { title: "Venture Vault company profiles", vertIdx: 4, evtIdx: 9, vol: 13, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 50, start: -8, end: 4 },
    { title: "Mentor matching spreadsheet", vertIdx: 4, evtIdx: 9, vol: 14, status: TaskStatus.COMPLETED, priority: TaskPriority.LOW, progress: 100, start: -12, end: -6 },

    // Cross-cutting tasks
    { title: "Overall fest logistics plan", vertIdx: 0, evtIdx: 0, vol: 0, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, progress: 55, start: -20, end: 10 },
    { title: "Volunteer briefing document", vertIdx: 1, evtIdx: 2, vol: 3, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -14, end: -7 },
    { title: "Emergency contact directory", vertIdx: 2, evtIdx: 4, vol: 6, status: TaskStatus.COMPLETED, priority: TaskPriority.LOW, progress: 100, start: -10, end: -5 },
    { title: "Photography team coordination", vertIdx: 3, evtIdx: 6, vol: 9, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: 12, end: 18 },
    { title: "Prize money procurement", vertIdx: 4, evtIdx: 8, vol: 12, status: TaskStatus.DELAYED, priority: TaskPriority.CRITICAL, progress: 25, start: -5, end: 0 },

    // Additional tasks to reach 50+
    { title: "Social media content calendar", vertIdx: 0, evtIdx: 0, vol: 1, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 40, start: -5, end: 10 },
    { title: "Registration desk setup", vertIdx: 1, evtIdx: 2, vol: 4, status: TaskStatus.NOT_STARTED, priority: TaskPriority.HIGH, progress: 0, start: 15, end: 18 },
    { title: "Participant welcome kits", vertIdx: 2, evtIdx: 4, vol: 7, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: 10, end: 17 },
    { title: "Catering arrangement", vertIdx: 3, evtIdx: 6, vol: 10, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 30, start: -3, end: 14 },
    { title: "Sound system testing", vertIdx: 4, evtIdx: 8, vol: 13, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: 16, end: 18 },
    { title: "Certificate design", vertIdx: 0, evtIdx: 1, vol: 2, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -18, end: -12 },
    { title: "Transport coordination", vertIdx: 1, evtIdx: 3, vol: 5, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: 14, end: 18 },
    { title: "First aid station setup", vertIdx: 2, evtIdx: 5, vol: 8, status: TaskStatus.NOT_STARTED, priority: TaskPriority.HIGH, progress: 0, start: 16, end: 18 },
    { title: "Wi-Fi capacity testing", vertIdx: 3, evtIdx: 7, vol: 11, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 50, start: -2, end: 5 },
    { title: "Closing ceremony planning", vertIdx: 4, evtIdx: 9, vol: 14, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: 5, end: 18 },
    { title: "Media coverage outreach", vertIdx: 0, evtIdx: 0, vol: 0, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 20, start: -4, end: 10 },
    { title: "Safety and security briefing", vertIdx: 3, evtIdx: 6, vol: 9, status: TaskStatus.NOT_STARTED, priority: TaskPriority.HIGH, progress: 0, start: 15, end: 18 },
    { title: "Feedback form creation", vertIdx: 2, evtIdx: 4, vol: 6, status: TaskStatus.COMPLETED, priority: TaskPriority.LOW, progress: 100, start: -7, end: -3 },
    { title: "Standee and banner design", vertIdx: 0, evtIdx: 1, vol: 1, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 70, start: -8, end: 2 },
    { title: "Rehearsal scheduling", vertIdx: 4, evtIdx: 8, vol: 12, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: 12, end: 17 },
  ];

  const createdTasks: Awaited<ReturnType<typeof prisma.task.create>>[] = [];
  for (const t of taskTemplates) {
    const task = await prisma.task.create({
      data: {
        id: uuid(),
        title: t.title,
        description: `Task: ${t.title} — assigned for USHUS 2026 fest preparation.`,
        verticalId: verticals[t.vertIdx].id,
        eventId: events[t.evtIdx].id,
        assignedToId: volunteers[t.vol].id,
        assignedById: organisers[t.vertIdx].id,
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

  // ─── Create Subtask Relationships (10) ─────────────────────────────────────
  console.log("🔗 Creating subtask relationships...");
  const subtaskPairs = [
    [0, 3], // "Design event poster" parent of "Prepare case study content"
    [1, 4], // "Social media campaign plan" parent of "Arrange judging panel"
    [8, 10], // "Set up trading simulator" parent of "Draft scoring rubric"
    [14, 16], // "Write HR simulation scenarios" parent of "Prepare evaluation sheets"
    [19, 21], // "Configure supply chain simulation" parent of "Set up team workstations"
    [24, 26], // "Design pitch template" parent of "Startup Showdown stage setup"
    [25, 27], // "Invite VC panel judges" parent of "Prepare audience voting system"
    [30, 35], // "Overall fest logistics plan" parent of "Social media content calendar"
    [5, 6], // "Create Ad Blitz brief" parent of "Book venue"
    [28, 29], // "Venture Vault company profiles" parent of "Mentor matching"
  ];

  for (const [parentIdx, childIdx] of subtaskPairs) {
    if (createdTasks[parentIdx] && createdTasks[childIdx]) {
      await prisma.task.update({
        where: { id: createdTasks[childIdx].id },
        data: { parentTaskId: createdTasks[parentIdx].id },
      });
    }
  }

  // ─── Create Dependencies (5) ──────────────────────────────────────────────
  console.log("🔗 Creating task dependencies...");
  const depPairs = [
    [0, 1], // Poster must be done before social media campaign
    [5, 7], // Ad Blitz brief before print materials
    [9, 10], // Stock datasets before scoring rubric
    [14, 15], // HR scenarios before recruiting role-play volunteers
    [20, 21], // Logistics datasets before workstation setup
  ];

  for (const [predIdx, succIdx] of depPairs) {
    if (createdTasks[predIdx] && createdTasks[succIdx]) {
      await prisma.task.update({
        where: { id: createdTasks[succIdx].id },
        data: { dependsOnIds: [createdTasks[predIdx].id] },
      });
    }
  }

  // ─── Create Task Updates (3+ per IN_PROGRESS task) ─────────────────────────
  console.log("📝 Creating task updates...");
  const inProgressTasks = createdTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.COMPLETED);

  for (const task of inProgressTasks) {
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
        approvedById: organisers[0].id,
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
        approvedById: organisers[0].id,
        approvedAt: day(-3),
        createdAt: day(-3),
      },
    });

    // Update 3: Latest note
    await prisma.taskUpdate.create({
      data: {
        taskId: task.id,
        updatedById: task.assignedToId!,
        updateType: UpdateType.NOTE_ADDED,
        note: "Continuing to work on this. Some blockers identified but working through them. Will reach out if I need help.",
        approvalStatus: task.status === TaskStatus.COMPLETED ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
        createdAt: day(-1),
      },
    });
  }

  // Add some rejected updates
  const delayedTasks = createdTasks.filter((t) => t.status === TaskStatus.DELAYED);
  for (const task of delayedTasks.slice(0, 3)) {
    await prisma.taskUpdate.create({
      data: {
        taskId: task.id,
        updatedById: task.assignedToId!,
        updateType: UpdateType.STATUS_CHANGE,
        previousStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.COMPLETED,
        note: "Marking as completed — all requirements have been met and deliverables submitted.",
        approvalStatus: ApprovalStatus.REJECTED,
        approvedById: organisers[0].id,
        approvedAt: day(-2),
        rejectionReason: "The deliverables do not meet the quality standards. Please review the requirements again and resubmit.",
        createdAt: day(-2),
      },
    });
  }

  // ─── Create Calendar Events (20) ──────────────────────────────────────────
  console.log("🗓 Creating calendar events...");
  const calendarData = [
    { title: "Team Kickoff Meeting", offset: 2, duration: 2, vertIdx: 0, evtIdx: 0 },
    { title: "Marketing Vertical Sync", offset: 5, duration: 1, vertIdx: 0, evtIdx: 0 },
    { title: "Finance Event Planning", offset: 7, duration: 2, vertIdx: 1, evtIdx: 2 },
    { title: "HR Scenario Review", offset: 10, duration: 3, vertIdx: 2, evtIdx: 4 },
    { title: "Ops Simulation Test Run", offset: 12, duration: 2, vertIdx: 3, evtIdx: 6 },
    { title: "Startup Pitch Rehearsal", offset: 14, duration: 2, vertIdx: 4, evtIdx: 8 },
    { title: "Sponsor Presentation Prep", offset: 16, duration: 1, vertIdx: 0, evtIdx: 1 },
    { title: "Budget Review Meeting", offset: 18, duration: 1, vertIdx: 1, evtIdx: 3 },
    { title: "All-Hands Progress Check", offset: 20, duration: 2, vertIdx: null, evtIdx: null },
    { title: "Venue Walkthrough", offset: 22, duration: 3, vertIdx: null, evtIdx: null },
    { title: "Volunteer Training Session 1", offset: 25, duration: 4, vertIdx: null, evtIdx: null },
    { title: "Volunteer Training Session 2", offset: 30, duration: 4, vertIdx: null, evtIdx: null },
    { title: "Tech Equipment Testing", offset: 35, duration: 2, vertIdx: 3, evtIdx: 6 },
    { title: "Judging Panel Briefing", offset: 38, duration: 2, vertIdx: null, evtIdx: null },
    { title: "Dress Rehearsal — Day 1 Events", offset: 42, duration: 6, vertIdx: null, evtIdx: null },
    { title: "Dress Rehearsal — Day 2 Events", offset: 44, duration: 6, vertIdx: null, evtIdx: null },
    { title: "Final All-Hands Before Fest", offset: 46, duration: 2, vertIdx: null, evtIdx: null },
    { title: "Registration Desk Setup", offset: 48, duration: 3, vertIdx: null, evtIdx: null },
    { title: "USHUS 2026 — Day 1", offset: 50, duration: 10, vertIdx: null, evtIdx: null },
    { title: "USHUS 2026 — Day 2 & Closing", offset: 51, duration: 10, vertIdx: null, evtIdx: null },
  ];

  for (const ce of calendarData) {
    const startDatetime = new Date(now.getTime() + ce.offset * 24 * 60 * 60 * 1000);
    startDatetime.setHours(9, 0, 0, 0);
    const endDatetime = new Date(startDatetime.getTime() + ce.duration * 60 * 60 * 1000);

    await prisma.calendarEvent.create({
      data: {
        title: ce.title,
        description: `${ce.title} — part of USHUS 2026 preparation.`,
        eventId: ce.evtIdx !== null ? events[ce.evtIdx].id : null,
        verticalId: ce.vertIdx !== null ? verticals[ce.vertIdx].id : null,
        startDatetime,
        endDatetime,
        status: ce.offset < 0 ? CalendarEventStatus.COMPLETED : CalendarEventStatus.PLANNED,
        createdById: admins[0].id,
        colorCode: ce.vertIdx !== null ? verticals[ce.vertIdx].colorCode : "#003580",
      },
    });
  }

  // ─── Create Notifications (10 per organiser) ──────────────────────────────
  console.log("🔔 Creating notifications...");
  const notifTypes: NotificationType[] = [
    NotificationType.TASK_ASSIGNED,
    NotificationType.TASK_UPDATED,
    NotificationType.UPDATE_APPROVED,
    NotificationType.REMINDER,
    NotificationType.ANNOUNCEMENT,
  ];

  for (const org of organisers) {
    for (let i = 0; i < 10; i++) {
      const type = notifTypes[i % notifTypes.length];
      await prisma.notification.create({
        data: {
          recipientId: org.id,
          senderId: i < 5 ? admins[0].id : volunteers[0].id,
          type,
          title: type === NotificationType.TASK_ASSIGNED ? "New task assigned to your team"
            : type === NotificationType.TASK_UPDATED ? "Task update requires your review"
            : type === NotificationType.UPDATE_APPROVED ? "Your task update was approved"
            : type === NotificationType.REMINDER ? "Task due tomorrow"
            : "New announcement from USHUS 2026 admin",
          body: type === NotificationType.TASK_ASSIGNED ? "A new task has been assigned in your vertical. Please review and delegate."
            : type === NotificationType.TASK_UPDATED ? "A volunteer submitted a progress update that needs your approval."
            : type === NotificationType.UPDATE_APPROVED ? "Your recent task update has been approved by the organiser."
            : type === NotificationType.REMINDER ? "You have a task due within the next 24 hours. Please ensure it is on track."
            : "Important: Updated guidelines for all event heads. Please review the latest announcement.",
          isRead: i < 3,
          relatedTaskId: createdTasks[i % createdTasks.length].id,
          createdAt: day(-i),
        },
      });
    }
  }

  // ─── Create Announcements ─────────────────────────────────────────────────
  console.log("📢 Creating announcements...");
  await prisma.announcement.create({
    data: {
      title: "Welcome to USHUS 2026!",
      body: "We are thrilled to announce the launch of the USHUS 2026 platform. All organisers and volunteers can now log in and start managing their events and tasks. Let us make this the best USHUS yet!",
      createdById: admins[0].id,
      isActive: true,
    },
  });
  await prisma.announcement.create({
    data: {
      title: "Registration Opens October 1",
      body: "Online registration via Google Forms will open on October 1, 2026. Please ensure all event details, rules, and prize information are finalised by September 25.",
      createdById: admins[1].id,
      targetRole: Role.ORGANISER,
      isActive: true,
    },
  });
  await prisma.announcement.create({
    data: {
      title: "Volunteer Training Schedule Released",
      body: "The volunteer training schedule is now available in the Calendar section. All volunteers must attend at least one training session before the fest. Sessions cover event protocols, safety procedures, and hospitality guidelines.",
      createdById: admins[0].id,
      targetRole: Role.VOLUNTEER,
      isActive: true,
    },
  });

  // ─── Create Audit Logs ────────────────────────────────────────────────────
  console.log("📋 Creating audit logs...");
  for (const admin of admins) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "LOGIN",
        ipAddress: "127.0.0.1",
      },
    });
  }

  console.log("\n✅ USHUS 2026 database seeded successfully!");
  console.log(`
  📊 Seed Summary:
  ─────────────────────
  Admins:        ${admins.length}
  Organisers:    ${organisers.length}
  Volunteers:    ${volunteers.length}
  Participants:  ${participants.length}
  Verticals:     ${verticals.length}
  Events:        ${events.length}
  Tasks:         ${createdTasks.length}
  Registrations: ${participants.length * 2}
  Calendar:      ${calendarData.length}
  
  🔑 Login Credentials:
  ─────────────────────
  Admin:       abhinav@ushus2026.com / Admin@2026
  Organiser:   priya.marketing@ushus2026.com / Admin@2026
  Volunteer:   sneha.reddy@ushus2026.com / Volunteer@2026
  Participant: aditya.kumar@student.com / Participant@2026
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
