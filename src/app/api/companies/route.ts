import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseBody, companyCreateSchema } from "@/lib/validation";
import { logAudit, AUDIT } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "").slice(0, 50);
  const search = (searchParams.get("search") || "").slice(0, 200);

  // Non-authenticated users only see APPROVED companies
  const effectiveStatus = session?.user?.id ? status : "APPROVED";

  const companies = await prisma.company.findMany({
    where: {
      ...(effectiveStatus ? { status: effectiveStatus } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    include: {
      owner: {
        select: { id: true, name: true },
      },
      _count: {
        select: { products: true, recipes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseBody(companyCreateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { name, type, description, contactEmail, logo } = parsed.data;

  const company = await prisma.company.create({
    data: {
      name,
      type,
      description,
      contactEmail,
      logo,
      ownerId: session.user.id,
    },
  });

  logAudit(session.user.id, AUDIT.COMPANY_CREATE, "company", company.id, { name, type });

  return NextResponse.json(company, { status: 201 });
}
