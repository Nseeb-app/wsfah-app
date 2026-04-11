import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

// GET /api/users/[id]/followers?type=followers|following
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "followers";

  if (type === "following") {
    const following = await prisma.follow.findMany({
      where: { followerId: id },
      include: {
        following: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      following.map((f) => ({
        id: f.following.id,
        name: f.following.name,
        image: f.following.image,
      }))
    );
  }

  // Default: followers
  const followers = await prisma.follow.findMany({
    where: { followingId: id },
    include: {
      follower: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    followers.map((f) => ({
      id: f.follower.id,
      name: f.follower.name,
      image: f.follower.image,
    }))
  );
}
