import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";

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

  try {
    const { messagesCollection, conversationsCollection, ensureIndexes, ObjectId } = await import("@/lib/mongodb");
    await ensureIndexes();
    const msgs = await messagesCollection();
    const convs = await conversationsCollection();

    const conv = await convs.findOne({ _id: new ObjectId(id), participantIds: user.id });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const query: Record<string, unknown> = { conversationId: id };
    if (after) query.createdAt = { $gt: new Date(after) };
    else if (cursor) query._id = { $lt: new ObjectId(cursor) };

    const messages = await msgs
      .find(query)
      .sort({ createdAt: after ? 1 : -1 })
      .limit(limit)
      .toArray();

    await convs.updateOne(
      { _id: new ObjectId(id) },
      { $set: { [`lastReadAt.${user.id}`]: new Date() } }
    );

    return NextResponse.json(messages.map((m) => ({
      id: m._id!.toString(),
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName,
      senderImage: m.senderImage,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error("MongoDB messages GET error:", err);
    // Fallback to Prisma
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: { sender: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
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

  const sender = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, image: true },
  });

  const now = new Date();
  const trimmedBody = body.trim();

  try {
    const { messagesCollection, conversationsCollection, ensureIndexes, ObjectId } = await import("@/lib/mongodb");
    await ensureIndexes();
    const msgs = await messagesCollection();
    const convs = await conversationsCollection();

    const conv = await convs.findOne({ _id: new ObjectId(id), participantIds: user.id });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const message = {
      conversationId: id,
      senderId: user.id,
      senderName: sender?.name || null,
      senderImage: sender?.image || null,
      body: trimmedBody,
      createdAt: now,
    };

    const result = await msgs.insertOne(message);

    await convs.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          lastMessage: { body: trimmedBody, senderId: user.id, createdAt: now },
          updatedAt: now,
          [`lastReadAt.${user.id}`]: now,
        },
      }
    );

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...message,
      createdAt: now.toISOString(),
    }, { status: 201 });
  } catch (err) {
    console.error("MongoDB messages POST error:", err);
    // Fallback to Prisma
    const msg = await prisma.message.create({
      data: { conversationId: id, senderId: user.id, body: trimmedBody },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: now },
    });

    return NextResponse.json({
      id: msg.id,
      conversationId: id,
      senderId: user.id,
      senderName: sender?.name || null,
      senderImage: sender?.image || null,
      body: trimmedBody,
      createdAt: msg.createdAt.toISOString(),
    }, { status: 201 });
  }
}
