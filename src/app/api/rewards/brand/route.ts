import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rewards/brand — all brand rewards published to main rewards tab
export async function GET() {
  const now = new Date();

  const rewards = await prisma.brandReward.findMany({
    where: {
      publishToMain: true,
      isActive: true,
      company: { status: "APPROVED" },
    },
    include: {
      company: {
        select: { id: true, name: true, logo: true, isVerified: true },
      },
    },
    orderBy: { pointsCost: "asc" },
  });

  // Filter by date
  const active = rewards.filter((r) => {
    if (r.startDate && r.startDate > now) return false;
    if (r.endDate && r.endDate < now) return false;
    return true;
  });

  return NextResponse.json(active);
}
