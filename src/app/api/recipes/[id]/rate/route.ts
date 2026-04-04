import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { parseBody, ratingSchema } from "@/lib/validation";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ userRating: null });
  }

  const existing = await prisma.recipeRating.findUnique({
    where: { userId_recipeId: { userId: user.id, recipeId: id } },
  });

  return NextResponse.json({ userRating: existing?.rating ?? null });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = parseBody(ratingSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { rating } = parsed.data;

  // Transaction-safe: upsert + recalculate atomically
  const result = await prisma.$transaction(async (tx) => {
    await tx.recipeRating.upsert({
      where: { userId_recipeId: { userId: user.id, recipeId: id } },
      create: { userId: user.id, recipeId: id, rating },
      update: { rating },
    });

    const agg = await tx.recipeRating.aggregate({
      where: { recipeId: id },
      _avg: { rating: true },
    });
    const newAvg = Math.round((agg._avg.rating ?? 0) * 10) / 10;

    await tx.recipe.update({
      where: { id },
      data: { rating: newAvg },
    });

    const recipe = await tx.recipe.findUnique({ where: { id }, select: { authorId: true } });
    if (recipe) {
      const authorAgg = await tx.recipeRating.aggregate({
        where: { recipe: { authorId: recipe.authorId } },
        _avg: { rating: true },
      });
      await tx.user.update({
        where: { id: recipe.authorId },
        data: { avgRating: Math.round((authorAgg._avg.rating ?? 0) * 10) / 10 },
      });
    }

    return newAvg;
  });

  return NextResponse.json({ rating: result, userRating: rating });
}
