import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseBody, productReviewSchema } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const reviews = await prisma.productReview.findMany({
    where: { productId: id },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({
    reviews,
    nextCursor: reviews.length === limit ? reviews[reviews.length - 1].id : null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = parseBody(productReviewSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Upsert review and recalculate product stats in a transaction
  const review = await prisma.$transaction(async (tx) => {
    const upserted = await tx.productReview.upsert({
      where: {
        productId_userId: { productId: id, userId: userId },
      },
      create: {
        productId: id,
        userId: userId,
        rating: parsed.data.rating,
        body: parsed.data.body,
      },
      update: {
        rating: parsed.data.rating,
        body: parsed.data.body,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Recalculate avgRating and reviewCount
    const stats = await tx.productReview.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.product.update({
      where: { id },
      data: {
        avgRating: stats._avg.rating || 0,
        reviewCount: stats._count.id,
      },
    });

    return upserted;
  });

  return NextResponse.json(review, { status: 201 });
}
