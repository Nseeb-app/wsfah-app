import { prisma } from "@/lib/prisma";

export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, link },
    });
  } catch {
    // fire-and-forget
  }
}
