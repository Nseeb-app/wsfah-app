import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseBody, galleryPostSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "30") || 30, 1), 100);

  const posts = await prisma.galleryPost.findMany({
    where: companyId ? { companyId } : {},
    include: {
      author: { select: { id: true, name: true, image: true } },
      company: { select: { id: true, name: true, logo: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only brand admins can post
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, companies: { take: 1, select: { id: true } } },
  });
  if (!user || user.role !== "BRAND_ADMIN") {
    return NextResponse.json({ error: "Only brand admins can post" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = parseBody(galleryPostSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { imageUrl, caption, companyId, mediaType } = parsed.data;

  const resolvedCompanyId = companyId || user.companies[0]?.id || null;

  if (resolvedCompanyId) {
    const company = await prisma.company.findFirst({
      where: { id: resolvedCompanyId, ownerId: session.user.id },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found or not owned by you" }, { status: 403 });
    }
  }

  const post = await prisma.galleryPost.create({
    data: {
      imageUrl,
      mediaType: mediaType || "image",
      caption,
      authorId: session.user.id,
      companyId: resolvedCompanyId,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      company: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
