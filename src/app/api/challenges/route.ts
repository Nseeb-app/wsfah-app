import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  const { searchParams } = new URL(req.url);
  const rank = searchParams.get("rank");
  const category = searchParams.get("category");
  const tier = searchParams.get("tier"); // "free" | "premium"

  const challenges = await prisma.challenge.findMany({
    where: {
      isActive: true,
      ...(rank ? { rank } : {}),
      ...(category ? { category } : {}),
      ...(tier ? { requiredTier: tier } : {}),
    },
    include: user?.id
      ? {
          users: {
            where: { userId: user.id },
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  // Transform: rename `users` array to `userChallenge` object for mobile app
  const result = challenges.map((c: any) => {
    const uc = c.users?.[0] || null;
    return {
      ...c,
      userChallenge: uc
        ? { currentProgress: uc.currentProgress, status: uc.status }
        : null,
      users: undefined,
    };
  });

  return NextResponse.json(result);
}
