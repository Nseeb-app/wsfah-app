import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ liked: false });

  const { id } = await params;
  const existing = await prisma.galleryPostLike.findUnique({
    where: { userId_postId: { userId: user.id, postId: id } },
  });

  return NextResponse.json({ liked: !!existing });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.galleryPostLike.findUnique({
    where: { userId_postId: { userId: user.id, postId: id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.galleryPostLike.delete({ where: { id: existing.id } }),
      prisma.galleryPost.update({ where: { id }, data: { likes: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ liked: false });
  }

  await prisma.$transaction([
    prisma.galleryPostLike.create({ data: { userId: user.id, postId: id } }),
    prisma.galleryPost.update({ where: { id }, data: { likes: { increment: 1 } } }),
  ]);

  return NextResponse.json({ liked: true });
}
