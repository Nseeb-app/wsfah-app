import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      reporter: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}

export async function PATCH(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { reportId, status } = body;

  if (!reportId || !status) {
    return NextResponse.json({ error: "reportId and status required" }, { status: 400 });
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      reviewedBy: session!.user!.id!,
    },
  });

  await logAudit(session!.user!.id!, "ADMIN_REPORT_REVIEW", "Report", reportId, { status });

  return NextResponse.json(updated);
}
