import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20") || 20, 1), 50);

  const posts = await prisma.galleryPost.findMany({
    where: {
      status: "APPROVED",
      ...(companyId ? { companyId } : {}),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      company: { select: { id: true, name: true, logo: true } },
      _count: { select: { galleryLikes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      likesCount: p._count.galleryLikes,
      commentsCount: p._count.comments,
      _count: undefined,
    })),
    nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
  });
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { imageUrl, caption, body: textBody, companyId, mediaType } = body;

  // Need at least text or image
  if (!imageUrl && !textBody?.trim()) {
    return NextResponse.json({ error: "يجب إضافة نص أو صورة" }, { status: 400 });
  }

  // Check if brand admin posting for company
  let resolvedCompanyId: string | null = null;
  let status = "PENDING"; // Community posts need approval

  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: user.id },
    });
    if (company) {
      resolvedCompanyId = companyId;
      status = "APPROVED"; // Brand posts auto-approved
    }
  }

  const post = await prisma.galleryPost.create({
    data: {
      imageUrl: imageUrl || null,
      mediaType: mediaType || "image",
      caption: caption?.slice(0, 500) || null,
      body: textBody?.slice(0, 2000) || null,
      status,
      authorId: user.id,
      companyId: resolvedCompanyId,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      company: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ ...post, isPending: status === "PENDING" }, { status: 201 });
}
