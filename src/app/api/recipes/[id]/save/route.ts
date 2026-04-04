import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { recordActivity } from "@/lib/activity";
import { getUserTier, canCreateCount, tierBlockedResponse } from "@/lib/features";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ saved: false });
  }
  const { id } = await params;
  const recipe = await prisma.recipe.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true, title: true },
  });
  if (!recipe) return NextResponse.json({ saved: false });

  const save = await prisma.recipeSave.findUnique({
    where: { userId_recipeId: { userId: user.id, recipeId: recipe.id } },
  });
  return NextResponse.json({ saved: !!save });
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
    select: { id: true, title: true },
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.recipeSave.findUnique({
    where: { userId_recipeId: { userId: user.id, recipeId: recipe.id } },
  });

  if (existing) {
    await prisma.recipeSave.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  } else {
    // Subscription gating: check save limit
    const tier = await getUserTier(user.id);
    const saveCount = await prisma.recipeSave.count({ where: { userId: user.id } });
    if (!canCreateCount(tier, saveCount, "saves")) {
      return NextResponse.json(tierBlockedResponse("Unlimited recipe saves"), { status: 403 });
    }

    await prisma.recipeSave.create({ data: { userId: user.id, recipeId: recipe.id } });

    // Record activity
    recordActivity(user.id, "SAVE", recipe.id, "recipe", { title: recipe.title });

    return NextResponse.json({ saved: true });
  }
}
