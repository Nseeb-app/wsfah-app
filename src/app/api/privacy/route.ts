import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseBody, privacySchema } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { privacyFollowers: true, privacyLikes: true, privacySaved: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseBody(privacySchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const data: Record<string, string> = {};
  if (parsed.data.privacyFollowers) data.privacyFollowers = parsed.data.privacyFollowers;
  if (parsed.data.privacyLikes) data.privacyLikes = parsed.data.privacyLikes;
  if (parsed.data.privacySaved) data.privacySaved = parsed.data.privacySaved;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { privacyFollowers: true, privacyLikes: true, privacySaved: true },
  });

  return NextResponse.json(updated);
}
