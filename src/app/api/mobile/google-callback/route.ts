import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url));
  }

  try {
    const redirectUri = `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wsfa.app"}/api/mobile/google-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google_failed", req.url));
    }

    // Get user info
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    if (!userInfo.email) {
      return NextResponse.redirect(new URL("/login?error=no_email", req.url));
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: userInfo.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split("@")[0],
          image: userInfo.picture,
          emailVerified: new Date(),
        },
      });
    }

    const token = await signMobileToken({ id: user.id, role: user.role });

    // Redirect back to app with token
    return NextResponse.redirect(`wsfa://auth/callback?token=${token}`);
  } catch {
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }
}
