import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { challengeId, increment = 1 } = await req.json();
  if (!challengeId) {
    return NextResponse.json({ error: "challengeId required" }, { status: 400 });
  }

  const uc = await prisma.userChallenge.findUnique({
    where: { userId_challengeId: { userId: user.id, challengeId } },
    include: { challenge: true },
  });

  if (!uc) {
    return NextResponse.json({ error: "لم تنضم لهذا التحدي بعد" }, { status: 404 });
  }

  if (uc.status === "COMPLETED") {
    return NextResponse.json({ error: "التحدي مكتمل بالفعل" }, { status: 400 });
  }

  const newProgress = Math.min(
    uc.currentProgress + increment,
    uc.challenge.maxProgress
  );
  const isCompleted = newProgress >= uc.challenge.maxProgress;

  const updated = await prisma.userChallenge.update({
    where: { id: uc.id },
    data: {
      currentProgress: newProgress,
      ...(isCompleted
        ? { status: "COMPLETED", completedAt: new Date() }
        : {}),
    },
    include: { challenge: true },
  });

  // Award points on completion
  if (isCompleted) {
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: uc.challenge.rewardPoints } },
    });
  }

  return NextResponse.json({
    ...updated,
    pointsAwarded: isCompleted ? uc.challenge.rewardPoints : 0,
  });
}
