import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const verticals = await prisma.vertical.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: verticals });
  } catch (error) {
    console.error("[Verticals GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch verticals" },
      { status: 500 }
    );
  }
}
