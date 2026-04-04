import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = await prisma.galleryPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      company: { select: { id: true, name: true, logo: true } },
      _count: { select: { galleryLikes: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
