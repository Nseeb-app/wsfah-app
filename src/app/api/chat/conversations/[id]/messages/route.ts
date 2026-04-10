import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";
import { notify } from "@/lib/notify";
import {
  conversationsCollection,
  messagesCollection,
  ensureIndexes,
  ObjectId,
} from "@/lib/mongodb";

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

  await ensureIndexes();
  const convs = await conversationsCollection();

  // Verify user is participant
  let convId: ObjectId;
  try {
    convId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
  }

  const conversation = await convs.findOne({
    _id: convId,
    participantIds: user.id,
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const msgs = await messagesCollection();

  // Build query
  const query: Record<string, unknown> = { conversationId: id };
  if (after) {
    query.createdAt = { $gt: new Date(after) };
  }
  if (cursor) {
    query._id = after ? { ...query._id as object, $lt: new ObjectId(cursor) } : { $lt: new ObjectId(cursor) };
  }

  const sortDir = after ? 1 : -1;
  const messages = await msgs
    .find(query)
    .sort({ createdAt: sortDir })
    .limit(limit)
    .toArray();

  // Update last read
  await convs.updateOne(
    { _id: convId },
    { $set: { [`lastReadAt.${user.id}`]: new Date() } }
  );

  return NextResponse.json(
    messages.map((m) => ({
      id: m._id!.toString(),
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName,
      senderImage: m.senderImage,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    }))
  );
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

  await ensureIndexes();
  const convs = await conversationsCollection();

  let convId: ObjectId;
  try {
    convId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
  }

  // Verify user is participant
  const conversation = await convs.findOne({
    _id: convId,
    participantIds: user.id,
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get sender info from PostgreSQL
  const sender = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, image: true },
  });

  const trimmedBody = body.trim();
  const now = new Date();

  const msgs = await messagesCollection();
  const result = await msgs.insertOne({
    conversationId: id,
    senderId: user.id,
    senderName: sender?.name || null,
    senderImage: sender?.image || null,
    body: trimmedBody,
    createdAt: now,
  });

  // Update conversation
  await convs.updateOne(
    { _id: convId },
    {
      $set: {
        lastMessage: { body: trimmedBody, senderId: user.id, createdAt: now },
        updatedAt: now,
        [`lastReadAt.${user.id}`]: now,
      },
    }
  );

  // Push + in-app notifications to other participants
  const otherParticipantIds = conversation.participantIds.filter(
    (pid) => pid !== user.id
  );
  const msgPreview = trimmedBody.length > 100 ? trimmedBody.slice(0, 100) + "..." : trimmedBody;
  const msgTitle = sender?.name || "رسالة جديدة";

  for (const pid of otherParticipantIds) {
    notify(pid, "MESSAGE", msgTitle, msgPreview, `/chat/${id}`);
    sendPushNotification(pid, msgTitle, msgPreview, {
      type: "MESSAGE",
      conversationId: id,
    });
  }

  return NextResponse.json(
    {
      id: result.insertedId.toString(),
      conversationId: id,
      senderId: user.id,
      senderName: sender?.name || null,
      senderImage: sender?.image || null,
      body: trimmedBody,
      createdAt: now.toISOString(),
    },
    { status: 201 }
  );
}
