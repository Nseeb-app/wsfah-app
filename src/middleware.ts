import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/profile", "/create", "/rewards"];
const authRoutes = ["/login", "/signup"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protect routes that require authentication
  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|manifest.json|sw.js|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
