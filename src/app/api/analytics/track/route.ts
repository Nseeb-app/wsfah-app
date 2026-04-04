import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseBody } from "@/lib/validation";

const trackSchema = z.object({
  companyId: z.string().min(1, "companyId required"),
  page: z.string().min(1, "page required").max(200),
  entityId: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = parseBody(trackSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Get userId if authenticated (anonymous tracking is OK)
  const session = await auth();
  const userId = session?.user?.id ?? null;

  await prisma.brandView.create({
    data: {
      companyId: parsed.data.companyId,
      page: parsed.data.page,
      entityId: parsed.data.entityId ?? null,
      userId,
    },
  });

  return NextResponse.json({ ok: true });
}
