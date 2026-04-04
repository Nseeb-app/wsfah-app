import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { parseBody, conversationCreateSchema } from "@/lib/validation";
import { getUserTier, hasFeature, tierBlockedResponse } from "@/lib/features";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: user.id } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
  });

  const result = conversations.map((c) => {
    const otherParticipant = c.participants.find(
      (p) => p.userId !== user!.id
    );
    const myParticipant = c.participants.find(
      (p) => p.userId === user!.id
    );
    const lastMessage = c.messages[0] || null;

    return {
      id: c.id,
      updatedAt: c.updatedAt,
      otherUser: otherParticipant?.user || null,
      lastMessage,
      lastReadAt: myParticipant?.lastReadAt || null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Subscription gating
  const tier = await getUserTier(user.id);
  if (!hasFeature(tier, "messages")) {
    return NextResponse.json(tierBlockedResponse("Direct messages"), { status: 403 });
  }

  const body = await request.json();
  const parsed = parseBody(conversationCreateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { userId } = parsed.data;

  if (userId === user.id) {
    return NextResponse.json(
      { error: "Cannot create conversation with yourself" },
      { status: 400 }
    );
  }

  // Check if conversation already exists between the two users
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (existing) {
    return NextResponse.json(existing, { status: 201 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user.id }, { userId }],
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
