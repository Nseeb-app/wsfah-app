import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time migration endpoint — adds missing columns to User table
// DELETE THIS FILE after migration is complete
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStartsAt" TIMESTAMP;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP;
    `);
    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Migration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
