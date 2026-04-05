import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/jwt";
import { logAudit, AUDIT } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { code, redirect_uri, id_token } = await req.json();

    let email: string | null = null;
    let name: string | null = null;
    let picture: string | null = null;

    if (id_token) {
      // Decode ID token (from direct Google Sign-In SDK)
      const payload = JSON.parse(
        Buffer.from(id_token.split(".")[1], "base64").toString()
      );
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else if (code) {
      // Exchange authorization code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirect_uri || "",
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        return NextResponse.json(
          { error: tokenData.error_description || "فشل التحقق من Google" },
          { status: 400 }
        );
      }

      // Get user info from Google
      const userInfoRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      const userInfo = await userInfoRes.json();
      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture;
    } else {
      return NextResponse.json({ error: "يرجى إرسال code أو id_token" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "لم يتم العثور على البريد الإلكتروني" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          image: picture,
        },
      });

      logAudit(user.id, AUDIT.REGISTER, "user", user.id, {
        email,
        method: "google-mobile",
      });
    }

    const token = await signMobileToken({ id: user.id, role: user.role });

    return NextResponse.json({ token, userId: user.id });
  } catch (error) {
    console.error("Mobile Google auth error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
