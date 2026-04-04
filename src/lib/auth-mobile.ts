import { auth } from "./auth";
import { verifyMobileToken } from "./jwt";

/**
 * Get authenticated user ID from either NextAuth session or mobile Bearer token.
 * Use this instead of `auth()` in API routes that need to support both web and mobile.
 */
export async function getAuthUser(req: Request): Promise<{ id: string; role: string } | null> {
  // Check Bearer token first (mobile app)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const tokenData = await verifyMobileToken(authHeader.slice(7));
    if (tokenData) return tokenData;
  }
  // Fall back to NextAuth session (web app)
  const session = await auth();
  if (session?.user?.id) {
    return { id: session.user.id, role: (session.user as any).role as string || "USER" };
  }
  return null;
}
