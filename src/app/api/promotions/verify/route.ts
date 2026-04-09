import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { getPaymentLink } from "@/lib/streampay";

/**
 * POST /api/promotions/verify
 * Called after payment to verify and activate the promotion
 */
export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { promotionId, paymentLinkId } = await req.json();
  if (!promotionId) {
    return NextResponse.json({ error: "promotionId required" }, { status: 400 });
  }

  const promo = await prisma.promotionRequest.findUnique({
    where: { id: promotionId },
    include: { company: { select: { name: true, ownerId: true } } },
  });

  if (!promo || promo.requesterId !== authUser.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  if (promo.paymentStatus === "PAID") {
    return NextResponse.json({ activated: true, status: promo.status });
  }

  // Verify payment via StreamPay
  const linkId = paymentLinkId || promo.paymentLinkId;
  if (!linkId) {
    return NextResponse.json({ activated: false, message: "لم يتم الدفع بعد" });
  }

  try {
    const link = await getPaymentLink(linkId);
    const amountCollected = parseFloat(link.amount_collected || "0");

    if (amountCollected <= 0) {
      return NextResponse.json({ activated: false, message: "لم يتم الدفع بعد" });
    }

    // Payment confirmed — activate promotion
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (promo.duration || 7));

    await prisma.promotionRequest.update({
      where: { id: promotionId },
      data: {
        paymentStatus: "PAID",
        status: "PENDING", // Moves to PENDING for admin review
        amountPaid: amountCollected,
        startDate: now,
        endDate,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: "PROMOTION_PAID",
        entity: "promotion",
        entityId: promotionId,
        metadata: JSON.stringify({
          company: promo.company.name,
          amount: amountCollected,
          duration: promo.duration,
        }),
      },
    });

    return NextResponse.json({ activated: true, status: "PENDING" });
  } catch (error) {
    console.error("Promotion verify error:", error);
    return NextResponse.json({ error: "فشل التحقق من الدفع" }, { status: 500 });
  }
}
