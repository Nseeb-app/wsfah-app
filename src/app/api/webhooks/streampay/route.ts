import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// StreamPay sends webhook events when payments/subscriptions change
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Verify webhook secret if configured
  const webhookSecret = process.env.STREAM_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers.get("x-webhook-signature");
    if (signature !== webhookSecret) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const { event, data } = body;

  try {
    switch (event) {
      case "payment.success":
      case "invoice.paid":
        await handlePaymentSuccess(data);
        break;

      case "subscription.created":
        await handleSubscriptionCreated(data);
        break;

      case "subscription.cancelled":
      case "subscription.expired":
        await handleSubscriptionEnded(data);
        break;

      default:
        console.log(`Unhandled StreamPay event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(data: any) {
  const metadata = data.metadata || {};
  const userId = metadata.user_id;
  const planSlug = metadata.plan_slug;
  const companyId = metadata.company_id;

  if (!userId || !planSlug) return;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

  if (planSlug === "pro") {
    // User subscription
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "pro" },
    });
  } else if (planSlug.startsWith("roaster") && companyId) {
    // Roaster/brand subscription
    const tier = planSlug === "roaster-pro" ? "pro" : "basic";
    await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt,
      },
    });
  }

  // Log the payment in audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: "PAYMENT_SUCCESS",
      entity: "subscription",
      entityId: companyId || userId,
      metadata: JSON.stringify({
        plan: planSlug,
        payment_id: data.id,
        amount: data.amount,
        currency: data.currency,
      }),
    },
  });
}

async function handleSubscriptionCreated(data: any) {
  const metadata = data.metadata || {};
  const userId = metadata.user_id;

  if (userId) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "SUBSCRIPTION_CREATED",
        entity: "subscription",
        entityId: data.id,
        metadata: JSON.stringify({
          plan: metadata.plan_slug,
          stream_subscription_id: data.id,
        }),
      },
    });
  }
}

async function handleSubscriptionEnded(data: any) {
  const metadata = data.metadata || {};
  const userId = metadata.user_id;
  const planSlug = metadata.plan_slug;
  const companyId = metadata.company_id;

  if (!userId) return;

  if (planSlug === "pro") {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "free" },
    });
  } else if (planSlug?.startsWith("roaster") && companyId) {
    await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionTier: "basic",
        subscriptionExpiresAt: null,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: "SUBSCRIPTION_ENDED",
      entity: "subscription",
      entityId: data.id,
      metadata: JSON.stringify({
        plan: planSlug,
        reason: data.reason || "cancelled",
      }),
    },
  });
}
