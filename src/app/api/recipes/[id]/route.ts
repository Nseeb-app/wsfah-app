import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Support lookup by id or slug
  const recipe = await prisma.recipe.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      author: {
        select: { id: true, name: true, image: true, avgRating: true, role: true },
      },
      brand: {
        select: { id: true, name: true, logo: true },
      },
      ingredients: { orderBy: { sortOrder: "asc" } },
      steps: { orderBy: { stepNumber: "asc" } },
      brewParams: true,
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  return NextResponse.json(recipe);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const recipe = await prisma.recipe.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true, authorId: true },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if user is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isAdmin = currentUser?.role === "SUPERADMIN";

  if (recipe.authorId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    description,
    category,
    difficulty,
    brewTime,
    brewTimeSeconds,
    imageUrl,
    ingredients,
    steps,
    brewParams,
    isFeatured,
    isVerified,
    accessTier,
  } = body;

  // Build update data
  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (category !== undefined) data.category = category;
  if (difficulty !== undefined) data.difficulty = difficulty;
  if (brewTime !== undefined) data.brewTime = brewTime;
  if (brewTimeSeconds !== undefined) data.brewTimeSeconds = brewTimeSeconds;
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  // Admin-only fields
  if (isAdmin) {
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (accessTier !== undefined) data.accessTier = accessTier;
  }

  await prisma.recipe.update({
    where: { id: recipe.id },
    data,
  });

  // Replace ingredients if provided
  if (ingredients) {
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
    await prisma.recipeIngredient.createMany({
      data: ingredients.map(
        (ing: { name: string; baseAmount: number; unit: string }, i: number) => ({
          recipeId: recipe.id,
          name: ing.name,
          baseAmount: ing.baseAmount,
          unit: ing.unit,
          sortOrder: i,
        })
      ),
    });
  }

  // Replace steps if provided
  if (steps) {
    await prisma.recipeStep.deleteMany({ where: { recipeId: recipe.id } });
    await prisma.recipeStep.createMany({
      data: steps.map(
        (step: { title: string; description: string }, i: number) => ({
          recipeId: recipe.id,
          stepNumber: i + 1,
          title: step.title,
          description: step.description,
        })
      ),
    });
  }

  // Replace brew params if provided
  if (brewParams) {
    await prisma.brewingParameter.deleteMany({ where: { recipeId: recipe.id } });
    await prisma.brewingParameter.create({
      data: {
        recipeId: recipe.id,
        temperature: brewParams.temperature || "",
        ratio: brewParams.ratio || "",
        grindSize: brewParams.grindSize || "",
        brewTimeSec: brewParams.brewTimeSec || 180,
      },
    });
  }

  // Return full updated recipe
  const fullRecipe = await prisma.recipe.findUnique({
    where: { id: recipe.id },
    include: {
      author: { select: { id: true, name: true, image: true, avgRating: true, role: true } },
      brand: { select: { id: true, name: true, logo: true } },
      ingredients: { orderBy: { sortOrder: "asc" } },
      steps: { orderBy: { stepNumber: "asc" } },
      brewParams: true,
    },
  });

  return NextResponse.json(fullRecipe);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const recipe = await prisma.recipe.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true, authorId: true },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const delUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (recipe.authorId !== session.user.id && delUser?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.recipe.delete({ where: { id: recipe.id } });
  return NextResponse.json({ success: true });
}
