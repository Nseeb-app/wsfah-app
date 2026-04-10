import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { parseBody, messageSchema } from "@/lib/validation";
import { sendPushNotification } from "@/lib/push";
import { notify } from "@/lib/notify";
import {
  conversationsCollection,
  messagesCollection,
  ensureIndexes,
  ObjectId,
} from "@/lib/mongodb";

export async function POST(
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

  const body = await request.json();
  const parsed = parseBody(messageSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Get sender info from PostgreSQL
  const sender = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, image: true },
  });

  const trimmedBody = parsed.data.body.trim();
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
      body: trimmedBody,
      createdAt: now,
      sender: { id: user.id, name: sender?.name || null, image: sender?.image || null },
    },
    { status: 201 }
  );
}
