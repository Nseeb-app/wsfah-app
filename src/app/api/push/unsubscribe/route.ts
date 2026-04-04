import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseBody } from "@/lib/validation";

const pushUnsubscribeSchema = z.object({
  endpoint: z.string().min(1, "endpoint required").max(1000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseBody(pushUnsubscribeSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { endpoint } = parsed.data;

  await prisma.pushSubscription.deleteMany({
    where: {
      endpoint,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
