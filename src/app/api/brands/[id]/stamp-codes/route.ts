import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand } from "@/lib/brand-auth";
import crypto from "crypto";

function generateShortCode(): string {
  // 8-char alphanumeric code, URL-safe
  return crypto.randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
}

// POST /api/brands/[id]/stamp-codes — generate a one-time use stamp code
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const stampCardId = body.stampCardId;
  const validSeconds = body.validSeconds || 10; // default 10s for auto-rotating QR

  if (!stampCardId) {
    return NextResponse.json({ error: "stampCardId required" }, { status: 400 });
  }

  // Verify stamp card belongs to this brand
  const stampCard = await prisma.stampCard.findFirst({
    where: { id: stampCardId, companyId: id, isActive: true },
  });
  if (!stampCard) {
    return NextResponse.json({ error: "Stamp card not found" }, { status: 404 });
  }

  // Cleanup: delete expired unused codes for this brand (keeps DB clean)
  await prisma.stampCode.deleteMany({
    where: {
      companyId: id,
      isUsed: false,
      expiresAt: { lt: new Date() },
    },
  });

  // Generate a unique one-time code stored in DB
  const code = generateShortCode();
  const expiresAt = new Date(Date.now() + validSeconds * 1000);

  const stampCode = await prisma.stampCode.create({
    data: {
      code,
      stampCardId,
      companyId: id,
      issuedById: user.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    stampCode: stampCode.code,
    stampCodeId: stampCode.id,
    expiresAt: stampCode.expiresAt.toISOString(),
    expiresIn: validSeconds,
    stampCardId,
  });
}

// GET /api/brands/[id]/stamp-codes — get recent stamp confirmations (barista view)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const url = new URL(req.url);
  const stampCardId = url.searchParams.get("stampCardId");

  // Get recently used stamp codes (last 30 minutes) for confirmation
  const since = new Date(Date.now() - 30 * 60 * 1000);

  const recentStamps = await prisma.stampCode.findMany({
    where: {
      companyId: id,
      isUsed: true,
      usedAt: { gte: since },
      ...(stampCardId && { stampCardId }),
    },
    include: {
      stamps: {
        include: {
          userStampCard: {
            include: {
              user: { select: { id: true, name: true, image: true } },
              stampCard: { select: { title: true, stampsRequired: true } },
            },
          },
        },
      },
    },
    orderBy: { usedAt: "desc" },
    take: 20,
  });

  const confirmations = recentStamps.map((sc) => {
    const stamp = sc.stamps[0];
    return {
      id: sc.id,
      code: sc.code,
      usedAt: sc.usedAt,
      user: stamp?.userStampCard?.user || null,
      stampCard: stamp?.userStampCard?.stampCard || null,
      currentStamps: stamp?.userStampCard?.currentStamps || 0,
    };
  });

  return NextResponse.json(confirmations);
}
