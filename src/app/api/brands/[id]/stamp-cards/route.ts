import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand } from "@/lib/brand-auth";

// GET /api/brands/[id]/stamp-cards — list active stamp cards for a brand
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const now = new Date();
  const stampCards = await prisma.stampCard.findMany({
    where: {
      companyId: id,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter out expired cards
  const active = stampCards.filter(
    (sc) => !sc.endDate || sc.endDate >= now
  );

  return NextResponse.json(active);
}

// POST /api/brands/[id]/stamp-cards — create a stamp card (brand owner)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, imageUrl, stampsRequired, rewardDescription, stampCooldownMinutes, maxCompletions, startDate, endDate } = body;

  if (!title || !stampsRequired || !rewardDescription) {
    return NextResponse.json({ error: "title, stampsRequired, and rewardDescription are required" }, { status: 400 });
  }

  const stampCard = await prisma.stampCard.create({
    data: {
      companyId: id,
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      stampsRequired: Math.max(1, stampsRequired),
      rewardDescription,
      stampCooldownMinutes: stampCooldownMinutes ?? 60,
      maxCompletions: maxCompletions ?? 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(stampCard, { status: 201 });
}
