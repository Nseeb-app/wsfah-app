import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const applications = await prisma.brandApplication.findMany({
    where: { status: "PENDING" },
    include: {
      company: { select: { id: true, name: true } },
      applicant: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}

export async function PATCH(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { applicationId, status, notes } = body;

  if (!applicationId || !status) {
    return NextResponse.json({ error: "applicationId and status required" }, { status: 400 });
  }

  const application = await prisma.brandApplication.update({
    where: { id: applicationId },
    data: {
      status,
      notes: notes || undefined,
    },
    include: { company: true },
  });

  if (status === "APPROVED") {
    await prisma.company.update({
      where: { id: application.companyId },
      data: { isVerified: true },
    });
  }

  await logAudit(session!.user!.id!, "ADMIN_VERIFICATION_REVIEW", "BrandApplication", applicationId, {
    status,
    companyId: application.companyId,
  });

  return NextResponse.json(application);
}
