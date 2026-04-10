import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  _migrated?: boolean;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Run missing column migrations once on first import
if (!globalForPrisma._migrated) {
  globalForPrisma._migrated = true;
  const migrations = [
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStartsAt" TIMESTAMP`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP`,
    `ALTER TABLE "UserChallenge" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP`,
    `ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "body" TEXT`,
    `ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDING'`,
    `ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "likes" INTEGER DEFAULT 0`,
    `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "pricingId" TEXT`,
    `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'UNPAID'`,
    `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "paymentLinkId" TEXT`,
    `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "amountPaid" DOUBLE PRECISION`,
    `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "duration" INTEGER`,
  ];
  Promise.all(
    migrations.map((sql) =>
      prisma.$executeRawUnsafe(sql).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[migrate] Skipped: ${msg}`);
      })
    )
  ).then(() => console.log("[migrate] Schema sync done."));
}
