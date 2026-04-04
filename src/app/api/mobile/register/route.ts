import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimitAuth } from "@/lib/rate-limit";
import { signMobileToken } from "@/lib/jwt";
import { logAudit, AUDIT } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimitAuth(ip);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
      },
    });

    logAudit(user.id, AUDIT.REGISTER, "user", user.id, { email, method: "mobile" }, ip);

    const token = await signMobileToken({ id: user.id, role: user.role });

    return NextResponse.json({ token, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Mobile registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
