import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

// GET /api/my/brand-rewards — user's redeemed brand rewards
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const redemptions = await prisma.brandRewardRedemption.findMany({
    where: { userId: user.id },
    include: {
      brandReward: {
        include: {
          company: {
            select: { id: true, name: true, logo: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(redemptions);
}
