import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
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
    include: session?.user?.id
      ? {
          users: {
            where: { userId: session.user.id },
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(challenges);
}
