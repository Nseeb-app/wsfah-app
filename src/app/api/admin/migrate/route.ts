import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const results: string[] = [];
  const run = async (sql: string, label: string) => {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push(`✓ ${label}`);
    } catch (e: any) {
      results.push(`⊘ ${label}: ${e.message?.slice(0, 80)}`);
    }
  };

  await run(`ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'APPROVED'`, "GalleryPost.status");
  await run(`ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "body" TEXT`, "GalleryPost.body");
  await run(`ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "likes" INTEGER DEFAULT 0`, "GalleryPost.likes");
  await run(`ALTER TABLE "GalleryPost" ALTER COLUMN "imageUrl" DROP NOT NULL`, "GalleryPost.imageUrl nullable");
  await run(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStartsAt" TIMESTAMP`, "User.subscriptionStartsAt");
  await run(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP`, "User.subscriptionExpiresAt");
  await run(`ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "pricingId" TEXT`, "PromotionRequest.pricingId");
  await run(`ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'UNPAID'`, "PromotionRequest.paymentStatus");
  await run(`ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "paymentLinkId" TEXT`, "PromotionRequest.paymentLinkId");
  await run(`ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "amountPaid" DOUBLE PRECISION`, "PromotionRequest.amountPaid");
  await run(`ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "duration" INTEGER`, "PromotionRequest.duration");
  await run(`ALTER TABLE "UserChallenge" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP`, "UserChallenge.completedAt");
  await run(`CREATE INDEX IF NOT EXISTS "GalleryPost_status_createdAt_idx" ON "GalleryPost" ("status", "createdAt")`, "GalleryPost index");

  return NextResponse.json({ results });
}
