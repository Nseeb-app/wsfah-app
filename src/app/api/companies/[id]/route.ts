import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, image: true },
      },
      products: true,
      recipes: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the user owns this company
  const company = await prisma.company.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!company || company.ownerId !== session.user?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = ["name", "description", "contactEmail"];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  const updated = await prisma.company.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
