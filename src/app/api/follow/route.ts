import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { parseBody, followSchema } from "@/lib/validation";
import { logAudit, AUDIT } from "@/lib/audit";
import { recordActivity } from "@/lib/activity";
import { trackChallengeProgress } from "@/lib/challenges";
import { sendPushNotification } from "@/lib/push";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseBody(followSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { userId } = parsed.data;
  if (userId === user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: userId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    await prisma.user.update({ where: { id: userId }, data: { followers: { decrement: 1 } } });
    await prisma.user.update({ where: { id: user.id }, data: { following: { decrement: 1 } } });
    logAudit(user.id, AUDIT.UNFOLLOW, "user", userId);
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({
      data: { followerId: user.id, followingId: userId },
    });
    await prisma.user.update({ where: { id: userId }, data: { followers: { increment: 1 } } });
    await prisma.user.update({ where: { id: user.id }, data: { following: { increment: 1 } } });
    logAudit(user.id, AUDIT.FOLLOW, "user", userId);

    // Track challenge progress (Social category)
    trackChallengeProgress(user.id, "Social");

    // Push notification
    const sender = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } });
    sendPushNotification(
      userId,
      "متابع جديد 👋",
      `${sender?.name || "شخص ما"} بدأ بمتابعتك`,
      { type: "FOLLOW", userId: user.id }
    );

    return NextResponse.json({ following: true });
  }
}

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ following: false });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ following: false });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: userId } },
  });

  return NextResponse.json({ following: !!existing });
}
