import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parseBody, registerSchema } from "@/lib/validation";
import { logAudit, AUDIT } from "@/lib/audit";
import { rateLimitAuth } from "@/lib/rate-limit";
import { signMobileToken } from "@/lib/jwt";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    // Rate limit
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimitAuth(ip);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = parseBody(registerSchema, body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { name, email, phone, password } = parsed.data;

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    // Check if user exists
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
    }

    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
      }
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || (email ? email.split("@")[0] : `User ${phone?.slice(-4)}`),
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
      },
    });

    logAudit(user.id, AUDIT.REGISTER, "user", user.id, { email, phone }, ip);

    // Send welcome + verification emails (non-blocking)
    if (email) {
      const userName = name || email.split("@")[0];
      sendWelcomeEmail(email, userName).catch(() => {});

      const verifyToken = randomUUID();
      prisma.verificationToken.create({
        data: {
          identifier: email,
          token: verifyToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      }).then(() => {
        sendVerificationEmail(email, userName, verifyToken).catch(() => {});
      }).catch(() => {});
    }

    // Return JWT token for mobile app auto-login
    const token = await signMobileToken({ id: user.id, role: user.role });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id, token },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
