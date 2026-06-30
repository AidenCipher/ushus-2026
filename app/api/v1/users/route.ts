import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserCreateSchema } from "@/lib/validations/user.schema";
import { hasPermission } from "@/lib/permissions";
import type { Prisma, Role } from "@prisma/client";
import { hash } from "bcryptjs";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    // Admins can manage users; Organisers can view their team
    if (!hasPermission(userRole, "MANAGE_USERS") && !hasPermission(userRole, "VIEW_TEAM")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role");
    const verticalId = searchParams.get("verticalId");
    const eventId = searchParams.get("eventId");
    const search = searchParams.get("search");

    const where: Prisma.UserWhereInput = {};

    if (roleParam) where.role = roleParam as Role;
    if (verticalId) where.verticalId = verticalId;
    if (eventId) where.eventId = eventId;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Organisers can only see volunteers in their vertical or event
    if (userRole === "ORGANISER") {
      where.verticalId = session.user.verticalId || undefined;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        college: true,
        isActive: true,
        profilePictureUrl: true,
        vertical: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[Users GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
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

    const userRole = session.user.role as Role;
    const body = await req.json();
    const parsed = UserCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const isOrganiserManagingVolunteer = 
      userRole === "ORGANISER" && 
      data.role === "VOLUNTEER" && 
      !!data.verticalId && 
      data.verticalId === session.user.verticalId;

    if (!hasPermission(userRole, "MANAGE_USERS") && !isOrganiserManagingVolunteer) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(data.password, 12);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = data;
    
    const user = await prisma.user.create({
      data: {
        ...userData,
        email: userData.email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_USER",
        entityType: "USER",
        entityId: user.id,
        metadata: { role: user.role, email: user.email },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("[Users POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
