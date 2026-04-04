import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseBody, eventCreateSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const events = await prisma.event.findMany({
    where: {
      startDate: { gt: new Date() },
    },
    orderBy: { startDate: "asc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      host: { select: { id: true, name: true, image: true } },
      _count: { select: { rsvps: true } },
    },
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = parseBody(eventCreateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { startDate, endDate, ...rest } = parsed.data;

  const event = await prisma.event.create({
    data: {
      ...rest,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      hostId: session.user.id,
    },
    include: {
      host: { select: { id: true, name: true, image: true } },
      _count: { select: { rsvps: true } },
    },
  });

  return NextResponse.json(event, { status: 201 });
}
