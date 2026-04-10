import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { conversationsCollection, ensureIndexes } from "@/lib/mongodb";
import { getUserTier, hasFeature } from "@/lib/features";

// GET /api/chat/conversations — list user's conversations
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "messages")) {
    return NextResponse.json({ error: "Messages require Pro plan", upgradeRequired: true, feature: "الرسائل المباشرة" }, { status: 403 });
  }

  await ensureIndexes();
  const convs = await conversationsCollection();

  const conversations = await convs
    .find({ participantIds: user.id })
    .sort({ updatedAt: -1 })
    .limit(50)
    .toArray();

  // Calculate unread for each
  const result = conversations.map((c) => {
    const lastRead = c.lastReadAt?.[user.id] || new Date(0);
    const hasUnread = c.lastMessage && c.lastMessage.createdAt > lastRead && c.lastMessage.senderId !== user.id;
    const otherParticipant = c.participants.find((p) => p.userId !== user.id);
    return {
      id: c._id!.toString(),
      otherUser: otherParticipant || null,
      lastMessage: c.lastMessage,
      hasUnread,
      updatedAt: c.updatedAt,
    };
  });

  return NextResponse.json(result);
}

// POST /api/chat/conversations — create or get existing conversation
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

  await ensureIndexes();
  const convs = await conversationsCollection();

  // Check if conversation already exists
  const existing = await convs.findOne({
    participantIds: { $all: [user.id, userId] },
  });

  if (existing) {
    return NextResponse.json({ id: existing._id!.toString() });
  }

  // Get user info for both participants
  const [currentUser, otherUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true, image: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, image: true } }),
  ]);

  if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const result = await convs.insertOne({
    participantIds: [user.id, userId],
    participants: [
      { userId: user.id, name: currentUser?.name || null, image: currentUser?.image || null },
      { userId, name: otherUser.name || null, image: otherUser.image || null },
    ],
    lastMessage: null,
    lastReadAt: { [user.id]: now, [userId]: now },
    updatedAt: now,
    createdAt: now,
  });

  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}
