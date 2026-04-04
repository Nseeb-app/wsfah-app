import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

// GET /api/my/stamp-cards — user's stamp cards with progress
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await prisma.userStampCard.findMany({
    where: { userId: user.id },
    include: {
      stampCard: {
        include: {
          company: {
            select: { id: true, name: true, logo: true, isVerified: true },
          },
        },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(cards);
}
