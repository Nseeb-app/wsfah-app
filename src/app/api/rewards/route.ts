import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rewards = await prisma.reward.findMany({
    where: { isEnabled: true },
    orderBy: { pointsCost: "asc" },
  });
  return NextResponse.json(rewards);
}
