import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand } from "@/lib/brand-auth";

// PATCH /api/brands/[id]/stamp-cards/[cardId] — update stamp card (brand owner)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; cardId: string }> }) {
  const { id, cardId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const stampCard = await prisma.stampCard.findFirst({
    where: { id: cardId, companyId: id },
  });
  if (!stampCard) {
    return NextResponse.json({ error: "Stamp card not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.stampCard.update({
    where: { id: cardId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.rewardDescription !== undefined && { rewardDescription: body.rewardDescription }),
      ...(body.stampCooldownMinutes !== undefined && { stampCooldownMinutes: body.stampCooldownMinutes }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/brands/[id]/stamp-cards/[cardId] — deactivate stamp card
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; cardId: string }> }) {
  const { id, cardId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.stampCard.update({
    where: { id: cardId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
