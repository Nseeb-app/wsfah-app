import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const type = url.searchParams.get("type") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

  const where: any = { status: "APPROVED" };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (type) {
    where.type = type;
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      owner: { select: { name: true, image: true } },
      _count: { select: { products: true, recipes: true, galleryPosts: true } },
    },
    orderBy: [{ isPromoted: "desc" }, { isVerified: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return NextResponse.json(companies);
}
