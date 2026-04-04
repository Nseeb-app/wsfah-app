import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { parseBody, groupPostSchema } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const posts = await prisma.groupPost.findMany({
    where: { groupId: id },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({
    posts,
    nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Must be a member
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });

  if (!member) {
    return NextResponse.json({ error: "Must be a member to post" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = parseBody(groupPostSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const post = await prisma.groupPost.create({
    data: {
      groupId: id,
      authorId: user.id,
      body: parsed.data.body,
      imageUrl: parsed.data.imageUrl,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
