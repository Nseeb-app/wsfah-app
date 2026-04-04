import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rewards = await prisma.reward.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });
  return NextResponse.json(rewards);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { title, category, pointsCost, imageUrl } = body;

  if (!title || !category || !pointsCost) {
    return NextResponse.json(
      { error: "title, category, and pointsCost are required" },
      { status: 400 }
    );
  }

  const reward = await prisma.reward.create({
    data: {
      title,
      category,
      pointsCost: parseInt(pointsCost),
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json(reward, { status: 201 });
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (data.pointsCost !== undefined) data.pointsCost = parseInt(data.pointsCost);

  const reward = await prisma.reward.update({
    where: { id },
    data,
  });

  return NextResponse.json(reward);
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.reward.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
