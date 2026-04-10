import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: List posts for moderation
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  const posts = await prisma.galleryPost.findMany({
    where: { status },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      company: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(posts);
}

// PATCH: Approve or reject a post
export async function PATCH(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { postId, status } = await req.json();
  if (!postId || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "postId and status (APPROVED/REJECTED) required" }, { status: 400 });
  }

  const post = await prisma.galleryPost.update({
    where: { id: postId },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      userId: session!.user!.id!,
      action: `POST_${status}`,
      entity: "gallery_post",
      entityId: postId,
    },
  });

  return NextResponse.json(post);
}
