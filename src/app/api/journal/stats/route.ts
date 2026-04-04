import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const now = new Date();

  // Start of current week (Sunday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  // Start of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, thisWeek, thisMonth, allLogs] = await Promise.all([
    prisma.brewLog.count({ where: { userId } }),
    prisma.brewLog.count({
      where: { userId, brewDate: { gte: weekStart } },
    }),
    prisma.brewLog.count({
      where: { userId, brewDate: { gte: monthStart } },
    }),
    prisma.brewLog.findMany({
      where: { userId },
      select: { brewDate: true },
      orderBy: { brewDate: "desc" },
    }),
  ]);

  // Calculate streak: consecutive days with brews from today backwards
  let streak = 0;
  if (allLogs.length > 0) {
    const brewDaySet = new Set(
      allLogs.map((l) => {
        const d = new Date(l.brewDate);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    );

    const checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);

    // Check today first; if no brew today, start from yesterday
    const todayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (!brewDaySet.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
      if (brewDaySet.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return NextResponse.json({ total, thisWeek, thisMonth, streak });
}
