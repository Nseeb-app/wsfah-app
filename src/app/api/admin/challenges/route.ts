import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true } } },
  });
  return NextResponse.json(challenges);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { title, description, icon, rewardPoints, maxProgress, rank, category } = body;

  if (!title || !description || !icon || !rewardPoints || !maxProgress) {
    return NextResponse.json(
      { error: "title, description, icon, rewardPoints, and maxProgress are required" },
      { status: 400 }
    );
  }

  const challenge = await prisma.challenge.create({
    data: {
      title,
      description,
      icon,
      rewardPoints: parseInt(rewardPoints),
      maxProgress: parseInt(maxProgress),
      rank: rank || "Bronze",
      category: category || "General",
    },
  });

  return NextResponse.json(challenge, { status: 201 });
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (data.rewardPoints !== undefined) data.rewardPoints = parseInt(data.rewardPoints);
  if (data.maxProgress !== undefined) data.maxProgress = parseInt(data.maxProgress);

  const challenge = await prisma.challenge.update({
    where: { id },
    data,
  });

  return NextResponse.json(challenge);
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.challenge.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
