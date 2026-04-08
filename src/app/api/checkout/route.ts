import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { createPaymentLink, createConsumer } from "@/lib/streampay";

// Maps our plan slugs to StreamPay product IDs (set in env)
function getProductId(planSlug: string): string | null {
  const map: Record<string, string | undefined> = {
    // Monthly
    pro: process.env.STREAM_PRODUCT_USER_PRO,
    "roaster-basic": process.env.STREAM_PRODUCT_ROASTER_BASIC,
    "roaster-pro": process.env.STREAM_PRODUCT_ROASTER_PRO,
    // Yearly
    "pro-yearly": process.env.STREAM_PRODUCT_USER_PRO_YEARLY,
    "roaster-basic-yearly": process.env.STREAM_PRODUCT_ROASTER_BASIC_YEARLY,
    "roaster-pro-yearly": process.env.STREAM_PRODUCT_ROASTER_PRO_YEARLY,
  };
  return map[planSlug] || null;
}

// Get base plan name (strip yearly suffix)
function getBasePlan(slug: string): string {
  return slug.replace("-yearly", "");
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { planSlug, companyId, startTrial } = await req.json();

  if (!planSlug) {
    return NextResponse.json({ error: "يرجى تحديد الخطة" }, { status: 400 });
  }

  // Validate StreamPay API key is configured
  if (!process.env.STREAM_X_API_KEY) {
    console.error("STREAM_X_API_KEY is not configured");
    return NextResponse.json(
      { error: "خدمة الدفع غير مهيأة — يرجى التواصل مع الدعم" },
      { status: 500 }
    );
  }

  const productId = getProductId(planSlug);
  if (!productId) {
    console.error(`Missing STREAM_PRODUCT env var for plan: ${planSlug}`);
    return NextResponse.json(
      { error: "خطة غير صالحة — معرف المنتج غير مهيأ" },
      { status: 400 }
    );
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
    if (!company || company.ownerId !== authUser.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بإدارة هذه العلامة التجارية" },
        { status: 403 }
      );
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      trialUsed: true,
      trialEndsAt: true,
      subscriptionTier: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  // ─── Free Trial Flow ───
  if (startTrial) {
    // Prevent trial abuse: check if user already used trial
    if (user.trialUsed) {
      return NextResponse.json(
        { error: "لقد استخدمت الفترة التجريبية المجانية مسبقاً" },
        { status: 403 }
      );
    }

    // Prevent trial if already on a paid plan
    if (user.subscriptionTier !== "free") {
      return NextResponse.json(
        { error: "أنت مشترك بالفعل في خطة مدفوعة" },
        { status: 400 }
      );
    }

    // Activate 14-day trial
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    const basePlan = getBasePlan(planSlug);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: basePlan === "pro" ? "pro" : "free",
        trialUsed: true,
        trialEndsAt: trialEnd,
        trialPlanSlug: planSlug,
      },
    });

    // For roaster plans, also update company
    if (isRoasterPlan && companyId) {
      const tier = basePlan === "roaster-pro" ? "pro" : "basic";
      await prisma.company.update({
        where: { id: companyId },
        data: {
          subscriptionTier: tier,
          subscriptionExpiresAt: trialEnd,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "TRIAL_STARTED",
        entity: "subscription",
        entityId: user.id,
        metadata: JSON.stringify({
          plan: planSlug,
          trialEndsAt: trialEnd.toISOString(),
        }),
      },
    });

    // Still need payment info - create payment link with trial_period
    // StreamPay will collect card but not charge until trial ends
  }

  try {
    // Try to create StreamPay consumer
    let consumerId: string | undefined;
    try {
      const consumer = await createConsumer({
        name: user.name || "مستخدم وصفة",
        email: user.email || undefined,
        phone: user.phone || undefined,
        language: "ar",
      });
      consumerId = consumer.id;
    } catch (err) {
      console.error("StreamPay consumer creation failed:", err);
      // Continue without consumer — sandbox may restrict this
    }

    const origin = req.nextUrl.origin;

    // Always use web URLs for redirect — mobile verifies via /api/checkout/verify after browser closes
    const successUrl = `${origin}/pricing?status=success&plan=${planSlug}${startTrial ? "&trial=true" : ""}`;
    const cancelUrl = `${origin}/pricing?status=cancelled`;

    // Check if user is eligible for trial (hasn't used one before)
    const offerTrial = !user.trialUsed;

    // Create payment link — always offer 14-day trial for first-time subscribers
    const paymentLink = await createPaymentLink({
      name: `اشتراك ${planSlug}`,
      description: offerTrial
        ? `فترة تجريبية ١٤ يوم مجانية ثم اشتراك ${planSlug}`
        : `اشتراك في خطة ${planSlug}`,
      items: [{ product_id: productId, quantity: 1 }],
      ...(consumerId ? { organization_consumer_id: consumerId } : {}),
      ...(offerTrial ? { trial_period_days: 14 } : {}),
      success_redirect_url: successUrl,
      failure_redirect_url: cancelUrl,
      custom_metadata: {
        user_id: authUser.id,
        plan_slug: planSlug,
        is_trial: offerTrial ? "true" : "false",
        ...(companyId ? { company_id: companyId } : {}),
      },
    });

    return NextResponse.json({ url: paymentLink.url, id: paymentLink.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "فشل إنشاء رابط الدفع";
    console.error("StreamPay checkout error:", message);
    return NextResponse.json(
      { error: "فشل إنشاء رابط الدفع — يرجى المحاولة لاحقاً" },
      { status: 500 }
    );
  }
}
