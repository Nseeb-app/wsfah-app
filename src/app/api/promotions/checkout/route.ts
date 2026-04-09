import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { createPaymentLink } from "@/lib/streampay";

/**
 * POST /api/promotions/checkout
 * Roaster selects a promotion pricing plan → creates payment link → returns URL
 */
export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { companyId, pricingId, placement, message, imageUrl } = await req.json();

  if (!companyId || !pricingId) {
    return NextResponse.json({ error: "companyId and pricingId required" }, { status: 400 });
  }

  // Verify company ownership
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true, name: true },
  });
  if (!company || company.ownerId !== authUser.id) {
    return NextResponse.json({ error: "غير مصرح لك بإدارة هذه العلامة التجارية" }, { status: 403 });
  }

  // Get pricing plan
  const pricing = await prisma.promotionPricing.findUnique({
    where: { id: pricingId },
  });
  if (!pricing || !pricing.isActive) {
    return NextResponse.json({ error: "باقة الترويج غير متوفرة" }, { status: 404 });
  }

  // Calculate final price after discount
  const finalPrice = pricing.price * (1 - pricing.discount / 100);

  // Create promotion request with PENDING_PAYMENT status
  const promo = await prisma.promotionRequest.create({
    data: {
      companyId,
      requesterId: authUser.id,
      placement: placement || pricing.placement,
      message: message?.slice(0, 500) || null,
      imageUrl: imageUrl || null,
      status: "PENDING_PAYMENT",
      paymentStatus: "UNPAID",
      pricingId,
      duration: pricing.duration,
      amountPaid: finalPrice,
    },
  });

  // Validate StreamPay is configured
  if (!process.env.STREAM_X_API_KEY) {
    return NextResponse.json({ error: "خدمة الدفع غير مهيأة" }, { status: 500 });
  }

  try {
    const origin = req.nextUrl.origin;

    const paymentLink = await createPaymentLink({
      name: `ترويج ${company.name} - ${pricing.name}`,
      description: `${pricing.name} (${pricing.duration} يوم)`,
      items: [{
        product_id: process.env.STREAM_PRODUCT_USER_PRO || "",
        quantity: 1,
      }],
      success_redirect_url: `${origin}/pricing?status=success&type=promotion`,
      failure_redirect_url: `${origin}/pricing?status=cancelled`,
      custom_metadata: {
        type: "promotion",
        promotion_id: promo.id,
        company_id: companyId,
        user_id: authUser.id,
        pricing_id: pricingId,
        amount: String(finalPrice),
      },
    });

    // Update promotion with payment link ID
    await prisma.promotionRequest.update({
      where: { id: promo.id },
      data: { paymentLinkId: paymentLink.id },
    });

    return NextResponse.json({
      url: paymentLink.url,
      id: paymentLink.id,
      promotionId: promo.id,
    });
  } catch (error) {
    // Clean up the promotion if payment link creation fails
    await prisma.promotionRequest.delete({ where: { id: promo.id } });
    console.error("Promotion checkout error:", error);
    return NextResponse.json(
      { error: "فشل إنشاء رابط الدفع" },
      { status: 500 }
    );
  }
}
