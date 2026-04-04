import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Upsert view (unique storyId + userId)
  await prisma.storyView.upsert({
    where: { storyId_userId: { storyId: id, userId: session.user.id } },
    create: { storyId: id, userId: session.user.id },
    update: {},
  });

  // Increment view count
  await prisma.story.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ viewed: true });
}
