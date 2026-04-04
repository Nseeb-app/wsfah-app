import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.brewLog.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.rating !== undefined) data.rating = body.rating ? parseFloat(body.rating) : null;
  if (body.grindSize !== undefined) data.grindSize = body.grindSize;
  if (body.waterTemp !== undefined) data.waterTemp = body.waterTemp ? parseFloat(body.waterTemp) : null;
  if (body.brewTime !== undefined) data.brewTime = body.brewTime ? parseInt(body.brewTime) : null;
  if (body.coffeeGrams !== undefined) data.coffeeGrams = body.coffeeGrams ? parseFloat(body.coffeeGrams) : null;
  if (body.waterMl !== undefined) data.waterMl = body.waterMl ? parseFloat(body.waterMl) : null;
  if (body.acidity !== undefined) data.acidity = body.acidity ? parseFloat(body.acidity) : null;
  if (body.body !== undefined) data.body = body.body ? parseFloat(body.body) : null;
  if (body.sweetness !== undefined) data.sweetness = body.sweetness ? parseFloat(body.sweetness) : null;
  if (body.flavorNotes !== undefined) data.flavorNotes = body.flavorNotes ? JSON.stringify(body.flavorNotes) : null;

  const updated = await prisma.brewLog.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.brewLog.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.brewLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
