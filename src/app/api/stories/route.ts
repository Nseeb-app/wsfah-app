import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseBody } from "@/lib/validation";

export async function GET() {
  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: {
      company: { select: { id: true, name: true, logo: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by company
  const grouped: Record<
    string,
    { company: { id: string; name: string; logo: string | null }; stories: typeof stories }
  > = {};

  for (const story of stories) {
    const cid = story.companyId;
    if (!grouped[cid]) {
      grouped[cid] = { company: story.company, stories: [] };
    }
    grouped[cid].stories.push(story);
  }

  return NextResponse.json(Object.values(grouped));
}

const storyCreateSchema = z.object({
  mediaUrl: z.string().min(1, "mediaUrl required").max(500),
  mediaType: z.enum(["image", "video"]).optional(),
  caption: z.string().max(2000).optional(),
  companyId: z.string().min(1, "companyId required"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || user.role !== "BRAND_ADMIN") {
    return NextResponse.json({ error: "Only brand admins can create stories" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = parseBody(storyCreateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { mediaUrl, mediaType, caption, companyId } = parsed.data;

  // Verify ownership
  const company = await prisma.company.findFirst({
    where: { id: companyId, ownerId: session.user.id },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found or not owned by you" }, { status: 403 });
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const story = await prisma.story.create({
    data: {
      mediaUrl,
      mediaType: mediaType || "image",
      caption,
      companyId,
      expiresAt,
    },
    include: {
      company: { select: { id: true, name: true, logo: true } },
    },
  });

  return NextResponse.json(story, { status: 201 });
}
