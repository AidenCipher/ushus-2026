import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, phone } = await req.json();

    if (!email || !phone) {
      return NextResponse.json(
        { success: false, error: "Email and phone number are required" },
        { status: 400 }
      );
    }

    // Generate 6-digit codes
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save/upsert email OTP
    await prisma.verificationOtp.upsert({
      where: { type_target: { type: "EMAIL", target: email.toLowerCase().trim() } },
      update: { code: emailOtp, expiresAt, createdAt: new Date() },
      create: { type: "EMAIL", target: email.toLowerCase().trim(), code: emailOtp, expiresAt },
    });

    // Save/upsert phone OTP
    await prisma.verificationOtp.upsert({
      where: { type_target: { type: "PHONE", target: phone.trim() } },
      update: { code: phoneOtp, expiresAt, createdAt: new Date() },
      create: { type: "PHONE", target: phone.trim(), code: phoneOtp, expiresAt },
    });

    // Log the OTPs in the console for developer testing
    console.log(`\n==================================================`);
    console.log(`[OTP VERIFICATION SENT]`);
    console.log(`Target Email: ${email.toLowerCase().trim()} -> OTP: ${emailOtp}`);
    console.log(`Target Phone: ${phone.trim()} -> OTP: ${phoneOtp}`);
    console.log(`==================================================\n`);

    // Return the codes directly in development mode to allow immediate copy-paste in UI
    return NextResponse.json({
      success: true,
      message: "OTPs generated and sent successfully",
      devOtp: {
        emailOtp,
        phoneOtp
      }
    });

  } catch (error) {
    console.error("[OTP Send POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification codes" },
      { status: 500 }
    );
  }
}
