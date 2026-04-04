import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

// POST /api/stamp-cards/[cardId]/redeem — redeem a completed stamp card
export async function POST(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // cardId here is the userStampCardId
  const userStampCard = await prisma.userStampCard.findFirst({
    where: { id: cardId, userId: user.id, status: "COMPLETED" },
    include: { stampCard: true },
  });

  if (!userStampCard) {
    return NextResponse.json({ error: "No completed stamp card found" }, { status: 404 });
  }

  const canReuse =
    userStampCard.stampCard.maxCompletions === 0 ||
    userStampCard.completions + 1 < userStampCard.stampCard.maxCompletions;

  if (canReuse) {
    // Reset the card for reuse
    await prisma.userStampCard.update({
      where: { id: cardId },
      data: {
        status: "ACTIVE",
        currentStamps: 0,
        completions: { increment: 1 },
        redeemedAt: new Date(),
        completedAt: null,
      },
    });
  } else {
    // Final redemption, mark as redeemed
    await prisma.userStampCard.update({
      where: { id: cardId },
      data: {
        status: "REDEEMED",
        completions: { increment: 1 },
        redeemedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    success: true,
    reward: userStampCard.stampCard.rewardDescription,
    canReuse,
    completions: userStampCard.completions + 1,
  });
}
