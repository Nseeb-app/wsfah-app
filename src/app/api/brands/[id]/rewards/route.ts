import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand } from "@/lib/brand-auth";

// GET /api/brands/[id]/rewards — list brand's rewards
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const now = new Date();

  const rewards = await prisma.brandReward.findMany({
    where: {
      companyId: id,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
    },
    orderBy: { pointsCost: "asc" },
  });

  const active = rewards.filter((r) => !r.endDate || r.endDate >= now);
  return NextResponse.json(active);
}

// POST /api/brands/[id]/rewards — create brand reward (brand owner)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, imageUrl, pointsCost, stock, publishToMain, startDate, endDate } = body;

  if (!title || !pointsCost) {
    return NextResponse.json({ error: "title and pointsCost are required" }, { status: 400 });
  }

  const reward = await prisma.brandReward.create({
    data: {
      companyId: id,
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      pointsCost: Math.max(1, pointsCost),
      stock: stock ?? null,
      publishToMain: publishToMain ?? false,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(reward, { status: 201 });
}
