import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET active promotions (public) or all promotions (admin)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all"); // admin wants all

  if (all) {
    // Admin: return all promotion requests
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

    const promotions = await prisma.promotionRequest.findMany({
      include: {
        company: { select: { id: true, name: true, logo: true, type: true } },
        requester: { select: { id: true, name: true, image: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(promotions);
  }

  // Public: return only active/approved promotions
  const now = new Date();
  const promotions = await prisma.promotionRequest.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    },
    include: {
      company: {
        select: { id: true, name: true, logo: true, type: true, description: true },
      },
    },
    orderBy: { priority: "desc" },
    take: 10,
  });

  return NextResponse.json(promotions);
}

// POST: Brand admin submits a promotion request
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { companyId, placement, message, imageUrl } = body;

  if (!companyId || !placement) {
    return NextResponse.json({ error: "companyId and placement are required" }, { status: 400 });
  }

  if (!["HOME_TOP", "EXPLORE_TOP", "BOTH"].includes(placement)) {
    return NextResponse.json({ error: "Invalid placement" }, { status: 400 });
  }

  // Verify user owns this company
  const company = await prisma.company.findFirst({
    where: { id: companyId, ownerId: session.user.id },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found or you don't own it" }, { status: 403 });
  }

  // Check for existing pending request
  const existing = await prisma.promotionRequest.findFirst({
    where: { companyId, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a pending promotion request" }, { status: 409 });
  }

  const promo = await prisma.promotionRequest.create({
    data: {
      companyId,
      requesterId: session.user.id,
      placement,
      message: message?.slice(0, 500) || null,
      imageUrl: imageUrl || null,
    },
    include: {
      company: { select: { id: true, name: true, logo: true } },
    },
  });

  return NextResponse.json(promo, { status: 201 });
}
