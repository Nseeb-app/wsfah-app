export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      console.log("[migrate] Running schema migration...");
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      // Add missing columns (IF NOT EXISTS prevents errors on re-runs)
      const migrations = [
        // User
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStartsAt" TIMESTAMP`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP`,
        // UserChallenge
        `ALTER TABLE "UserChallenge" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP`,
        // GalleryPost
        `ALTER TABLE "GalleryPost" ALTER COLUMN "imageUrl" DROP NOT NULL`,
        `ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "body" TEXT`,
        `ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDING'`,
        `ALTER TABLE "GalleryPost" ADD COLUMN IF NOT EXISTS "likes" INTEGER DEFAULT 0`,
        // PromotionRequest
        `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "pricingId" TEXT`,
        `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'UNPAID'`,
        `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "paymentLinkId" TEXT`,
        `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "amountPaid" DOUBLE PRECISION`,
        `ALTER TABLE "PromotionRequest" ADD COLUMN IF NOT EXISTS "duration" INTEGER`,
      ];

      for (const sql of migrations) {
        try {
          await prisma.$executeRawUnsafe(sql);
        } catch (err: unknown) {
          // Log but don't fail — column may already exist or table may differ
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[migrate] Skipped: ${msg}`);
        }
      }

      await prisma.$disconnect();
      console.log("[migrate] Schema migration completed.");
    } catch (err) {
      console.error("[migrate] Migration failed:", err);
    }
  }
}
