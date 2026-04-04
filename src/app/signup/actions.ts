"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

function isRedirect(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message || "";
    const digest = (error as any).digest;
    if (msg.includes("NEXT_REDIRECT") || msg.includes("redirect")) return true;
    if (typeof digest === "string" && digest.includes("NEXT_REDIRECT")) return true;
  }
  return false;
}

export async function signupAndLogin(
  provider: "credentials" | "phone-otp",
  credentials: Record<string, string>
) {
  try {
    await signIn(provider, {
      ...credentials,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (isRedirect(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      return { success: false, error: "Login after signup failed" };
    }
    return { success: false, error: "Something went wrong" };
  }
}
