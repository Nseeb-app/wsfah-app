"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import { loginWithCredentials, loginWithPhoneOtp } from "./actions";

type Tab = "phone" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [testOtp, setTestOtp] = useState("");

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpSent(true);
      if (data.otp_for_testing) setTestOtp(data.otp_for_testing);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await loginWithPhoneOtp(phone, otp);
      if (result && !result.success) {
        setError(result.error || "Invalid OTP code");
        setLoading(false);
      }
      // If successful, server action redirects automatically
    } catch {
      // NEXT_REDIRECT throws here — that's success
      // If it's actually an error, show it
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginWithCredentials(email, password);
      if (result && !result.success) {
        setError(result.error || "Invalid email or password");
        setLoading(false);
      }
      // If successful, server action redirects automatically
    } catch {
      // NEXT_REDIRECT throws here — that's success
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#1a0f0a] dark:to-[#2D1B14] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="size-16 bg-[#25f459] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MaterialIcon icon="coffee" className="text-3xl text-[#1a0f0a]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-white/60 mt-1">Sign in to WSFA</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-200 dark:bg-white/10 rounded-xl p-1 mb-6">
          {(["phone", "email"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-white dark:bg-white text-slate-900 dark:text-[#2D1B14] shadow-sm"
                  : "text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              {t === "phone" ? "Phone" : "Email"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-600 dark:text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* Phone Tab */}
        {tab === "phone" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-white/60 mb-1.5 block">
                Phone Number
              </label>
              <input
                dir="ltr"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 5XX XXX XXXX"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm focus:outline-none focus:border-[#25f459]/50 focus:ring-1 focus:ring-[#25f459]/20"
                disabled={otpSent}
              />
            </div>

            {!otpSent ? (
              <button
                onClick={sendOtp}
                disabled={loading || !phone}
                className="w-full py-3 rounded-xl bg-[#25f459] text-[#1a0f0a] font-bold text-sm disabled:opacity-50 transition-opacity"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <>
                {testOtp && (
                  <div className="bg-[#25f459]/10 border border-[#25f459]/30 rounded-xl p-3">
                    <p className="text-xs text-[#25f459] text-center">
                      Test OTP: <span className="font-mono font-bold">{testOtp}</span>
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-white/60 mb-1.5 block">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:border-[#25f459]/50"
                  />
                </div>
                <button
                  onClick={handleOtpLogin}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 rounded-xl bg-[#25f459] text-[#1a0f0a] font-bold text-sm disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
                <button
                  onClick={() => { setOtpSent(false); setOtp(""); setTestOtp(""); }}
                  className="w-full text-center text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60"
                >
                  Resend OTP
                </button>
              </>
            )}
          </div>
        )}

        {/* Email Tab */}
        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-white/60 mb-1.5 block">
                Email
              </label>
              <input
                dir="ltr"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm focus:outline-none focus:border-[#25f459]/50 focus:ring-1 focus:ring-[#25f459]/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-white/60 mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm focus:outline-none focus:border-[#25f459]/50 focus:ring-1 focus:ring-[#25f459]/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-[#25f459] text-[#1a0f0a] font-bold text-sm disabled:opacity-50 transition-opacity"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          <span className="text-xs text-slate-400 dark:text-white/40">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Google */}
        <button
          onClick={loginWithGoogle}
          className="w-full py-3 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-transparent text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="size-5">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Sign up link */}
        <p className="text-center text-sm text-slate-500 dark:text-white/50 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#25f459] font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
