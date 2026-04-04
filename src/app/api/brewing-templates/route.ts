import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const templates = await prisma.brewingTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { name, icon, temperature, ratio, grindSize, brewTimeSec, description, steps } = body;

  if (!name || !icon || !temperature || !ratio || !grindSize || !brewTimeSec) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const template = await prisma.brewingTemplate.create({
    data: {
      name,
      icon,
      temperature,
      ratio,
      grindSize,
      brewTimeSec: parseInt(brewTimeSec),
      description: description || null,
      steps: steps ? JSON.stringify(steps) : null,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
