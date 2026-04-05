import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({
      error: "كلمة المرور يجب أن تكون ٨ أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم",
    }, { status: 400 });
  }

  // Find valid token
  const resetToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      expires: { gte: new Date() },
    },
  });

  if (!resetToken) {
    return NextResponse.json({ error: "الرابط غير صالح أو منتهي الصلاحية" }, { status: 400 });
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: resetToken.identifier },
  });

  if (!user) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  // Update password
  const hashedPassword = await hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Delete used token
  await prisma.verificationToken.deleteMany({
    where: { identifier: resetToken.identifier },
  });

  return NextResponse.json({ message: "تم تغيير كلمة المرور بنجاح" });
}
