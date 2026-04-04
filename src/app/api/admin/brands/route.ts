import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const where = status ? { status } : undefined;

  const companies = await prisma.company.findMany({
    where,
    include: {
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ companies });
}

export async function PATCH(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { companyId, status } = body;

  if (!companyId || !status) {
    return NextResponse.json({ error: "companyId and status required" }, { status: 400 });
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { status },
  });

  await logAudit(session!.user!.id!, "ADMIN_BRAND_STATUS_UPDATE", "Company", companyId, { status });

  return NextResponse.json(updated);
}
