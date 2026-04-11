import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";

export async function POST(req: Request) {
  console.log("[push-register] POST /api/notifications/register called");
  const user = await getAuthUser(req);
  if (!user) {
    console.log("[push-register] Unauthorized — no auth token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pushToken, platform } = await req.json();
  console.log(`[push-register] user=${user.id} platform=${platform} token=${pushToken ? pushToken.slice(0, 20) + "..." : "MISSING"}`);

  if (!pushToken || !platform) {
    return NextResponse.json({ error: "pushToken and platform required" }, { status: 400 });
  }

  // Upsert — if token already exists, update the user association
  await prisma.mobilePushToken.upsert({
    where: { token: pushToken },
    update: { userId: user.id, platform, updatedAt: new Date() },
    create: { userId: user.id, token: pushToken, platform },
  });

  console.log(`[push-register] Token saved for user ${user.id}`);
  return NextResponse.json({ success: true });
}
