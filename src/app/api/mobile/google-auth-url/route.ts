import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ url: null });
  }

  // Use the backend callback URL that Google already authorizes
  const redirectUri = `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wsfa.app"}/api/mobile/google-callback`;

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("openid email profile")}` +
    `&prompt=select_account`;

  return NextResponse.json({ url, redirect_uri: redirectUri });
}
