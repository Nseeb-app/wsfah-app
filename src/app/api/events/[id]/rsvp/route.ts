import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { parseBody, rsvpSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = parseBody(rsvpSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Toggle: if existing RSVP, delete it; otherwise create
  const existing = await prisma.eventRsvp.findUnique({
    where: { eventId_userId: { eventId: id, userId: user.id } },
  });

  if (existing) {
    await prisma.eventRsvp.delete({ where: { id: existing.id } });
    return NextResponse.json({ rsvp: null });
  }

  await prisma.eventRsvp.create({
    data: {
      eventId: id,
      userId: user.id,
      status: parsed.data.status,
    },
  });

  return NextResponse.json({ rsvp: parsed.data.status });
}
