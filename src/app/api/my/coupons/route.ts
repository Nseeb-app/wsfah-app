import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

// GET /api/my/coupons — user's claimed coupons
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await prisma.brandCouponClaim.findMany({
    where: { userId: user.id },
    include: {
      coupon: {
        include: {
          company: {
            select: { id: true, name: true, logo: true },
          },
        },
      },
    },
    orderBy: { claimedAt: "desc" },
  });

  return NextResponse.json(claims);
}
