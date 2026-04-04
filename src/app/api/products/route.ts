import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId") || "";

  const products = await prisma.product.findMany({
    where: brandId ? { brandId } : {},
    include: {
      brand: { select: { id: true, name: true, logo: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, price, imageUrl, externalUrl, brandId } = await req.json();
  if (!name || !brandId) {
    return NextResponse.json({ error: "name and brandId are required" }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: { id: brandId, ownerId: session.user.id },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found or not owned by you" }, { status: 403 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price) || 0,
      imageUrl: imageUrl || null,
      externalUrl: externalUrl || null,
      brandId,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
