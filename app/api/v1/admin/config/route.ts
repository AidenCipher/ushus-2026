import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "system_config.json");

// Ensure data directory exists
function ensureDir() {
  const dir = path.dirname(CONFIG_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadConfig() {
  ensureDir();
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse config file:", e);
    }
  }
  // Defaults
  return {
    phase: "pre-event",
    maxReg: "50",
    allowReg: true,
    maintenance: false,
  };
}

function saveConfig(config: any) {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf8");
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const config = loadConfig();
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
    const current = loadConfig();

    const updated = {
      ...current,
      phase: body.phase ?? current.phase,
      maxReg: String(body.maxReg ?? current.maxReg),
      allowReg: body.allowReg ?? current.allowReg,
      maintenance: body.maintenance ?? current.maintenance,
    };

    saveConfig(updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[System Config POST] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save config" }, { status: 500 });
  }
}
