import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parseBody, sendOtpSchema } from "@/lib/validation";
import { rateLimitAuth } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimitAuth(ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = parseBody(sendOtpSchema, body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { phone } = parsed.data;

    // Check if too many OTPs sent for this phone in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = await prisma.otpToken.count({
      where: {
        phone,
        createdAt: { gte: tenMinutesAgo },
      },
    });
    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Too many OTP requests. Wait 10 minutes." },
        { status: 429 }
      );
    }

    // Generate a random 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await hash(otp, 10);

    // Store hashed OTP with 5-minute expiry
    await prisma.otpToken.create({
      data: {
        phone,
        code: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // In production, send SMS here via Twilio/etc.
    // For development, log to console and return to client
    console.log(`\n📱 OTP for ${phone}: ${otp}\n`);

    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json({
      message: "OTP sent successfully",
      ...(isDev ? { otp_for_testing: otp } : {}),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
