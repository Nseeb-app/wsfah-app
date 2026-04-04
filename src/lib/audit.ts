import { prisma } from "./prisma";

export async function logAudit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: Record<string, unknown> | null,
  ipAddress?: string | null
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch {
    // Never let audit logging break the request
    console.error("[AUDIT] Failed to log:", action, entity, entityId);
  }
}

// Common action constants
export const AUDIT = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  REGISTER: "REGISTER",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  RECIPE_CREATE: "RECIPE_CREATE",
  RECIPE_UPDATE: "RECIPE_UPDATE",
  RECIPE_DELETE: "RECIPE_DELETE",
  COMPANY_CREATE: "COMPANY_CREATE",
  COMPANY_UPDATE: "COMPANY_UPDATE",
  FOLLOW: "FOLLOW",
  UNFOLLOW: "UNFOLLOW",
  ROLE_CHANGE: "ROLE_CHANGE",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  FILE_UPLOAD: "FILE_UPLOAD",
  COMMENT_CREATE: "COMMENT_CREATE",
  COMMENT_UPDATE: "COMMENT_UPDATE",
  COMMENT_DELETE: "COMMENT_DELETE",
} as const;
