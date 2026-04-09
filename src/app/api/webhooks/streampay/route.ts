import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// StreamPay webhook event names (from their dashboard)
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Verify webhook secret (mandatory)
  const webhookSecret = process.env.STREAM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const signature =
    req.headers.get("x-webhook-signature") ||
    req.headers.get("x-webhook-secret");
  if (signature !== webhookSecret) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = body.event || body.type;
  const data = body.data || body;

  try {
    switch (event) {
      case "PAYMENT_SUCCEEDED":
      case "PAYMENT_MARKED_AS_PAID":
        await handlePaymentSuccess(data);
        break;

      case "SUBSCRIPTION_CREATED":
      case "SUBSCRIPTION_ACTIVATED":
        await handleSubscriptionCreated(data);
        break;

      case "SUBSCRIPTION_CANCELED":
      case "SUBSCRIPTION_INACTIVATED":
        await handleSubscriptionEnded(data);
        break;

      case "SUBSCRIPTION_CYCLE_RENEWED_SUCCESSFULLY":
        await handleRenewalSuccess(data);
        break;

      case "SUBSCRIPTION_CYCLE_RENEWAL_FAILED":
        await handleRenewalFailed(data);
        break;

      case "PAYMENT_FAILED":
        await handlePaymentFailed(data);
        break;

      case "PAYMENT_REFUNDED":
        await handleRefund(data);
        break;

      default:
        // Unhandled event — ignore silently
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(data: any) {
  const metadata = data.custom_metadata || data.metadata || {};
  const userId = metadata.user_id;
  const planSlug = metadata.plan_slug;
  const companyId = metadata.company_id;

  if (!userId || !planSlug) return;

  const isYearly = planSlug.endsWith("-yearly");
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + (isYearly ? 12 : 1));

  if (planSlug === "pro" || planSlug === "pro-yearly") {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "pro" },
    });
  } else if (planSlug.startsWith("roaster") && companyId) {
    const tier = planSlug.includes("roaster-pro") ? "pro" : "basic";
    await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt,
      },
    });
  }

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
  const metadata = data.custom_metadata || data.metadata || {};
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
  const metadata = data.custom_metadata || data.metadata || {};
  const userId = metadata.user_id;
  const planSlug = metadata.plan_slug;
  const companyId = metadata.company_id;

  if (!userId) return;

  if (planSlug === "pro" || planSlug === "pro-yearly") {
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

async function handleRenewalSuccess(data: any) {
  const metadata = data.custom_metadata || data.metadata || {};
  const userId = metadata.user_id;
  const companyId = metadata.company_id;

  if (!userId) return;

  // Extend expiration by 1 month
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  if (companyId) {
    await prisma.company.update({
      where: { id: companyId },
      data: { subscriptionExpiresAt: expiresAt },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: "SUBSCRIPTION_RENEWED",
      entity: "subscription",
      entityId: data.id,
      metadata: JSON.stringify({ plan: metadata.plan_slug }),
    },
  });
}

async function handleRenewalFailed(data: any) {
  const metadata = data.custom_metadata || data.metadata || {};
  const userId = metadata.user_id;

  if (userId) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "SUBSCRIPTION_RENEWAL_FAILED",
        entity: "subscription",
        entityId: data.id,
        metadata: JSON.stringify({
          plan: metadata.plan_slug,
          reason: data.reason || "payment_failed",
        }),
      },
    });
  }
}

async function handlePaymentFailed(data: any) {
  const metadata = data.custom_metadata || data.metadata || {};
  const userId = metadata.user_id;

  if (userId) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PAYMENT_FAILED",
        entity: "payment",
        entityId: data.id,
        metadata: JSON.stringify({
          plan: metadata.plan_slug,
          amount: data.amount,
        }),
      },
    });
  }
}

async function handleRefund(data: any) {
  const metadata = data.custom_metadata || data.metadata || {};
  const userId = metadata.user_id;
  const planSlug = metadata.plan_slug;
  const companyId = metadata.company_id;

  if (!userId) return;

  // Downgrade on refund
  if (planSlug === "pro" || planSlug === "pro-yearly") {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "free" },
    });
  } else if (planSlug?.startsWith("roaster") && companyId) {
    await prisma.company.update({
      where: { id: companyId },
      data: { subscriptionTier: "basic", subscriptionExpiresAt: null },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: "PAYMENT_REFUNDED",
      entity: "payment",
      entityId: data.id,
      metadata: JSON.stringify({
        plan: planSlug,
        amount: data.amount,
      }),
    },
  });
}
