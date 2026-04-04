import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { canManageBrand, canAddMember, SEAT_LIMITS } from "@/lib/brand-auth";

// GET /api/brands/[id]/members — list team members
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const members = await prisma.companyMember.findMany({
    where: { companyId: id, status: { not: "removed" } },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Include owner info
  const owner = await prisma.user.findUnique({
    where: { id: auth.company!.ownerId },
    select: { id: true, name: true, email: true, image: true },
  });

  const tier = auth.company!.subscriptionTier || "basic";
  const limit = SEAT_LIMITS[tier.toLowerCase()] ?? 1;

  return NextResponse.json({
    owner,
    members,
    tier,
    seatLimit: limit === Infinity ? "unlimited" : limit,
    seatsUsed: members.filter((m) => m.status === "active").length + 1, // +1 for owner
  });
}

// POST /api/brands/[id]/members — invite/add a team member
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only owner or admin can add members
  const auth = await canManageBrand(user.id, id);
  if (!auth.allowed || auth.role === "staff") {
    return NextResponse.json({ error: "Only owner or admin can add members" }, { status: 403 });
  }

  const { email, role = "admin" } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (!["admin", "staff"].includes(role)) {
    return NextResponse.json({ error: "role must be admin or staff" }, { status: 400 });
  }

  // Check seat limit
  const tier = auth.company!.subscriptionTier || "basic";
  const { canAdd, current, limit } = await canAddMember(id, tier);
  if (!canAdd) {
    return NextResponse.json({
      error: `Seat limit reached (${current}/${limit === Infinity ? "unlimited" : limit}). Upgrade your plan to add more team members.`,
    }, { status: 403 });
  }

  // Find user by email
  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }
  if (invitee.id === auth.company!.ownerId) {
    return NextResponse.json({ error: "Cannot add owner as a member" }, { status: 400 });
  }

  // Check if already a member
  const existing = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: id, userId: invitee.id } },
  });
  if (existing && existing.status === "active") {
    return NextResponse.json({ error: "User is already a team member" }, { status: 409 });
  }

  const member = existing
    ? await prisma.companyMember.update({
        where: { id: existing.id },
        data: { role, status: "active", invitedBy: user.id },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      })
    : await prisma.companyMember.create({
        data: { companyId: id, userId: invitee.id, role, invitedBy: user.id },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      });

  // Auto-upgrade invited user to Pro
  if (invitee.subscriptionTier?.toLowerCase() !== "pro") {
    await prisma.user.update({
      where: { id: invitee.id },
      data: { subscriptionTier: "pro" },
    });
  }

  return NextResponse.json(member, { status: 201 });
}
