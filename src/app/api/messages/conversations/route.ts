import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { parseBody, conversationCreateSchema } from "@/lib/validation";
import { getUserTier, hasFeature, tierBlockedResponse } from "@/lib/features";
import {
  conversationsCollection,
  ensureIndexes,
} from "@/lib/mongodb";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureIndexes();
  const convs = await conversationsCollection();
  const mongoConvs = await convs
    .find({ participantIds: user.id })
    .sort({ updatedAt: -1 })
    .limit(50)
    .toArray();

  const result = mongoConvs.map((c) => {
    const lastRead = c.lastReadAt?.[user.id] || new Date(0);
    const otherParticipant = c.participants.find((p) => p.userId !== user.id);
    const lastMessage = c.lastMessage || null;
    const myLastReadAt = c.lastReadAt?.[user.id] || null;

    return {
      id: c._id!.toString(),
      updatedAt: c.updatedAt,
      otherUser: otherParticipant
        ? { id: otherParticipant.userId, name: otherParticipant.name, image: otherParticipant.image }
        : null,
      lastMessage: lastMessage
        ? {
            body: lastMessage.body,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
            sender: { id: lastMessage.senderId, name: null },
          }
        : null,
      lastReadAt: myLastReadAt,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Subscription gating
  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "messages")) {
    return NextResponse.json(tierBlockedResponse("Direct messages"), { status: 403 });
  }

  const body = await request.json();
  const parsed = parseBody(conversationCreateSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { userId } = parsed.data;
  if (userId === user.id) {
    return NextResponse.json({ error: "Cannot create conversation with yourself" }, { status: 400 });
  }

  // Get both users' info from PostgreSQL
  const [currentUser, otherUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, image: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, image: true } }),
  ]);
  if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await ensureIndexes();
  const convs = await conversationsCollection();

  // Check if conversation already exists
  const existing = await convs.findOne({
    participantIds: { $all: [user.id, userId], $size: 2 },
  });

  if (existing) {
    return NextResponse.json(
      {
        id: existing._id!.toString(),
        participants: existing.participants.map((p) => ({
          user: { id: p.userId, name: p.name, image: p.image },
        })),
      },
      { status: 201 }
    );
  }

  const now = new Date();
  const result = await convs.insertOne({
    participantIds: [user.id, userId],
    participants: [
      { userId: user.id, name: currentUser?.name || null, image: currentUser?.image || null },
      { userId: otherUser.id, name: otherUser.name, image: otherUser.image },
    ],
    lastMessage: null,
    lastReadAt: { [user.id]: now, [userId]: now },
    updatedAt: now,
    createdAt: now,
  });

  return NextResponse.json(
    {
      id: result.insertedId.toString(),
      participants: [
        { user: { id: user.id, name: currentUser?.name, image: currentUser?.image } },
        { user: { id: otherUser.id, name: otherUser.name, image: otherUser.image } },
      ],
    },
    { status: 201 }
  );
}
