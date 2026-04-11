import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  _dbSynced?: boolean;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// One-time schema sync + connectivity test
if (!globalForPrisma._dbSynced) {
  globalForPrisma._dbSynced = true;
  const cols = [
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

  (async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("[db] Connected to PostgreSQL.");
      for (const sql of cols) {
        try { await prisma.$executeRawUnsafe(sql); } catch {}
      }
      console.log("[db] Schema sync done.");
    } catch (err) {
      console.error("[db] FAILED to connect:", err);
    }
  })();
}
