import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseBody } from "@/lib/validation";

const pushSubscribeSchema = z.object({
  endpoint: z.string().min(1, "endpoint required").max(1000),
  p256dh: z.string().min(1, "p256dh required").max(500),
  auth: z.string().min(1, "auth required").max(500),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseBody(pushSubscribeSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { endpoint, p256dh, auth: authKey } = parsed.data;

  await prisma.pushSubscription.create({
    data: {
      userId: session.user.id,
      endpoint,
      p256dh,
      auth: authKey,
    },
  });

  return NextResponse.json({ subscribed: true }, { status: 201 });
}
