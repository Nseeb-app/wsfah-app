import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const wantRecipes = url.searchParams.get("recipes");

  if (wantRecipes) {
    const search = url.searchParams.get("search") || "";
    const recipes = await prisma.recipe.findMany({
      where: search
        ? { title: { contains: search } }
        : undefined,
      select: {
        id: true,
        title: true,
        category: true,
        difficulty: true,
        brewTime: true,
        brewTimeSeconds: true,
        isFeatured: true,
        isVerified: true,
        accessTier: true,
        imageUrl: true,
        description: true,
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ recipes });
  }

  const [totalUsers, totalRecipes, totalBrands, pointsResult, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.recipe.count(),
    prisma.company.count(),
    prisma.user.aggregate({ _sum: { points: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalRecipes,
    totalBrands,
    totalPoints: pointsResult._sum.points || 0,
    recentUsers,
  });
}
