import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { getUserTier, hasFeature } from "@/lib/features";

// GET /api/chat/conversations — list user's conversations
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "messages")) {
    return NextResponse.json({ error: "Messages require Pro plan", upgradeRequired: true, feature: "الرسائل المباشرة" }, { status: 403 });
  }

  try {
    const { conversationsCollection, ensureIndexes } = await import("@/lib/mongodb");
    await ensureIndexes();
    const convs = await conversationsCollection();

    const conversations = await convs
      .find({ participantIds: user.id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

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

    // Also check Prisma for conversations created via old API
    const prismaConvs = await prisma.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      include: {
        participants: { include: { user: { select: { id: true, name: true, image: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    const prismaResult = prismaConvs.map((c) => {
      const otherP = c.participants.find((p) => p.userId !== user.id);
      const lastMsg = c.messages[0];
      return {
        id: c.id,
        otherUser: otherP ? { userId: otherP.user.id, name: otherP.user.name, image: otherP.user.image } : null,
        lastMessage: lastMsg ? { body: lastMsg.body, senderId: lastMsg.senderId, createdAt: lastMsg.createdAt.toISOString() } : null,
        hasUnread: false,
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    // Merge MongoDB + Prisma conversations (deduplicate by otherUser)
    const allConvs = [...result, ...prismaResult];
    return NextResponse.json(allConvs);
  } catch (err) {
    console.error("MongoDB conversations error:", err);
    // Full fallback to Prisma
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
      const lastMsg = c.messages[0];
      return {
        id: c.id,
        otherUser: otherP ? { userId: otherP.user.id, name: otherP.user.name, image: otherP.user.image } : null,
        lastMessage: lastMsg ? { body: lastMsg.body, senderId: lastMsg.senderId, createdAt: lastMsg.createdAt.toISOString() } : null,
        hasUnread: false,
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(result);
  }
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

  try {
    const { conversationsCollection, ensureIndexes } = await import("@/lib/mongodb");
    await ensureIndexes();
    const convs = await conversationsCollection();

    // Check if conversation already exists
    const existing = await convs.findOne({
      participantIds: { $all: [user.id, userId] },
    });

    if (existing) {
      return NextResponse.json({ id: existing._id!.toString() });
    }

    // Get user info
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
  } catch (err) {
    console.error("MongoDB create conversation error:", err);
    // Fallback to Prisma
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId } } },
        ],
      },
    });

    if (existing) return NextResponse.json({ id: existing.id });

    const conv = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: user.id }, { userId }],
        },
      },
    });

    return NextResponse.json({ id: conv.id }, { status: 201 });
  }
}
