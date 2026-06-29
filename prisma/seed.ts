import { PrismaClient, Role, TeamRole, TaskStatus, TaskPriority, UpdateType, ApprovalStatus, NotificationType, EventStatus, RegistrationStatus, CalendarEventStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting USHUS 2027 database seed...\n");

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
  const verticalsData = [
    { name: "Core Team", description: "Core leadership and faculty advisory", colorCode: "#E63946" },
    { name: "Registration Team", description: "Handles checkout, participant forms, and on-day registrations", colorCode: "#2A9D8F" },
    { name: "Sponsorship Team", description: "Corporate sponsors, funding, and finances", colorCode: "#E9C46A" },
    { name: "Marketing Team", description: "Social media outreach, advertising, and branding", colorCode: "#264653" },
    { name: "Logistics & Operations Team", description: "Logistics, operations, and venue management", colorCode: "#F4A261" },
    { name: "Creative Team", description: "Physical decorations, visual arts, and digital assets", colorCode: "#8338EC" },
    { name: "Hospitality Team", description: "Guest and participant hospitality, food, and stays", colorCode: "#3A86FF" },
  ];

  const verticals = await Promise.all(
    verticalsData.map((v) =>
      prisma.vertical.create({
        data: { id: uuid(), name: v.name, description: v.description, colorCode: v.colorCode },
      })
    )
  );

  const [coreTeam, regTeam, sponTeam, marketTeam, logTeam, creativeTeam, hospTeam] = verticals;

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
  const organisersData = [
    { email: "priya.core@ushus2026.com", name: "Priya Nair", verticalId: coreTeam.id },
    { email: "karthik.reg@ushus2026.com", name: "Karthik Rao", verticalId: regTeam.id },
    { email: "arjun.spon@ushus2026.com", name: "Arjun Mehta", verticalId: sponTeam.id },
    { email: "priya.marketing@ushus2026.com", name: "Priya Marketing", verticalId: marketTeam.id },
    { email: "rohit.ops@ushus2026.com", name: "Rohit Iyer", verticalId: logTeam.id },
    { email: "sneha.creative@ushus2026.com", name: "Sneha Sen", verticalId: creativeTeam.id },
    { email: "kavya.hosp@ushus2026.com", name: "Kavya Sharma", verticalId: hospTeam.id },
  ];

  const organisers = await Promise.all(
    organisersData.map((o, idx) =>
      prisma.user.create({
        data: {
          id: uuid(),
          email: o.email,
          passwordHash,
          name: o.name,
          role: Role.ORGANISER,
          verticalId: o.verticalId,
          phone: `+91 99887 1000${idx + 1}`,
        },
      })
    )
  );

  // ─── Create Volunteer Users (3 per vertical = 21) ─────────────────────────
  console.log("🙋 Creating volunteer users...");
  const volunteerNames = [
    ["V1 Core A", "V1 Core B", "V1 Core C"],
    ["V2 Reg A", "V2 Reg B", "V2 Reg C"],
    ["V3 Spon A", "V3 Spon B", "V3 Spon C"],
    ["V4 Market A", "V4 Market B", "V4 Market C"],
    ["V5 Log A", "V5 Log B", "V5 Log C"],
    ["V6 Creative A", "V6 Creative B", "V6 Creative C"],
    ["V7 Hosp A", "V7 Hosp B", "V7 Hosp C"],
  ];

  const volunteers: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  for (let v = 0; v < 7; v++) {
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
        data: { id: uuid(), email: p.email, passwordHash: participantHash, name: p.name, role: Role.PARTICIPANT, college: p.college, phone: `+91 98989 8${Math.floor(1000 + Math.random() * 9000)}` },
      })
    )
  );

  // ─── Create Events (9 events) ──────────────────────────────────────────────
  console.log("🎪 Creating events...");
  const baseFestDateStart = new Date("2027-11-06T09:00:00");
  const baseFestDateEnd = new Date("2027-11-07T18:00:00");
  const baseDeadline = new Date("2027-10-27T23:59:59");

  const eventData = [
    { name: "Best Manager", vertical: coreTeam, head: organisers[0], desc: "The ultimate leadership and business acumen test.", venue: "Auditorium A", prize: "₹50,000", max: 50 },
    { name: "Best Management Team", vertical: coreTeam, head: null, desc: "Collaboration challenge testing group strategy.", venue: "Seminar Hall 1", prize: "₹40,000", max: 40 },
    { name: "B Quiz", vertical: marketTeam, head: organisers[3], desc: "Corporate quiz bowl.", venue: "Auditorium B", prize: "₹20,000", max: 100 },
    { name: "Finance", vertical: sponTeam, head: organisers[2], desc: "Asset valuations and portfolio defense.", venue: "Computer Lab 2", prize: "₹30,000", max: 80 },
    { name: "Marketing", vertical: marketTeam, head: null, desc: "Disruptive brand campaigns.", venue: "Seminar Hall 2", prize: "₹30,000", max: 80 },
    { name: "Operations", vertical: logTeam, head: organisers[4], desc: "Logistics bottlenecks and lean process design.", venue: "Computer Lab 1", prize: "₹30,000", max: 80 },
    { name: "HR", vertical: hospTeam, head: organisers[6], desc: "Negotiations and talent optimization.", venue: "Conference Room A", prize: "₹30,000", max: 60 },
    { name: "Business Analytics", vertical: regTeam, head: organisers[1], desc: "Data insights and predictive modeling.", venue: "Computer Lab 3", prize: "₹30,000", max: 80 },
    { name: "Sustainability", vertical: creativeTeam, head: organisers[5], desc: "Carbon footprint and green strategy.", venue: "Seminar Hall 3", prize: "₹30,000", max: 60 },
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

  // ─── Update organisers with eventId ────────────────────────────────────────
  for (let idx = 0; idx < organisers.length; idx++) {
    // Core (0) handles Best Manager (0)
    // Reg (1) handles Business Analytics (7)
    // Spon (2) handles Finance (3)
    // Market (3) handles B Quiz (2)
    // Log (4) handles Operations (5)
    // Creative (5) handles Sustainability (8)
    // Hosp (6) handles HR (6)
    let eventIdx = 0;
    if (idx === 1) eventIdx = 7;
    else if (idx === 2) eventIdx = 3;
    else if (idx === 3) eventIdx = 2;
    else if (idx === 4) eventIdx = 5;
    else if (idx === 5) eventIdx = 8;
    else if (idx === 6) eventIdx = 6;

    await prisma.user.update({
      where: { id: organisers[idx].id },
      data: { eventId: events[eventIdx].id },
    });
  }

  // ─── Create Team Members ──────────────────────────────────────────────────
  console.log("👥 Creating team members...");
  // Link event heads
  for (let idx = 0; idx < organisers.length; idx++) {
    let eventIdx = 0;
    if (idx === 1) eventIdx = 7;
    else if (idx === 2) eventIdx = 3;
    else if (idx === 3) eventIdx = 2;
    else if (idx === 4) eventIdx = 5;
    else if (idx === 5) eventIdx = 8;
    else if (idx === 6) eventIdx = 6;

    await prisma.teamMember.create({
      data: { userId: organisers[idx].id, eventId: events[eventIdx].id, roleInTeam: TeamRole.EVENT_HEAD, addedById: admins[0].id },
    });
  }

  // Link volunteers to their vertical events
  // volunteers index mappings:
  // 0-2 (Core) -> Event 0, 1
  // 3-5 (Reg) -> Event 7
  // 6-8 (Spon) -> Event 3
  // 9-11 (Market) -> Event 2, 4
  // 12-14 (Log) -> Event 5
  // 15-17 (Creative) -> Event 8
  // 18-20 (Hosp) -> Event 6
  const volunteerMapping = [
    { volStart: 0, evts: [0, 1] },
    { volStart: 3, evts: [7] },
    { volStart: 6, evts: [3] },
    { volStart: 9, evts: [2, 4] },
    { volStart: 12, evts: [5] },
    { volStart: 15, evts: [8] },
    { volStart: 18, evts: [6] },
  ];

  for (const mapping of volunteerMapping) {
    const orgIdx = volunteerMapping.indexOf(mapping);
    for (let i = 0; i < 3; i++) {
      const vol = volunteers[mapping.volStart + i];
      const role = i === 0 ? TeamRole.SUB_HEAD : i === 1 ? TeamRole.CORE_VOLUNTEER : TeamRole.VOLUNTEER;
      for (const evtIdx of mapping.evts) {
        await prisma.teamMember.create({
          data: { userId: vol.id, eventId: events[evtIdx].id, roleInTeam: role, addedById: organisers[orgIdx].id },
        });
      }
    }
  }

  // ─── Create Registrations ─────────────────────────────────────────────────
  console.log("📋 Creating registrations...");
  for (let p = 0; p < participants.length; p++) {
    // Clean unique participant mapping to events
    const eventIndex1 = p % events.length;

    await prisma.registration.create({
      data: {
        userId: participants[p].id,
        eventId: events[eventIndex1].id,
        teamName: `Team ${participants[p].name.split(" ")[0]}`,
        teamMembers: [{ name: participants[p].name, email: participants[p].email, phone: participants[p].phone || `+91 99999 1111${p}`, college: participantData[p].college }],
        status: RegistrationStatus.CONFIRMED,
      },
    });
  }

  // ─── Create Tasks (50+) ───────────────────────────────────────────────────
  console.log("✅ Creating tasks...");
  const day = (d: number) => {
    // Relative to baseFestDateStart
    const date = new Date(baseFestDateStart.getTime() + d * 24 * 60 * 60 * 1000);
    return date;
  };

  interface SeedTaskTemplate {
    title: string;
    vertIdx: number;
    evtIdx: number;
    vol: number;
    status: TaskStatus;
    priority: TaskPriority;
    progress: number;
    start: number;
    end: number;
  }

  const taskTemplates: SeedTaskTemplate[] = [
    // Core team tasks (Best Manager & Best Management Team)
    { title: "Design leadership rounds", vertIdx: 0, evtIdx: 0, vol: 0, status: TaskStatus.COMPLETED, priority: TaskPriority.CRITICAL, progress: 100, start: -30, end: -20 },
    { title: "Onboard judges for Best Manager", vertIdx: 0, evtIdx: 0, vol: 1, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 60, start: -15, end: -5 },
    { title: "Prepare strategy case study", vertIdx: 0, evtIdx: 0, vol: 2, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 50, start: -10, end: -1 },
    { title: "Draft Best Management Team schedule", vertIdx: 0, evtIdx: 1, vol: 0, status: TaskStatus.NOT_STARTED, priority: TaskPriority.HIGH, progress: 0, start: -5, end: 0 },
    { title: "Reserve presentation rooms", vertIdx: 0, evtIdx: 1, vol: 1, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -25, end: -15 },

    // Registration Team tasks (Business Analytics)
    { title: "Deploy analytics dataset", vertIdx: 1, evtIdx: 7, vol: 3, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -20, end: -10 },
    { title: "Test submission portal", vertIdx: 1, evtIdx: 7, vol: 4, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, progress: 80, start: -8, end: -2 },
    { title: "Print participant badges", vertIdx: 1, evtIdx: 7, vol: 5, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: -3, end: -1 },

    // Sponsorship Team tasks (Finance)
    { title: "Establish corporate sponsorship tier list", vertIdx: 2, evtIdx: 3, vol: 6, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -30, end: -15 },
    { title: "Draft budget spreadsheet", vertIdx: 2, evtIdx: 3, vol: 7, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, progress: 90, start: -12, end: -3 },
    { title: "Verify transaction accounts", vertIdx: 2, evtIdx: 3, vol: 8, status: TaskStatus.NOT_STARTED, priority: TaskPriority.MEDIUM, progress: 0, start: -4, end: -1 },

    // Marketing Team tasks (B Quiz & Marketing)
    { title: "Configure quiz buzzers", vertIdx: 3, evtIdx: 2, vol: 9, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -22, end: -12 },
    { title: "Design social media banners", vertIdx: 3, evtIdx: 4, vol: 10, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 70, start: -10, end: -2 },
    { title: "Publish event promos on Insta", vertIdx: 3, evtIdx: 4, vol: 11, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: -5, end: 1 },

    // Logistics & Operations Team tasks (Operations)
    { title: "Deliver lab computers configuration", vertIdx: 4, evtIdx: 5, vol: 12, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -18, end: -8 },
    { title: "Formulate logistics routes", vertIdx: 4, evtIdx: 5, vol: 13, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 40, start: -10, end: -1 },
    { title: "Procure lean operation models", vertIdx: 4, evtIdx: 5, vol: 14, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: -3, end: 0 },

    // Creative Team tasks (Sustainability)
    { title: "Design digital certificates", vertIdx: 5, evtIdx: 8, vol: 15, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, progress: 100, start: -15, end: -5 },
    { title: "Prepare recycle bins and decor", vertIdx: 5, evtIdx: 8, vol: 16, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, progress: 50, start: -8, end: -1 },
    { title: "Construct green banner boards", vertIdx: 5, evtIdx: 8, vol: 17, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: -2, end: 0 },

    // Hospitality Team tasks (HR)
    { title: "Coordinate hotel bookings", vertIdx: 6, evtIdx: 6, vol: 18, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, progress: 100, start: -25, end: -10 },
    { title: "Design guest greeting protocol", vertIdx: 6, evtIdx: 6, vol: 19, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, progress: 30, start: -12, end: -2 },
    { title: "Arrange faculty dinner menu", vertIdx: 6, evtIdx: 6, vol: 20, status: TaskStatus.NOT_STARTED, priority: TaskPriority.LOW, progress: 0, start: -3, end: -1 },
  ];

  // We add duplicate entries to ensure 50+ tasks in total
  const extraTemplates: typeof taskTemplates = [];
  for (let i = 0; i < 30; i++) {
    const template = taskTemplates[i % taskTemplates.length];
    extraTemplates.push({
      title: `${template.title} — Iteration ${Math.floor(i / taskTemplates.length) + 1}`,
      vertIdx: template.vertIdx,
      evtIdx: template.evtIdx,
      vol: template.vol,
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
        description: `Task: ${t.title} — assigned for USHUS 2027 fest preparation.`,
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
  }

  // ─── Create Calendar Events (20 events) ──────────────────────────────────
  console.log("🗓 Creating calendar events...");
  const calendarData = [
    { title: "Team Kickoff Meeting 2027", offset: -30, duration: 2, vertIdx: 0, evtIdx: 0 },
    { title: "Registration Process Setup", offset: -25, duration: 2, vertIdx: 1, evtIdx: 7 },
    { title: "Finance Corporate outreach review", offset: -20, duration: 2, vertIdx: 2, evtIdx: 3 },
    { title: "Marketing Social design brainstorm", offset: -18, duration: 2, vertIdx: 3, evtIdx: 4 },
    { title: "Logistics checklist validation", offset: -15, duration: 3, vertIdx: 4, evtIdx: 5 },
    { title: "Creative art selection meeting", offset: -10, duration: 2, vertIdx: 5, evtIdx: 8 },
    { title: "Hospitality stays booking sync", offset: -8, duration: 2, vertIdx: 6, evtIdx: 6 },
    { title: "First-round analytics challenge check", offset: -5, duration: 2, vertIdx: 1, evtIdx: 7 },
    { title: "Best Manager round layout walkthrough", offset: -3, duration: 3, vertIdx: 0, evtIdx: 0 },
    { title: "Pre-event Volunteer briefing day", offset: -1, duration: 4, vertIdx: null, evtIdx: null },
    { title: "Inauguration ceremony", offset: 0, duration: 1, vertIdx: null, evtIdx: null },
    { title: "Best Manager round 1", offset: 0, duration: 4, vertIdx: 0, evtIdx: 0 },
    { title: "Finance trading challenge", offset: 0, duration: 3, vertIdx: 2, evtIdx: 3 },
    { title: "Marketing case studies presentation", offset: 0, duration: 3, vertIdx: 3, evtIdx: 4 },
    { title: "B Quiz prelims", offset: 0, duration: 2, vertIdx: 3, evtIdx: 2 },
    { title: "HR boardroom simulation", offset: 1, duration: 4, vertIdx: 6, evtIdx: 6 },
    { title: "Business Analytics submission review", offset: 1, duration: 3, vertIdx: 1, evtIdx: 7 },
    { title: "Sustainability pitch", offset: 1, duration: 3, vertIdx: 5, evtIdx: 8 },
    { title: "Best Management Team grand finals", offset: 1, duration: 4, vertIdx: 0, evtIdx: 1 },
    { title: "Valedictory & Awards ceremony", offset: 1, duration: 2, vertIdx: null, evtIdx: null },
  ];

  for (const ce of calendarData) {
    const startDatetime = day(ce.offset);
    startDatetime.setHours(9, 0, 0, 0);
    const endDatetime = new Date(startDatetime.getTime() + ce.duration * 60 * 60 * 1000);

    await prisma.calendarEvent.create({
      data: {
        title: ce.title,
        description: `${ce.title} — part of USHUS 2027 events and planning.`,
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

  // ─── Create Notifications ──────────────────────────────────────────────────
  console.log("🔔 Creating notifications...");
  for (const org of organisers) {
    await prisma.notification.create({
      data: {
        recipientId: org.id,
        senderId: admins[0].id,
        type: NotificationType.ANNOUNCEMENT,
        title: "Welcome to USHUS 2027 Dashboard!",
        body: "All systems are live. Please review tasks, assign team members, and check schedules.",
        isRead: false,
        createdAt: new Date(),
      },
    });
  }

  // ─── Create Announcements ─────────────────────────────────────────────────
  console.log("📢 Creating announcements...");
  await prisma.announcement.create({
    data: {
      title: "Welcome to USHUS 2027!",
      body: "We are thrilled to launch the USHUS 2027 platform. All organisers, faculty coordinators, and volunteers are ready to roll. Let us build a spectacular show!",
      createdById: admins[0].id,
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

  console.log("\n✅ USHUS 2027 database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
