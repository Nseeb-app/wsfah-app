import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/profile", "/create", "/rewards", "/admin"];
const authRoutes = ["/login", "/signup"];

// Pages that should work on all devices (desktop + mobile)
const desktopAllowed = [
  "/",
  "/home",
  "/login",
  "/signup",
  "/pricing",
  "/refund-policy",
  "/privacy",
  "/terms",
  "/admin",
  "/desktop-only",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function isMobile(ua: string): boolean {
  return /android|iphone|ipad|ipod|mobile|phone/i.test(ua);
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  // Check for session token (NextAuth stores it as a cookie)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;
  const isLoggedIn = !!sessionToken;

  // Protect routes that require authentication
  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect desktop users to download page (app pages only)
  if (!isMobile(userAgent)) {
    const isDesktopAllowed = desktopAllowed.some((r) =>
      r === "/" ? pathname === "/" : pathname.startsWith(r)
    );

    if (!isDesktopAllowed) {
      return NextResponse.redirect(new URL("/desktop-only", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|manifest.json|sw.js|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
