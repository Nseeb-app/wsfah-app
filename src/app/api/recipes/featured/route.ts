import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const featured = await prisma.recipe.findMany({
    where: { isFeatured: true },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      brand: {
        select: { id: true, name: true, logo: true },
      },
    },
    take: 5,
  });

  // If no featured recipes, return top-rated
  if (featured.length === 0) {
    const topRated = await prisma.recipe.findMany({
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        brand: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: { rating: "desc" },
      take: 5,
    });
    return NextResponse.json(topRated);
  }

  return NextResponse.json(featured);
}
