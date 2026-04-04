import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

// POST /api/brands/[id]/rewards/[rewardId]/redeem — spend app points for brand reward
export async function POST(req: Request, { params }: { params: Promise<{ id: string; rewardId: string }> }) {
  const { id, rewardId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reward = await prisma.brandReward.findFirst({
    where: { id: rewardId, companyId: id, isActive: true },
  });
  if (!reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 });

  // Check date validity
  const now = new Date();
  if (reward.startDate && reward.startDate > now) {
    return NextResponse.json({ error: "Reward not yet available" }, { status: 400 });
  }
  if (reward.endDate && reward.endDate < now) {
    return NextResponse.json({ error: "Reward has expired" }, { status: 400 });
  }

  // Check stock
  if (reward.stock !== null && reward.stock <= 0) {
    return NextResponse.json({ error: "Reward out of stock" }, { status: 400 });
  }

  // Check user has enough points
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { points: true },
  });
  if (!dbUser || dbUser.points < reward.pointsCost) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
  }

  // Atomic transaction: deduct points, create redemption, decrement stock
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [redemption] = await prisma.$transaction([
    prisma.brandRewardRedemption.create({
      data: {
        userId: user.id,
        brandRewardId: rewardId,
        pointsSpent: reward.pointsCost,
        expiresAt,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { points: { decrement: reward.pointsCost } },
    }),
    ...(reward.stock !== null
      ? [prisma.brandReward.update({
          where: { id: rewardId },
          data: { stock: { decrement: 1 } },
        })]
      : []),
  ]);

  return NextResponse.json({
    success: true,
    redemption,
    remainingPoints: dbUser.points - reward.pointsCost,
  });
}
