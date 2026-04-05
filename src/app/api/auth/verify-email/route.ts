import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "رمز التحقق مطلوب" }, { status: 400 });
  }

  const verifyToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      expires: { gte: new Date() },
    },
  });

  if (!verifyToken) {
    return NextResponse.json({ error: "الرابط غير صالح أو منتهي الصلاحية" }, { status: 400 });
  }

  // Mark email as verified
  await prisma.user.updateMany({
    where: { email: verifyToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete used token
  await prisma.verificationToken.deleteMany({
    where: { identifier: verifyToken.identifier },
  });

  return NextResponse.json({ message: "تم تأكيد البريد الإلكتروني بنجاح" });
}
