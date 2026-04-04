import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/jwt";
import { getUserTier } from "@/lib/features";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }

  const tokenData = await verifyMobileToken(authHeader.slice(7));
  if (!tokenData) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: cors });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenData.id },
    select: {
      id: true, name: true, email: true, image: true, role: true,
      points: true, subscriptionTier: true, bio: true, phone: true,
      followers: true, following: true,
      _count: {
        select: {
          recipes: true,
          brewLogs: true,
          saves: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404, headers: cors });
  }

  // Resolve effective tier (Pro if part of active roaster)
  const effectiveTier = await getUserTier(user.id);

  return NextResponse.json({
    ...user,
    subscriptionTier: effectiveTier,
    recipeCount: user._count.recipes,
    brewCount: user._count.brewLogs,
    savedCount: user._count.saves,
    avgRating: 0,
    _count: undefined,
  }, { headers: cors });
}
