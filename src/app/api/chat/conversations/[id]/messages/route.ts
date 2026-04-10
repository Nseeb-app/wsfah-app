import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import {
  messagesCollection,
  conversationsCollection,
  ensureIndexes,
  ObjectId,
} from "@/lib/mongodb";

// GET /api/chat/conversations/[id]/messages — fetch messages with polling support
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after"); // for polling: get messages after this timestamp
  const cursor = searchParams.get("cursor"); // for pagination: get older messages before this ID
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  await ensureIndexes();
  const msgs = await messagesCollection();
  const convs = await conversationsCollection();

  // Verify user is participant
  const conv = await convs.findOne({ _id: new ObjectId(id), participantIds: user.id });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build query
  const query: Record<string, unknown> = { conversationId: id };

  if (after) {
    // Polling: get new messages since timestamp
    query.createdAt = { $gt: new Date(after) };
  } else if (cursor) {
    // Pagination: get older messages
    query._id = { $lt: new ObjectId(cursor) };
  }

  const messages = await msgs
    .find(query)
    .sort({ createdAt: after ? 1 : -1 }) // ascending for new, descending for older
    .limit(limit)
    .toArray();

  // Update last read
  await convs.updateOne(
    { _id: new ObjectId(id) },
    { $set: { [`lastReadAt.${user.id}`]: new Date() } }
  );

  const result = messages.map((m) => ({
    id: m._id!.toString(),
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.senderName,
    senderImage: m.senderImage,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));

  return NextResponse.json(result);
}

// POST /api/chat/conversations/[id]/messages — send a message
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
    return NextResponse.json({ error: "Message too long (max 2000)" }, { status: 400 });
  }

  await ensureIndexes();
  const msgs = await messagesCollection();
  const convs = await conversationsCollection();

  // Verify user is participant
  const conv = await convs.findOne({ _id: new ObjectId(id), participantIds: user.id });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get sender info
  const sender = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, image: true },
  });

  const now = new Date();
  const message = {
    conversationId: id,
    senderId: user.id,
    senderName: sender?.name || null,
    senderImage: sender?.image || null,
    body: body.trim(),
    createdAt: now,
  };

  const result = await msgs.insertOne(message);

  // Update conversation with last message
  await convs.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        lastMessage: { body: body.trim(), senderId: user.id, createdAt: now },
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
}
