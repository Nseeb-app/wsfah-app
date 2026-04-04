import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const plans = await prisma.promotionPricing.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { name, placement, duration, price, currency, discount, sortOrder } = body;

  if (!name || !placement || !duration || price === undefined) {
    return NextResponse.json({ error: "name, placement, duration, and price are required" }, { status: 400 });
  }

  const pricing = await prisma.promotionPricing.create({
    data: {
      name,
      placement,
      duration: parseInt(duration),
      price: parseFloat(price),
      currency: currency || "USD",
      discount: parseFloat(discount) || 0,
      sortOrder: sortOrder || 0,
    },
  });

  return NextResponse.json(pricing, { status: 201 });
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (data.price !== undefined) data.price = parseFloat(data.price);
  if (data.duration !== undefined) data.duration = parseInt(data.duration);
  if (data.discount !== undefined) data.discount = parseFloat(data.discount);

  const pricing = await prisma.promotionPricing.update({
    where: { id },
    data,
  });

  return NextResponse.json(pricing);
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.promotionPricing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
