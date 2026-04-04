import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH: Admin approves/rejects or updates a promotion
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, priority, startDate, endDate, adminNotes } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) {
    if (!["PENDING", "APPROVED", "REJECTED", "EXPIRED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status;
  }
  if (priority !== undefined) data.priority = priority;
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
  if (adminNotes !== undefined) data.adminNotes = adminNotes;

  const updated = await prisma.promotionRequest.update({
    where: { id },
    data,
    include: {
      company: { select: { id: true, name: true, logo: true, type: true } },
      requester: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(updated);
}

// DELETE: Admin or owner deletes a promotion request
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const promo = await prisma.promotionRequest.findUnique({
    where: { id },
    select: { requesterId: true },
  });

  if (!promo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (promo.requesterId !== session.user.id && user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.promotionRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
