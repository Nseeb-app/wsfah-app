import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hash, compare } from "bcryptjs";
import { parseBody, userUpdateSchema } from "@/lib/validation";
import { logAudit, AUDIT } from "@/lib/audit";
import { verifyMobileToken } from "@/lib/jwt";
import { getUserTier } from "@/lib/features";

async function getUserId(req: Request): Promise<string | null> {
  // Check Bearer token first (mobile app)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const tokenData = await verifyMobileToken(authHeader.slice(7));
    if (tokenData) return tokenData.id;
  }
  // Fall back to NextAuth session (web app)
  const session = await auth();
  return session?.user?.id || null;
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      recipes: {
        select: {
          id: true, title: true, slug: true, imageUrl: true,
          rating: true, category: true, likes: true, createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      badges: { include: { badge: true } },
      challenges: { include: { challenge: true } },
      saves: {
        include: {
          recipe: {
            select: { id: true, title: true, slug: true, imageUrl: true, rating: true, likes: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { password: _, ...safeUser } = user;

  // Resolve effective tier (Pro if part of active roaster)
  const effectiveTier = await getUserTier(userId);

  return NextResponse.json({ ...safeUser, effectiveTier });
}

export async function PATCH(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseBody(userUpdateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.bio !== undefined) data.bio = parsed.data.bio;
  if (parsed.data.image !== undefined) data.image = parsed.data.image;
  if (parsed.data.email !== undefined) data.email = parsed.data.email;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone;

  if (parsed.data.newPassword) {
    if (parsed.data.currentPassword) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      if (user?.password) {
        const valid = await compare(parsed.data.currentPassword, user.password);
        if (!valid) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }
    }
    data.password = await hash(parsed.data.newPassword, 12);
    logAudit(userId, AUDIT.PASSWORD_CHANGE, "user", userId);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, name: true, email: true, phone: true,
      image: true, bio: true, role: true, status: true, points: true,
    },
  });

  logAudit(userId, AUDIT.PROFILE_UPDATE, "user", userId, {
    fields: Object.keys(data).filter((k) => k !== "password"),
  });

  return NextResponse.json(updated);
}
