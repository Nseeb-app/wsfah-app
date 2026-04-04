import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand } from "@/lib/brand-auth";

// PATCH /api/brands/[id]/rewards/[rewardId] — update brand reward
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; rewardId: string }> }) {
  const { id, rewardId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const reward = await prisma.brandReward.findFirst({
    where: { id: rewardId, companyId: id },
  });
  if (!reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.brandReward.update({
    where: { id: rewardId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.pointsCost !== undefined && { pointsCost: body.pointsCost }),
      ...(body.stock !== undefined && { stock: body.stock }),
      ...(body.publishToMain !== undefined && { publishToMain: body.publishToMain }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
    },
  });

  return NextResponse.json(updated);
}

// POST /api/brands/[id]/rewards/[rewardId]/redeem — not here, see below
