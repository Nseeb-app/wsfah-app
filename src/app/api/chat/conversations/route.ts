import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { getUserTier, hasFeature } from "@/lib/features";
import {
  conversationsCollection,
  ensureIndexes,
  ObjectId,
} from "@/lib/mongodb";

// GET /api/chat/conversations — list user's conversations
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "messages")) {
    return NextResponse.json(
      { error: "Messages require Pro plan", upgradeRequired: true, feature: "الرسائل المباشرة" },
      { status: 403 }
    );
  }

  try {
    await ensureIndexes();
    const convs = await conversationsCollection();
    const mongoConvs = await convs
      .find({ participantIds: user.id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    console.log(`[chat] GET conversations: found ${mongoConvs.length} for user ${user.id}`);
    const result = mongoConvs.map((c) => {
      const lastRead = c.lastReadAt?.[user.id] || new Date(0);
      const hasUnread =
        c.lastMessage &&
        c.lastMessage.createdAt > lastRead &&
        c.lastMessage.senderId !== user.id;
      const otherParticipant = c.participants.find((p) => p.userId !== user.id);

      return {
        id: c._id!.toString(),
        otherUser: otherParticipant || null,
        lastMessage: c.lastMessage
          ? {
              body: c.lastMessage.body,
              senderId: c.lastMessage.senderId,
              createdAt: c.lastMessage.createdAt,
            }
          : null,
        hasUnread: !!hasUnread,
        updatedAt: c.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Chat conversations GET error:", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}

// POST /api/chat/conversations — create or get existing
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "messages")) {
    return NextResponse.json(
      { error: "Messages require Pro plan", upgradeRequired: true, feature: "الرسائل المباشرة" },
      { status: 403 }
    );
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === user.id) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  try {
    // Verify other user exists (Prisma/PostgreSQL)
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true },
    });
    if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, image: true },
    });

    await ensureIndexes();
    const convs = await conversationsCollection();

    // Check if conversation already exists
    const existing = await convs.findOne({
      participantIds: { $all: [user.id, userId], $size: 2 },
    });

    if (existing) return NextResponse.json({ id: existing._id!.toString() });

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

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error("Chat conversations POST error:", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
