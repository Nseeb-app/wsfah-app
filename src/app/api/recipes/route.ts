import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { parseBody, recipeCreateSchema } from "@/lib/validation";
import { logAudit, AUDIT } from "@/lib/audit";
import { recordActivity } from "@/lib/activity";
import { getUserTier, canCreateCount, tierBlockedResponse } from "@/lib/features";
import { trackChallengeProgress } from "@/lib/challenges";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").slice(0, 200);
  const category = (searchParams.get("category") || "").slice(0, 100);
  const difficulty = (searchParams.get("difficulty") || "").slice(0, 50);
  const source = (searchParams.get("source") || "").slice(0, 20);
  const authorId = searchParams.get("authorId") || "";
  const liked = searchParams.get("liked") || "";
  const saved = searchParams.get("saved") || "";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20") || 20, 1), 100);

  // If fetching liked recipes for a user
  if (liked) {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const likes = await prisma.recipeLike.findMany({
      where: { userId: user.id },
      include: {
        recipe: {
          include: {
            author: { select: { id: true, name: true, image: true } },
            brand: { select: { id: true, name: true, logo: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(likes.map((l) => l.recipe));
  }

  // If fetching saved recipes for a user
  if (saved) {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const saves = await prisma.recipeSave.findMany({
      where: { userId: user.id },
      include: {
        recipe: {
          include: {
            author: { select: { id: true, name: true, image: true } },
            brand: { select: { id: true, name: true, logo: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(saves.map((s) => s.recipe));
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      ...(search ? { title: { contains: search } } : {}),
      ...(category ? { category } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(source ? { source } : {}),
      ...(authorId ? { authorId } : {}),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      brand: { select: { id: true, name: true, logo: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Subscription gating: check recipe creation limit
  const tier = await getUserTier(user.id);
  const recipeCount = await prisma.recipe.count({ where: { authorId: user.id } });
  if (!canCreateCount(tier, recipeCount, "recipes")) {
    return NextResponse.json(tierBlockedResponse("Unlimited recipe creation"), { status: 403 });
  }

  const body = await req.json();
  const parsed = parseBody(recipeCreateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const {
    title, description, category, difficulty, brewTime,
    brewTimeSeconds, imageUrl, ingredients, steps, brewParams, brandId,
  } = parsed.data;

  // Validate brandId ownership
  let validatedBrandId: string | undefined;
  if (brandId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (dbUser?.role !== "BRAND_ADMIN") {
      return NextResponse.json({ error: "Only brand admins can publish brand recipes" }, { status: 403 });
    }
    const company = await prisma.company.findFirst({
      where: { id: brandId, ownerId: user.id },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found or you do not own it" }, { status: 403 });
    }
    validatedBrandId = company.id;
  }

  // Support Arabic + Latin characters in slug
  const slug = title
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);

  const recipe = await prisma.recipe.create({
    data: {
      title,
      slug,
      description,
      category,
      difficulty: difficulty || "Beginner",
      brewTime,
      brewTimeSeconds: brewTimeSeconds || 180,
      imageUrl,
      authorId: user.id,
      brandId: validatedBrandId || null,
      source: validatedBrandId ? "BRAND" : "COMMUNITY",
      ingredients: ingredients
        ? { create: ingredients.map((ing, i) => ({ name: ing.name, baseAmount: ing.baseAmount, unit: ing.unit, sortOrder: i })) }
        : undefined,
      steps: steps
        ? { create: steps.map((step, i) => ({ stepNumber: i + 1, title: step.title, description: step.description })) }
        : undefined,
      brewParams: brewParams
        ? { create: { temperature: brewParams.temperature, ratio: brewParams.ratio, grindSize: brewParams.grindSize, brewTimeSec: brewParams.brewTimeSec || 180 } }
        : undefined,
    },
    include: { ingredients: true, steps: true, brewParams: true },
  });

  logAudit(user.id, AUDIT.RECIPE_CREATE, "recipe", recipe.id, { title });

  // Record activity
  recordActivity(user.id, "RECIPE_CREATE", recipe.id, "recipe", { title });

  // Track challenge progress (Brewing category)
  trackChallengeProgress(user.id, "Brewing");

  return NextResponse.json(recipe, { status: 201 });
}
