import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { getUserTier, hasFeature } from "@/lib/features";

// GET /api/chat/conversations — list user's conversations (always Prisma)
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "messages")) {
    return NextResponse.json({ error: "Messages require Pro plan", upgradeRequired: true, feature: "الرسائل المباشرة" }, { status: 403 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      participants: { include: { user: { select: { id: true, name: true, image: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const result = conversations.map((c) => {
    const otherP = c.participants.find((p) => p.userId !== user.id);
    const myParticipant = c.participants.find((p) => p.userId === user.id);
    const lastMsg = c.messages[0];
    const hasUnread = lastMsg && myParticipant?.lastReadAt
      ? lastMsg.createdAt > myParticipant.lastReadAt && lastMsg.senderId !== user.id
      : false;

    return {
      id: c.id,
      otherUser: otherP ? { userId: otherP.user.id, name: otherP.user.name, image: otherP.user.image } : null,
      lastMessage: lastMsg ? { body: lastMsg.body, senderId: lastMsg.senderId, createdAt: lastMsg.createdAt.toISOString() } : null,
      hasUnread,
      updatedAt: c.updatedAt.toISOString(),
    };
  });

  // Also check MongoDB for conversations created via old API
  try {
    const { conversationsCollection } = await import("@/lib/mongodb");
    const convs = await conversationsCollection();
    const mongoConvs = await convs
      .find({ participantIds: user.id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    const mongoResult = mongoConvs.map((c) => {
      const lastRead = c.lastReadAt?.[user.id] || new Date(0);
      const hasUnread = c.lastMessage && c.lastMessage.createdAt > lastRead && c.lastMessage.senderId !== user.id;
      const otherParticipant = c.participants.find((p) => p.userId !== user.id);
      return {
        id: c._id!.toString(),
        otherUser: otherParticipant || null,
        lastMessage: c.lastMessage,
        hasUnread: !!hasUnread,
        updatedAt: c.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json([...result, ...mongoResult]);
  } catch {
    // MongoDB not available — return Prisma results only
    return NextResponse.json(result);
  }
}

// POST /api/chat/conversations — create or get existing (always Prisma)
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "messages")) {
    return NextResponse.json({ error: "Messages require Pro plan", upgradeRequired: true, feature: "الرسائل المباشرة" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === user.id) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  // Check if conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId } } },
      ],
    },
  });

  if (existing) return NextResponse.json({ id: existing.id });

  // Verify other user exists
  const otherUser = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const conv = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user.id }, { userId }],
      },
    },
  });

  return NextResponse.json({ id: conv.id }, { status: 201 });
}
