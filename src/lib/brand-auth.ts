import { prisma } from "@/lib/prisma";

// Seat limits per roaster subscription tier
export const SEAT_LIMITS: Record<string, number> = {
  basic: 1,
  pro: 5,
  enterprise: Infinity, // custom / unlimited
};

/** Check if a user can manage a brand (owner or active team member) */
export async function canManageBrand(userId: string, companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true, subscriptionTier: true },
  });
  if (!company) return { allowed: false as const, company: null };

  // Owner always has access
  if (company.ownerId === userId) {
    return { allowed: true as const, company, role: "owner" as const };
  }

  // Check team membership
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });

  if (membership && membership.status === "active") {
    return { allowed: true as const, company, role: membership.role as "admin" | "staff" };
  }

  return { allowed: false as const, company };
}

/** Get current active member count for a company (excluding owner) */
export async function getActiveMemberCount(companyId: string) {
  return prisma.companyMember.count({
    where: { companyId, status: "active" },
  });
}

/** Check if company can add more members based on tier */
export async function canAddMember(companyId: string, tier: string) {
  const limit = SEAT_LIMITS[tier.toLowerCase()] ?? 1;
  const current = await getActiveMemberCount(companyId);
  // +1 for owner who is not in CompanyMember table
  return { canAdd: current + 1 < limit, current: current + 1, limit };
}
