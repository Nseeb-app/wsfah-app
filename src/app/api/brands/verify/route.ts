import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { companyId, documents } = body;

  if (!companyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  // Must own the company
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  if (company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden: you do not own this company" }, { status: 403 });
  }

  // Check for existing pending application
  const existing = await prisma.brandApplication.findFirst({
    where: {
      companyId,
      status: "PENDING",
    },
  });

  if (existing) {
    return NextResponse.json({ error: "A verification request is already pending" }, { status: 409 });
  }

  const application = await prisma.brandApplication.create({
    data: {
      companyId,
      applicantId: session.user.id,
      documents: documents || null,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
