import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import {
  conversationsCollection,
  messagesCollection,
  ensureIndexes,
  ObjectId,
} from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await ensureIndexes();
  const convs = await conversationsCollection();

  let convId: ObjectId;
  try {
    convId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
  }

  // Check participation
  const conversation = await convs.findOne({
    _id: convId,
    participantIds: user.id,
  });
  if (!conversation) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 50;

  const msgs = await messagesCollection();
  const query: Record<string, unknown> = { conversationId: id };
  if (cursor) {
    try {
      query._id = { $lt: new ObjectId(cursor) };
    } catch {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }
  }

  const messages = await msgs
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  // Update lastReadAt
  await convs.updateOne(
    { _id: convId },
    { $set: { [`lastReadAt.${user.id}`]: new Date() } }
  );

  const formatted = messages.map((m) => ({
    id: m._id!.toString(),
    conversationId: m.conversationId,
    senderId: m.senderId,
    body: m.body,
    createdAt: m.createdAt,
    sender: { id: m.senderId, name: m.senderName, image: m.senderImage },
  }));

  return NextResponse.json({
    messages: formatted,
    nextCursor: messages.length === limit ? messages[messages.length - 1]._id!.toString() : null,
  });
}
