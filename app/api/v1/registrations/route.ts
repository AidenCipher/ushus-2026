import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RegistrationCreateSchema } from "@/lib/validations/registration.schema";
import { hasPermission } from "@/lib/permissions";
import type { Prisma, Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view"); // "my" or "all"
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const where: Prisma.RegistrationWhereInput = {};

    // Determine visibility based on role
    if (userRole === "PARTICIPANT" || view === "my") {
      where.userId = session.user.id;
    } else if (userRole === "VOLUNTEER" || userRole === "ORGANISER") {
      // Organisers/Volunteers can see registrations for their event/vertical
      // This might need refinement based on exact requirements, but generally they see their own event
      where.event = { verticalId: session.user.verticalId || undefined };
    }

    if (eventId) where.eventId = eventId;
    if (status) where.status = status as any;

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        event: { select: { name: true, dateStart: true, vertical: { select: { name: true } } } },
        user: { select: { name: true, email: true, college: true } },
      },
      orderBy: { registrationDate: "desc" },
    });

    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("[Registrations GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = RegistrationCreateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // A participant can only register themselves unless admin
    const userRole = session.user.role as Role;
    if (data.userId !== session.user.id && userRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Check if event exists and registration is open
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "REGISTRATION_OPEN") {
      return NextResponse.json({ success: false, error: "Registration is not open for this event" }, { status: 400 });
    }

    // Check if already registered
    const existing = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: data.userId,
          eventId: data.eventId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Already registered for this event" }, { status: 409 });
    }

    const primaryUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!primaryUser) {
      return NextResponse.json({ success: false, error: "Primary user not found" }, { status: 404 });
    }

    // Build the list of contacts to check for conflict in other events
    const checks = [
      { name: primaryUser.name, email: primaryUser.email.toLowerCase(), phone: primaryUser.phone || "" }
    ];

    if (data.teamMembers && Array.isArray(data.teamMembers)) {
      for (const member of data.teamMembers) {
        checks.push({
          name: member.name,
          email: member.email.toLowerCase(),
          phone: member.phone || ""
        });
      }
    }

    const cleanPhone = (p: string) => p.replace(/[\s\-()]/g, "");

    // Fetch all registrations for other events
    const otherRegistrations = await prisma.registration.findMany({
      where: {
        eventId: { not: data.eventId }
      },
      include: {
        event: true,
        user: true
      }
    });

    for (const item of checks) {
      const itemPhoneClean = cleanPhone(item.phone);

      for (const reg of otherRegistrations) {
        const regUserEmail = reg.user.email.toLowerCase();
        const regUserPhone = reg.user.phone ? cleanPhone(reg.user.phone) : "";

        if (regUserEmail === item.email) {
          return NextResponse.json({
            success: false,
            error: `Registration blocked: "${item.name}" (email: ${item.email}) is already registered for another event: "${reg.event.name}".`
          }, { status: 409 });
        }

        if (itemPhoneClean && regUserPhone && regUserPhone === itemPhoneClean) {
          return NextResponse.json({
            success: false,
            error: `Registration blocked: "${item.name}" (phone: ${item.phone}) is already registered for another event: "${reg.event.name}".`
          }, { status: 409 });
        }

        if (reg.teamMembers && Array.isArray(reg.teamMembers)) {
          const membersList = reg.teamMembers as any[];
          for (const m of membersList) {
            const mEmail = m.email ? m.email.toLowerCase() : "";
            const mPhone = m.phone ? cleanPhone(m.phone) : "";

            if (mEmail && mEmail === item.email) {
              return NextResponse.json({
                success: false,
                error: `Registration blocked: "${item.name}" (email: ${item.email}) is already registered for another event: "${reg.event.name}".`
              }, { status: 409 });
            }

            if (itemPhoneClean && mPhone && mPhone === itemPhoneClean) {
              return NextResponse.json({
                success: false,
                error: `Registration blocked: "${item.name}" (phone: ${item.phone}) is already registered for another event: "${reg.event.name}".`
              }, { status: 409 });
            }
          }
        }
      }
    }

    // Check max participants if applicable
    if (event.maxParticipants) {
      const currentCount = await prisma.registration.count({
        where: { eventId: data.eventId },
      });
      
      if (currentCount >= event.maxParticipants) {
        return NextResponse.json({ success: false, error: "Event capacity reached" }, { status: 400 });
      }
    }

    const registration = await prisma.registration.create({
      data: {
        ...data,
        teamMembers: data.teamMembers as any,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_REGISTRATION",
        entityType: "REGISTRATION",
        entityId: registration.id,
        metadata: { eventId: registration.eventId },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error) {
    console.error("[Registrations POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
