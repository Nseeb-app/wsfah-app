import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { name, slug, price, currency, interval, description, features, sortOrder } = body;

  if (!name || !slug || price === undefined) {
    return NextResponse.json({ error: "name, slug, and price are required" }, { status: 400 });
  }

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      price: parseFloat(price),
      currency: currency || "USD",
      interval: interval || "monthly",
      description: description || null,
      features: features || null,
      sortOrder: sortOrder || 0,
    },
  });

  return NextResponse.json(plan, { status: 201 });
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
  if (data.slug) data.slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data,
  });

  return NextResponse.json(plan);
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.subscriptionPlan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
