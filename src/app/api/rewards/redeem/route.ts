import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { rewardId } = await req.json();
  if (!rewardId) {
    return NextResponse.json({ error: "rewardId required" }, { status: 400 });
  }

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || !reward.isEnabled) {
    return NextResponse.json({ error: "Reward not available" }, { status: 404 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { points: true },
  });
  if (!dbUser || dbUser.points < reward.pointsCost) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
  }

  // Deduct points and create redemption in a transaction
  const [redemption] = await prisma.$transaction([
    prisma.redemption.create({
      data: {
        userId: user.id,
        rewardId: reward.id,
        points: reward.pointsCost,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { points: { decrement: reward.pointsCost } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    redemption,
    remainingPoints: dbUser.points - reward.pointsCost,
  });
}
