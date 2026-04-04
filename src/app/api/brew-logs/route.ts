import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const recipeId = searchParams.get("recipeId");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (recipeId) where.recipeId = recipeId;

  const logs = await prisma.brewLog.findMany({
    where,
    orderBy: { brewDate: "desc" },
    include: {
      recipe: { select: { id: true, title: true, slug: true, imageUrl: true } },
    },
  });

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    recipeId, title, notes, rating, grindSize, waterTemp,
    brewTime, coffeeGrams, waterMl, imageUrl,
    acidity, body: bodyScore, sweetness, flavorNotes,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const log = await prisma.brewLog.create({
    data: {
      userId: session.user.id,
      recipeId: recipeId || null,
      title,
      notes: notes || null,
      rating: rating ? parseFloat(rating) : null,
      grindSize: grindSize || null,
      waterTemp: waterTemp ? parseFloat(waterTemp) : null,
      brewTime: brewTime ? parseInt(brewTime) : null,
      coffeeGrams: coffeeGrams ? parseFloat(coffeeGrams) : null,
      waterMl: waterMl ? parseFloat(waterMl) : null,
      imageUrl: imageUrl || null,
      acidity: acidity ? parseFloat(acidity) : null,
      body: bodyScore ? parseFloat(bodyScore) : null,
      sweetness: sweetness ? parseFloat(sweetness) : null,
      flavorNotes: flavorNotes ? JSON.stringify(flavorNotes) : null,
    },
  });

  return NextResponse.json(log, { status: 201 });
}
