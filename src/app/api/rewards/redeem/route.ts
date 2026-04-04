import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rewardId } = await req.json();
  if (!rewardId) {
    return NextResponse.json({ error: "rewardId required" }, { status: 400 });
  }

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || !reward.isEnabled) {
    return NextResponse.json({ error: "Reward not available" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true },
  });
  if (!user || user.points < reward.pointsCost) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
  }

  // Deduct points and create redemption in a transaction
  const [redemption] = await prisma.$transaction([
    prisma.redemption.create({
      data: {
        userId: session.user.id,
        rewardId: reward.id,
        points: reward.pointsCost,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { points: { decrement: reward.pointsCost } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    redemption,
    remainingPoints: user.points - reward.pointsCost,
  });
}
