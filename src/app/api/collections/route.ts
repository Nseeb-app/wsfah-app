import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { parseBody, collectionCreateSchema } from "@/lib/validation";
import { getUserTier, hasFeature, tierBlockedResponse } from "@/lib/features";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { recipes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Subscription gating
  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "collections")) {
    return NextResponse.json(tierBlockedResponse("Collections"), { status: 403 });
  }

  const body = await req.json();
  const parsed = parseBody(collectionCreateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { name, description, isPublic } = parsed.data;

  try {
    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        isPublic: isPublic ?? false,
        userId: user.id,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
