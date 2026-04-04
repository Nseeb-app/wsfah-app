import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken, signMobileToken } from "@/lib/jwt";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }

  const tokenData = await verifyMobileToken(authHeader.slice(7));
  if (!tokenData) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401, headers: cors });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenData.id },
    select: { id: true, role: true, status: true },
  });

  if (!user || user.status === "SUSPENDED") {
    return NextResponse.json({ error: "Account not found or suspended" }, { status: 403, headers: cors });
  }

  const token = await signMobileToken({ id: user.id, role: user.role });

  return NextResponse.json({ token }, { headers: cors });
}
