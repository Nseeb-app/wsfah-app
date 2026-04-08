import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextResponse } from "next/server";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const search = url.searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pageSize: PAGE_SIZE });
}

export async function PATCH(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { userId, role, status, subscriptionTier } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (role) data.role = role;
  if (status) data.status = status;
  if (subscriptionTier) data.subscriptionTier = subscriptionTier;

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, status: true, subscriptionTier: true, createdAt: true },
  });

  await logAudit(session!.user!.id!, "ADMIN_USER_UPDATE", "User", userId, { role, status, subscriptionTier });

  return NextResponse.json(updated);
}
