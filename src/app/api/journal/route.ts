import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { parseBody, brewLogSchema } from "@/lib/validation";
import { getUserTier, canCreateCount, tierBlockedResponse } from "@/lib/features";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20") || 20, 1), 100);
  const month = searchParams.get("month"); // YYYY-MM

  const where: Record<string, unknown> = { userId: user.id };

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    where.brewDate = { gte: start, lt: end };
  }

  const logs = await prisma.brewLog.findMany({
    where,
    include: {
      recipe: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { brewDate: "desc" },
    take: limit,
  });

  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Subscription gating: check journal log limit
  const tier = await getUserTier(user.id);
  const logCount = await prisma.brewLog.count({ where: { userId: user.id } });
  if (!canCreateCount(tier, logCount, "journalLogs")) {
    return NextResponse.json(tierBlockedResponse("Unlimited brew journal"), { status: 403 });
  }

  const body = await req.json();
  const parsed = parseBody(brewLogSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { title, recipeId, notes, rating, grindSize, waterTemp, brewTime, coffeeGrams, waterMl, imageUrl, brewDate } = parsed.data;

  const log = await prisma.brewLog.create({
    data: {
      title,
      recipeId: recipeId || null,
      notes: notes || null,
      rating: rating || null,
      grindSize: grindSize || null,
      waterTemp: waterTemp || null,
      brewTime: brewTime || null,
      coffeeGrams: coffeeGrams || null,
      waterMl: waterMl || null,
      imageUrl: imageUrl || null,
      brewDate: brewDate ? new Date(brewDate) : new Date(),
      userId: user.id,
    },
    include: {
      recipe: { select: { id: true, title: true, slug: true } },
    },
  });

  return NextResponse.json(log, { status: 201 });
}
