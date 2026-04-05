import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`forgot:${ip}`, 3, 600_000); // 3 per 10 min
  if (!rl.success) {
    return NextResponse.json({ error: "طلبات كثيرة. حاول لاحقاً." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "يرجى إدخال البريد الإلكتروني" }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (user && user.email) {
    // Create reset token (1 hour expiry)
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: expiresAt,
      },
    });

    try {
      await sendPasswordResetEmail(user.email, user.name || "مستخدم", token);
    } catch {
      // Silent fail - don't reveal email existence
    }
  }

  return NextResponse.json({
    message: "إذا كان البريد مسجلاً لدينا، ستصلك رسالة لإعادة تعيين كلمة المرور",
  });
}
