import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      recipes: {
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          rating: true,
          category: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      badges: {
        include: { badge: true },
      },
      challenges: {
        include: { challenge: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user?.id;

  // Only the user themselves can update their profile
  if (userId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = ["name", "bio", "image"];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      bio: true,
      role: true,
      status: true,
      points: true,
    },
  });

  return NextResponse.json(user);
}
