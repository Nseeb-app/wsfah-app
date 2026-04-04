"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

function isRedirect(error: unknown): boolean {
  // Next.js 14-16 uses different redirect error shapes
  if (error instanceof Error) {
    const msg = error.message || "";
    const digest = (error as any).digest;
    if (msg.includes("NEXT_REDIRECT") || msg.includes("redirect")) return true;
    if (typeof digest === "string" && digest.includes("NEXT_REDIRECT")) return true;
  }
  return false;
}

export async function loginWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (isRedirect(error)) {
      throw error; // Re-throw so Next.js handles the redirect
    }
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: "Something went wrong" };
  }
}

export async function loginWithPhoneOtp(phone: string, otp: string) {
  try {
    await signIn("phone-otp", {
      phone,
      otp,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (isRedirect(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid OTP code" };
    }
    return { success: false, error: "Something went wrong" };
  }
}
