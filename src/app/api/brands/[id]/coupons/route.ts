import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand } from "@/lib/brand-auth";

// GET /api/brands/[id]/coupons — list active coupons
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const now = new Date();

  const coupons = await prisma.brandCoupon.findMany({
    where: {
      companyId: id,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { endDate: "asc" },
  });

  return NextResponse.json(coupons);
}

// POST /api/brands/[id]/coupons — create coupon (brand owner)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, imageUrl, couponCode, discountType, discountValue, minPurchase, maxUses, startDate, endDate } = body;

  if (!title || !discountType || !startDate || !endDate) {
    return NextResponse.json({ error: "title, discountType, startDate, and endDate are required" }, { status: 400 });
  }

  const coupon = await prisma.brandCoupon.create({
    data: {
      companyId: id,
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      couponCode: couponCode || null,
      discountType,
      discountValue: discountValue ?? null,
      minPurchase: minPurchase ?? null,
      maxUses: maxUses ?? null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
