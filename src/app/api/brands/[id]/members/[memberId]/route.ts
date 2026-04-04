import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand } from "@/lib/brand-auth";

// PATCH /api/brands/[id]/members/[memberId] — update member role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed || auth.role === "staff") {
    return NextResponse.json({ error: "Only owner or admin can update members" }, { status: 403 });
  }

  const { role } = await req.json();
  if (!["admin", "staff"].includes(role)) {
    return NextResponse.json({ error: "role must be admin or staff" }, { status: 400 });
  }

  const member = await prisma.companyMember.findUnique({ where: { id: memberId } });
  if (!member || member.companyId !== id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = await prisma.companyMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json(updated);
}

// DELETE /api/brands/[id]/members/[memberId] — remove member
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const member = await prisma.companyMember.findUnique({ where: { id: memberId } });
  if (!member || member.companyId !== id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Staff can only remove themselves
  if (auth.role === "staff" && member.userId !== user.id) {
    return NextResponse.json({ error: "Staff can only remove themselves" }, { status: 403 });
  }

  await prisma.companyMember.update({
    where: { id: memberId },
    data: { status: "removed" },
  });

  // If user is no longer on any active team, downgrade to free
  const otherMemberships = await prisma.companyMember.count({
    where: { userId: member.userId, status: "active", id: { not: memberId } },
  });
  // Also check if they own any company
  const ownedCompanies = await prisma.company.count({
    where: { ownerId: member.userId },
  });
  if (otherMemberships === 0 && ownedCompanies === 0) {
    await prisma.user.update({
      where: { id: member.userId },
      data: { subscriptionTier: "free" },
    });
  }

  return NextResponse.json({ success: true });
}
