import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

// GET /api/chat/conversations/[id]/messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: id, userId: user.id },
  });
  if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const where: Record<string, unknown> = { conversationId: id };
  if (after) {
    where.createdAt = { gt: new Date(after) };
  }

  const messages = await prisma.message.findMany({
    where,
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: after ? "asc" : "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  // Update last read
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json(messages.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.sender.name,
    senderImage: m.sender.image,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  })));
}

// POST /api/chat/conversations/[id]/messages
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { body } = await req.json();

  if (!body || typeof body !== "string" || body.trim().length === 0) {
    return NextResponse.json({ error: "Message body required" }, { status: 400 });
  }
  if (body.length > 2000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: id, userId: user.id },
  });
  if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const trimmedBody = body.trim();
  const now = new Date();

  const msg = await prisma.message.create({
    data: { conversationId: id, senderId: user.id, body: trimmedBody },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: now },
  });

  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: now },
  });

  // Push notification to other participants
  const otherParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId: id, userId: { not: user.id } },
    select: { userId: true },
  });
  for (const p of otherParticipants) {
    sendPushNotification(
      p.userId,
      msg.sender.name || "رسالة جديدة",
      trimmedBody.length > 100 ? trimmedBody.slice(0, 100) + "..." : trimmedBody,
      { type: "MESSAGE", conversationId: id }
    );
  }

  return NextResponse.json({
    id: msg.id,
    conversationId: id,
    senderId: user.id,
    senderName: msg.sender.name,
    senderImage: msg.sender.image,
    body: trimmedBody,
    createdAt: msg.createdAt.toISOString(),
  }, { status: 201 });
}
