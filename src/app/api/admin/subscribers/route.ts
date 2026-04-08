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
      subscriptionStartsAt: true,
      subscriptionExpiresAt: true,
      trialUsed: true,
      trialEndsAt: true,
      trialPlanSlug: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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

  const { userId, subscriptionTier, extendDays } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  // Update tier
  if (subscriptionTier) {
    data.subscriptionTier = subscriptionTier;
    if (subscriptionTier !== "free") {
      // Set start date if upgrading from free
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true, subscriptionStartsAt: true },
      });
      if (user?.subscriptionTier === "free" || !user?.subscriptionStartsAt) {
        data.subscriptionStartsAt = new Date();
      }
    }
  }

  // Extend subscription by N days
  if (extendDays && typeof extendDays === "number" && extendDays > 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionExpiresAt: true },
    });
    const base = user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date()
      ? new Date(user.subscriptionExpiresAt)
      : new Date();
    base.setDate(base.getDate() + extendDays);
    data.subscriptionExpiresAt = base;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, name: true, email: true,
      subscriptionTier: true, subscriptionStartsAt: true, subscriptionExpiresAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session!.user!.id!,
      action: "ADMIN_TIER_UPDATE",
      entity: "user",
      entityId: userId,
      metadata: JSON.stringify({ subscriptionTier, extendDays }),
    },
  });

  return NextResponse.json(updated);
}
