import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { parseBody } from "@/lib/validation";
import { z } from "zod/v4";

const collectionRecipeSchema = z.object({
  recipeId: z.string().min(1, "Recipe ID required"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: collectionId } = await params;
  const body = await req.json();
  const parsed = parseBody(collectionRecipeSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { recipeId } = parsed.data;

  try {
    // Verify collection exists and user owns it
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Create collection recipe (unique constraint will handle duplicates)
    const collectionRecipe = await prisma.collectionRecipe.create({
      data: {
        collectionId,
        recipeId,
      },
    });

    return NextResponse.json(collectionRecipe, { status: 201 });
  } catch (error) {
    // Handle unique constraint violation (already in collection)
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Recipe already in collection" }, { status: 400 });
    }
    console.error("Error adding recipe to collection:", error);
    return NextResponse.json({ error: "Failed to add recipe to collection" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: collectionId } = await params;
  const body = await req.json();
  const parsed = parseBody(collectionRecipeSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { recipeId } = parsed.data;

  try {
    // Verify collection exists and user owns it
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.collectionRecipe.deleteMany({
      where: {
        collectionId,
        recipeId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing recipe from collection:", error);
    return NextResponse.json({ error: "Failed to remove recipe from collection" }, { status: 500 });
  }
}
