import { prisma } from "@/lib/prisma";

export async function recordActivity(
  userId: string,
  type: string,
  entityId?: string,
  entityType?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.activityEvent.create({
      data: {
        userId,
        type,
        entityId,
        entityType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // fire-and-forget
  }
}
