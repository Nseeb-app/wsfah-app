import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  const [users, recipes, totalLikes, totalComments, totalFollows] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: twelveWeeksAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.recipe.findMany({
      where: { createdAt: { gte: twelveWeeksAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.recipeLike.count(),
    prisma.comment.count(),
    prisma.follow.count(),
  ]);

  function groupByWeek(items: { createdAt: Date }[]): { week: string; count: number }[] {
    const weeks: Map<string, number> = new Map();

    // Initialize 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeks.set(label, 0);
    }

    for (const item of items) {
      const diffMs = now.getTime() - item.createdAt.getTime();
      const weeksAgo = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo < 12) {
        const weekStart = new Date(now.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000);
        const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        weeks.set(label, (weeks.get(label) || 0) + 1);
      }
    }

    return Array.from(weeks.entries()).map(([week, count]) => ({ week, count }));
  }

  return NextResponse.json({
    usersPerWeek: groupByWeek(users),
    recipesPerWeek: groupByWeek(recipes),
    totalLikes,
    totalComments,
    totalFollows,
  });
}
