import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

// POST /api/brands/[id]/coupons/[couponId]/claim — user claims a coupon
export async function POST(req: Request, { params }: { params: Promise<{ id: string; couponId: string }> }) {
  const { id, couponId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupon = await prisma.brandCoupon.findFirst({
    where: { id: couponId, companyId: id, isActive: true },
  });

  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

  const now = new Date();
  if (coupon.startDate > now || coupon.endDate < now) {
    return NextResponse.json({ error: "Coupon not active" }, { status: 400 });
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Coupon fully redeemed" }, { status: 400 });
  }

  // Check if already claimed
  const existing = await prisma.brandCouponClaim.findUnique({
    where: { userId_couponId: { userId: user.id, couponId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already claimed", claim: existing }, { status: 409 });
  }

  const [claim] = await prisma.$transaction([
    prisma.brandCouponClaim.create({
      data: { userId: user.id, couponId },
    }),
    prisma.brandCoupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(claim, { status: 201 });
}
