import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const cursor = searchParams.get("cursor") || undefined;

  try {
    // Get followed user IDs
    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const followedIds = follows.map((f) => f.followingId);

    if (followedIds.length === 0) {
      // No follows yet, return empty
      return NextResponse.json({ activities: [], nextCursor: null });
    }

    // Query activity events from followed users
    const activities = await prisma.activityEvent.findMany({
      where: {
        userId: { in: followedIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = activities.length === limit ? activities[activities.length - 1].id : null;

    return NextResponse.json({ activities, nextCursor });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
