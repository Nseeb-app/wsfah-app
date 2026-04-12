import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";

// GET /api/groups/[id]/members — list group members
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const members = await prisma.groupMember.findMany({
    where: { groupId: id },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      image: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt,
    }))
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  const member = await prisma.groupMember.create({
    data: { groupId: id, userId: user.id },
  });

  return NextResponse.json(member, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });

  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 404 });
  }

  await prisma.groupMember.delete({
    where: { id: member.id },
  });

  return NextResponse.json({ success: true });
}
