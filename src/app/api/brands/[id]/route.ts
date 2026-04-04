import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      products: {
        select: { id: true, name: true, price: true, imageUrl: true, avgRating: true, reviewCount: true },
        orderBy: { avgRating: "desc" },
      },
      recipes: {
        select: { id: true, title: true, imageUrl: true, category: true, rating: true, likes: true },
        orderBy: { rating: "desc" },
      },
      _count: { select: { products: true, recipes: true, galleryPosts: true } },
    },
  });

  if (!company || company.status !== "APPROVED") {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}
