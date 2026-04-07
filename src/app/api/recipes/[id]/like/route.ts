import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { recordActivity } from "@/lib/activity";
import { trackChallengeProgress } from "@/lib/challenges";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ liked: false });
  }
  const { id } = await params;
  const recipe = await prisma.recipe.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true },
  });
  if (!recipe) return NextResponse.json({ liked: false });

  const like = await prisma.recipeLike.findUnique({
    where: { userId_recipeId: { userId: user.id, recipeId: recipe.id } },
  });
  return NextResponse.json({ liked: !!like });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const recipe = await prisma.recipe.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true, authorId: true, title: true },
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.recipeLike.findUnique({
    where: { userId_recipeId: { userId: user.id, recipeId: recipe.id } },
  });

  if (existing) {
    // Unlike
    await prisma.$transaction([
      prisma.recipeLike.delete({ where: { id: existing.id } }),
      prisma.recipe.update({ where: { id: recipe.id }, data: { likes: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ liked: false });
  } else {
    // Like + notify author
    const ops = [
      prisma.recipeLike.create({ data: { userId: user.id, recipeId: recipe.id } }),
      prisma.recipe.update({ where: { id: recipe.id }, data: { likes: { increment: 1 } } }),
    ];
    if (recipe.authorId !== user.id) {
      ops.push(
        prisma.notification.create({
          data: {
            userId: recipe.authorId,
            type: "LIKE",
            title: "New Like",
            body: `Someone liked your recipe "${recipe.title}"`,
            link: `/recipe/${id}`,
          },
        }) as never
      );
    }
    await prisma.$transaction(ops);

    // Record activity
    recordActivity(user.id, "LIKE", recipe.id, "recipe", { title: recipe.title });

    // Track challenge progress (Social category)
    trackChallengeProgress(user.id, "Social");

    return NextResponse.json({ liked: true });
  }
}
