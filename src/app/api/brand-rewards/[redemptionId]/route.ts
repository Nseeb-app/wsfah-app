import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand } from "@/lib/brand-auth";

// POST /api/brand-rewards/[redemptionId]/use — barista marks redemption as used
export async function POST(req: Request, { params }: { params: Promise<{ redemptionId: string }> }) {
  const { redemptionId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const redemption = await prisma.brandRewardRedemption.findUnique({
    where: { id: redemptionId },
    include: { brandReward: true },
  });

  if (!redemption) {
    return NextResponse.json({ error: "Redemption not found" }, { status: 404 });
  }

  // Only brand owner or team member can mark as used
  const auth = await canManageBrand(user.id, redemption.brandReward.companyId);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (redemption.status === "USED") {
    return NextResponse.json({ error: "Already used" }, { status: 400 });
  }

  if (redemption.status === "EXPIRED" || redemption.expiresAt < new Date()) {
    return NextResponse.json({ error: "Redemption has expired" }, { status: 400 });
  }

  const updated = await prisma.brandRewardRedemption.update({
    where: { id: redemptionId },
    data: { status: "USED", usedAt: new Date() },
  });

  return NextResponse.json({ success: true, redemption: updated });
}
