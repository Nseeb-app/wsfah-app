import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pushToken, platform } = await req.json();

  if (!pushToken || !platform) {
    return NextResponse.json({ error: "pushToken and platform required" }, { status: 400 });
  }

  // Upsert — if token already exists, update the user association
  await prisma.mobilePushToken.upsert({
    where: { token: pushToken },
    update: { userId: user.id, platform, updatedAt: new Date() },
    create: { userId: user.id, token: pushToken, platform },
  });

  return NextResponse.json({ success: true });
}
