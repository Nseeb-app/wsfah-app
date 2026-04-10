import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser(request);

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { members: true } },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Check if current user is a member
  let isMember = false;
  if (user) {
    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: user.id },
    });
    isMember = !!membership;
  }

  return NextResponse.json({ ...group, isMember });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.creatorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.group.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
