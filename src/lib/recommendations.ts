import { prisma } from "@/lib/prisma";

export async function getRecommendations(userId: string, limit = 10) {
  // 1. Get user's engaged recipe IDs (liked, saved, rated)
  const [likes, saves, ratings] = await Promise.all([
    prisma.recipeLike.findMany({ where: { userId }, select: { recipeId: true } }),
    prisma.recipeSave.findMany({ where: { userId }, select: { recipeId: true } }),
    prisma.recipeRating.findMany({ where: { userId }, select: { recipeId: true, rating: true } }),
  ]);

  const engagedIds = new Set([
    ...likes.map(l => l.recipeId),
    ...saves.map(s => s.recipeId),
    ...ratings.map(r => r.recipeId),
  ]);

  // 2. Build taste profile from engaged recipes
  const engagedRecipes = await prisma.recipe.findMany({
    where: { id: { in: [...engagedIds] } },
    select: { category: true, difficulty: true },
  });

  const categoryWeights: Record<string, number> = {};
  const difficultyWeights: Record<string, number> = {};
  for (const r of engagedRecipes) {
    categoryWeights[r.category] = (categoryWeights[r.category] || 0) + 1;
    difficultyWeights[r.difficulty] = (difficultyWeights[r.difficulty] || 0) + 1;
  }

  // 3. Get candidate recipes (exclude engaged)
  const candidates = await prisma.recipe.findMany({
    where: { id: { notIn: [...engagedIds] } },
    include: {
      author: { select: { id: true, name: true, image: true } },
      brand: { select: { id: true, name: true, logo: true } },
    },
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  // 4. Score each candidate
  const scored = candidates.map(recipe => {
    let score = 0;
    score += (categoryWeights[recipe.category] || 0) * 3;
    score += (difficultyWeights[recipe.difficulty] || 0) * 2;
    score += recipe.rating * 1;
    score += recipe.likes * 0.1;
    return { ...recipe, score };
  });

  // 5. Sort by score desc, return top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
