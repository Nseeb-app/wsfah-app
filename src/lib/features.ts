import { prisma } from "./prisma";

// Tier names match User.subscriptionTier values in the database
export const TIER_LIMITS = {
  FREE: {
    recipes: 3,
    saves: 20,
    journalLogs: 50,
    collections: false,
    messages: false,
    groups: false,
    events: false,
    equipment: false,
    gallery: false,
    analytics: false,
  },
  PRO: {
    recipes: -1, // unlimited
    saves: -1,
    journalLogs: -1,
    collections: true,
    messages: true,
    groups: true,
    events: true,
    equipment: true,
    gallery: true,
    analytics: false,
  },
  PREMIUM: {
    recipes: -1,
    saves: -1,
    journalLogs: -1,
    collections: true,
    messages: true,
    groups: true,
    events: true,
    equipment: true,
    gallery: true,
    analytics: true,
  },
} as const;

export type TierName = keyof typeof TIER_LIMITS;

export function getTierLimits(tier: string) {
  const normalized = tier.toUpperCase() as TierName;
  return TIER_LIMITS[normalized] || TIER_LIMITS.FREE;
}

/** Check if user can create a counted resource (recipes, saves, journalLogs) */
export function canCreateCount(tier: string, currentCount: number, resource: "recipes" | "saves" | "journalLogs"): boolean {
  const limits = getTierLimits(tier);
  const limit = limits[resource];
  return limit === -1 || currentCount < limit;
}

/** Check if user has access to a boolean-gated feature */
export function hasFeature(tier: string, feature: "collections" | "messages" | "groups" | "events" | "equipment" | "gallery" | "analytics"): boolean {
  const limits = getTierLimits(tier);
  return !!limits[feature];
}

/** Get user's effective tier from database.
 *  If the user is an owner or active member of any roaster with a valid subscription,
 *  they automatically get Pro access — even if their personal tier is Free. */
export async function getUserTier(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true, trialEndsAt: true, subscriptionExpiresAt: true },
  });
  let personalTier = user?.subscriptionTier || "FREE";

  // Check if trial has expired - auto-downgrade
  // BUT only if there's no valid paid subscription or admin-set expiry
  if (user?.trialEndsAt && new Date(user.trialEndsAt) < new Date()) {
    const hasValidSubscription = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
    if (personalTier.toUpperCase() !== "FREE" && !hasValidSubscription) {
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionTier: "free", trialEndsAt: null },
      });
      personalTier = "FREE";
    }
  }

  // If already Pro or higher, no need to check roaster membership
  if (personalTier.toUpperCase() !== "FREE") return personalTier;

  // Check if user owns any brand with a valid subscription
  const ownedBrand = await prisma.company.findFirst({
    where: {
      ownerId: userId,
      subscriptionTier: { not: "" },
      OR: [
        { subscriptionExpiresAt: null }, // no expiry set (lifetime / not yet enforced)
        { subscriptionExpiresAt: { gte: new Date() } },
      ],
    },
    select: { id: true },
  });
  if (ownedBrand) return "PRO";

  // Check if user is an active member of any brand with a valid subscription
  const membership = await prisma.companyMember.findFirst({
    where: {
      userId,
      status: "active",
      company: {
        subscriptionTier: { not: "" },
        OR: [
          { subscriptionExpiresAt: null },
          { subscriptionExpiresAt: { gte: new Date() } },
        ],
      },
    },
    select: { id: true },
  });
  if (membership) return "PRO";

  return personalTier;
}

/** Helper: check tier + return 403 response if blocked */
export function tierBlockedResponse(feature: string) {
  return {
    error: `Upgrade required: ${feature} is not available on your current plan.`,
    upgradeRequired: true,
    feature,
  };
}
