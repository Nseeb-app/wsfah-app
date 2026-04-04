import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
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
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "Account is suspended" }, { status: 403 });
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signMobileToken({ id: user.id, role: user.role });

    logAudit(user.id, AUDIT.LOGIN_SUCCESS, "user", user.id, { method: "mobile" }, ip);

    return NextResponse.json({ token, userId: user.id });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
