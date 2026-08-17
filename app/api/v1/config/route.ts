import { NextResponse } from "next/server";
import { getPublicSystemConfig } from "@/lib/system_config";

/**
 * Public, unauthenticated read of the system config fields that anonymous
 * visitors legitimately need: is registration open, is the site in
 * maintenance mode, and the payment portal link. Never expose operational
 * fields (phase, maxReg) here — those stay behind /api/v1/admin/config.
 */
export async function GET() {
  try {
    const config = await getPublicSystemConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("[Public Config GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}
