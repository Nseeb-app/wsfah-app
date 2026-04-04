import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Must be company owner
  const company = await prisma.company.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  if (company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Total views
  const totalViews = await prisma.brandView.count({
    where: { companyId: id },
  });

  // Unique visitors (non-null userId, distinct)
  const uniqueRows = await prisma.brandView.findMany({
    where: { companyId: id, userId: { not: null } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const uniqueVisitors = uniqueRows.length;

  // Views by page
  const viewsByPageRaw = await prisma.brandView.groupBy({
    by: ["page"],
    where: { companyId: id },
    _count: { id: true },
  });
  const viewsByPage = viewsByPageRaw.map((row) => ({
    page: row.page,
    count: row._count.id,
  }));

  // Recent views: last 30 days, grouped by date
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRaw = await prisma.brandView.findMany({
    where: {
      companyId: id,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date string
  const dateCounts: Record<string, number> = {};
  for (const row of recentRaw) {
    const dateStr = row.createdAt.toISOString().slice(0, 10);
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
  }
  const recentViews = Object.entries(dateCounts).map(([date, count]) => ({
    date,
    count,
  }));

  return NextResponse.json({
    totalViews,
    uniqueVisitors,
    viewsByPage,
    recentViews,
  });
}
