import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { parseBody, groupCreateSchema } from "@/lib/validation";
import { getUserTier, hasFeature, tierBlockedResponse } from "@/lib/features";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const groups = await prisma.group.findMany({
    where: {
      isPublic: true,
      ...(search
        ? { name: { contains: search } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      _count: { select: { members: true } },
      creator: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(groups);
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Subscription gating
  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "groups")) {
    return NextResponse.json(tierBlockedResponse("Groups & events"), { status: 403 });
  }

  const body = await request.json();
  const parsed = parseBody(groupCreateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      ...parsed.data,
      creatorId: user.id,
      members: {
        create: { userId: user.id, role: "ADMIN" },
      },
    },
    include: {
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json(group, { status: 201 });
}
