import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

// POST /api/stamp-cards/[cardId]/join — user starts collecting stamps
export async function POST(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stampCard = await prisma.stampCard.findUnique({ where: { id: cardId } });
  if (!stampCard || !stampCard.isActive) {
    return NextResponse.json({ error: "Stamp card not found or inactive" }, { status: 404 });
  }

  // Check if expired
  if (stampCard.endDate && stampCard.endDate < new Date()) {
    return NextResponse.json({ error: "Stamp card has expired" }, { status: 400 });
  }

  // Check if user already has an active card
  const existing = await prisma.userStampCard.findFirst({
    where: { userId: user.id, stampCardId: cardId, status: "ACTIVE" },
  });
  if (existing) {
    return NextResponse.json({ error: "Already collecting stamps on this card", card: existing }, { status: 409 });
  }

  const userStampCard = await prisma.userStampCard.create({
    data: {
      userId: user.id,
      stampCardId: cardId,
    },
    include: { stampCard: true },
  });

  return NextResponse.json(userStampCard, { status: 201 });
}
