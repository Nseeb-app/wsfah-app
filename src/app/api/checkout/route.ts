import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentLink, createCustomer } from "@/lib/streampay";

// Maps our plan slugs to StreamPay product IDs (set in env)
function getProductId(planSlug: string): string | null {
  const map: Record<string, string | undefined> = {
    pro: process.env.STREAM_PRODUCT_USER_PRO,
    "roaster-basic": process.env.STREAM_PRODUCT_ROASTER_BASIC,
    "roaster-pro": process.env.STREAM_PRODUCT_ROASTER_PRO,
  };
  return map[planSlug] || null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { planSlug, companyId } = await req.json();

  if (!planSlug) {
    return NextResponse.json({ error: "يرجى تحديد الخطة" }, { status: 400 });
  }

  const productId = getProductId(planSlug);
  if (!productId) {
    return NextResponse.json({ error: "خطة غير صالحة" }, { status: 400 });
  }

  // Check if this is a roaster plan and validate company ownership
  const isRoasterPlan = planSlug.startsWith("roaster");
  if (isRoasterPlan) {
    if (!companyId) {
      return NextResponse.json(
        { error: "يرجى تحديد العلامة التجارية" },
        { status: 400 }
      );
    }
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    });
    if (!company || company.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بإدارة هذه العلامة التجارية" },
        { status: 403 }
      );
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true },
  });

  if (!user) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  try {
    // Create or find StreamPay customer
    const customer = await createCustomer({
      name: user.name || "مستخدم وصفة",
      email: user.email || undefined,
      phone: user.phone || undefined,
      language: "ar",
    });

    const origin = req.nextUrl.origin;

    // Create payment link
    const paymentLink = await createPaymentLink({
      name: `اشتراك ${planSlug}`,
      description: `اشتراك في خطة ${planSlug}`,
      items: [{ product_id: productId, quantity: 1 }],
      customer_id: customer.id,
      success_url: `${origin}/pricing?status=success&plan=${planSlug}`,
      cancel_url: `${origin}/pricing?status=cancelled`,
      metadata: {
        user_id: session.user.id,
        plan_slug: planSlug,
        ...(companyId ? { company_id: companyId } : {}),
      },
    });

    return NextResponse.json({ url: paymentLink.url, id: paymentLink.id });
  } catch (error: any) {
    console.error("StreamPay checkout error:", error);
    return NextResponse.json(
      { error: error.message || "فشل إنشاء رابط الدفع" },
      { status: 500 }
    );
  }
}
