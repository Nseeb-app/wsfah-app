import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseBody, reportSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseBody(reportSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { reason, details, entityType, entityId } = parsed.data;
  const reporterId = session.user.id;

  // Rate limit: max 10 reports per day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await prisma.report.count({
    where: {
      reporterId,
      createdAt: { gte: startOfDay },
    },
  });

  if (todayCount >= 10) {
    return NextResponse.json({ error: "Daily report limit reached (max 10)" }, { status: 429 });
  }

  // Prevent duplicate reports
  const existing = await prisma.report.findFirst({
    where: {
      reporterId,
      entityType,
      entityId,
    },
  });

  if (existing) {
    return NextResponse.json({ error: "You have already reported this content" }, { status: 409 });
  }

  const report = await prisma.report.create({
    data: {
      reporterId,
      reason,
      details: details || null,
      entityType,
      entityId,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
