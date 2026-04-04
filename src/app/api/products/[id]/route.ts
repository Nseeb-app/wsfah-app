import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: { select: { ownerId: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.brand.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not your product" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.price !== undefined) data.price = parseFloat(body.price);
  if (body.externalUrl !== undefined) data.externalUrl = body.externalUrl;
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;

  const updated = await prisma.product.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: { select: { ownerId: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.brand.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not your product" }, { status: 403 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
