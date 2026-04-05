import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/profile", "/create", "/rewards", "/admin"];
const authRoutes = ["/login", "/signup"];

// Pages that should work on all devices (desktop + mobile)
const desktopAllowed = [
  "/",
  "/login",
  "/signup",
  "/pricing",
  "/refund-policy",
  "/privacy",
  "/terms",
  "/admin",
  "/desktop-only",
];

function isMobile(ua: string): boolean {
  return /android|iphone|ipad|ipod|mobile|phone/i.test(ua);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userAgent = req.headers.get("user-agent") || "";

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
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|manifest.json|sw.js|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
