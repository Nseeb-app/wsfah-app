"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";

export default function ResetPasswordWrapper() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="bg-background-light text-espresso min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <MaterialIcon icon="error" className="text-red-500 text-4xl mb-3" />
          <p className="font-bold">رابط غير صالح</p>
          <Link href="/forgot-password" className="text-primary font-bold text-sm mt-4 block">
            طلب رابط جديد
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light text-espresso min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MaterialIcon icon="password" className="text-primary text-3xl" />
          </div>
          <h1 className="text-2xl font-extrabold">كلمة مرور جديدة</h1>
        </div>

        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <MaterialIcon icon="check_circle" className="text-green-600 text-4xl mb-3" />
            <p className="text-green-800 font-bold mb-1">تم تغيير كلمة المرور!</p>
            <Link href="/login" className="inline-block mt-4 bg-primary text-espresso px-6 py-3 rounded-xl font-bold text-sm">
              تسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور الجديدة"
              className="w-full h-14 px-4 rounded-xl border border-espresso/10 bg-white text-right focus:outline-none focus:border-primary"
              dir="rtl"
              required
              minLength={8}
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="تأكيد كلمة المرور"
              className="w-full h-14 px-4 rounded-xl border border-espresso/10 bg-white text-right focus:outline-none focus:border-primary"
              dir="rtl"
              required
            />
            <p className="text-xs text-espresso/40 text-right">٨ أحرف على الأقل، حرف كبير وصغير ورقم</p>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-primary text-espresso font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "جارٍ التحديث..." : "تعيين كلمة المرور"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
