import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get current user's subscription status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      subscriptionTier: true,
      companies: {
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
          subscriptionExpiresAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  // Get available plans
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    user: {
      tier: user.subscriptionTier,
      isProUser: user.subscriptionTier === "pro",
    },
    companies: user.companies.map((c) => ({
      id: c.id,
      name: c.name,
      tier: c.subscriptionTier,
      expiresAt: c.subscriptionExpiresAt,
      isExpired: c.subscriptionExpiresAt
        ? new Date(c.subscriptionExpiresAt) < new Date()
        : false,
    })),
    plans,
  });
}
