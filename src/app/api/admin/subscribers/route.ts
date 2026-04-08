import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const tier = url.searchParams.get("tier") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (tier) {
    where.subscriptionTier = tier;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      trialUsed: true,
      trialEndsAt: true,
      trialPlanSlug: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Also get companies with subscriptions
  const companies = await prisma.company.findMany({
    where: {
      subscriptionTier: { not: "basic" },
    },
    select: {
      id: true,
      name: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users, companies });
}

export async function PATCH(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { userId, subscriptionTier } = await req.json();
  if (!userId || !subscriptionTier) {
    return NextResponse.json({ error: "userId and subscriptionTier required" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier },
    select: { id: true, name: true, email: true, subscriptionTier: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session!.user!.id!,
      action: "ADMIN_TIER_UPDATE",
      entity: "user",
      entityId: userId,
      metadata: JSON.stringify({ newTier: subscriptionTier }),
    },
  });

  return NextResponse.json(updated);
}
