import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getSystemConfig, updateSystemConfig } from "@/lib/system_config";
import { SystemConfigUpdateSchema } from "@/lib/validations/system-config.schema";
import { auditFromRequest, AuditActions } from "@/lib/audit";
import type { Role } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "ACCESS_ADMIN_SETTINGS")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const config = await getSystemConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("[System Config GET] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "ACCESS_ADMIN_SETTINGS")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = SystemConfigUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await updateSystemConfig(parsed.data);

    await auditFromRequest(req.headers, {
      userId: session.user.id,
      action: AuditActions.SETTINGS_UPDATED,
      entityType: "SYSTEM_CONFIG",
      metadata: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[System Config POST] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save config" }, { status: 500 });
  }
}
