import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { challengeId } = await req.json();
  if (!challengeId) {
    return NextResponse.json({ error: "challengeId required" }, { status: 400 });
  }

  // Check challenge exists
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge || !challenge.isActive) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Check tier requirement
  if (challenge.requiredTier === "pro") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });
    if ((user?.subscriptionTier || "").toLowerCase() !== "pro") {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
    }
  }

  // Check if already joined
  const existing = await prisma.userChallenge.findUnique({
    where: { userId_challengeId: { userId: session.user.id, challengeId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already joined" }, { status: 409 });
  }

  const userChallenge = await prisma.userChallenge.create({
    data: {
      userId: session.user.id,
      challengeId,
    },
  });

  return NextResponse.json(userChallenge, { status: 201 });
}
