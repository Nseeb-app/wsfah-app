"use client";

import { useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background-light text-espresso min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MaterialIcon icon="lock_reset" className="text-primary text-3xl" />
          </div>
          <h1 className="text-2xl font-extrabold">نسيت كلمة المرور؟</h1>
          <p className="text-espresso/50 mt-2 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <MaterialIcon icon="mark_email_read" className="text-green-600 text-4xl mb-3" />
            <p className="text-green-800 font-bold mb-1">تم إرسال الرابط!</p>
            <p className="text-green-600 text-sm">تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
            <Link href="/login" className="inline-block mt-4 text-primary font-bold text-sm hover:underline">
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full h-14 px-4 rounded-xl border border-espresso/10 bg-white text-right focus:outline-none focus:border-primary"
                dir="rtl"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-primary text-espresso font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
            </button>
            <Link href="/login" className="block text-center text-sm text-espresso/50 hover:text-primary">
              العودة لتسجيل الدخول
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
