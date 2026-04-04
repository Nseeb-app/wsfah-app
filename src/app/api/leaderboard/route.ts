import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "points";

  const validSorts = ["points", "recipes", "followers"] as const;
  const sortField = validSorts.includes(sort as (typeof validSorts)[number])
    ? (sort as (typeof validSorts)[number])
    : "points";

  if (sortField === "recipes") {
    // Sort by recipe count
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        followers: true,
        _count: { select: { recipes: true } },
      },
      orderBy: { recipes: { _count: "desc" } },
      take: 50,
    });

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      name: u.name,
      image: u.image,
      points: u.points,
      followers: u.followers,
      recipes: u._count.recipes,
      score: u._count.recipes,
    }));

    return NextResponse.json(ranked);
  }

  // Sort by points or followers
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
      followers: true,
      _count: { select: { recipes: true } },
    },
    orderBy: { [sortField]: "desc" },
    take: 50,
  });

  const ranked = users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name,
    image: u.image,
    points: u.points,
    followers: u.followers,
    recipes: u._count.recipes,
    score: sortField === "points" ? u.points : u.followers,
  }));

  return NextResponse.json(ranked);
}
