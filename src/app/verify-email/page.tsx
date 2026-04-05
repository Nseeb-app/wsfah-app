"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";

export default function VerifyEmailWrapper() {
  return (
    <Suspense>
      <VerifyEmailPage />
    </Suspense>
  );
}

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => setStatus(res.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="bg-background-light text-espresso min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div>
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <MaterialIcon icon="hourglass_top" className="text-primary text-3xl" />
            </div>
            <p className="font-bold">جارٍ التحقق...</p>
          </div>
        )}
        {status === "success" && (
          <div>
            <div className="size-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon icon="verified" className="text-green-600 text-3xl" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">تم التأكيد!</h1>
            <p className="text-espresso/50 mb-6">تم تأكيد بريدك الإلكتروني بنجاح</p>
            <Link href="/home" className="inline-block bg-primary text-espresso px-6 py-3 rounded-xl font-bold text-sm">
              الذهاب للرئيسية
            </Link>
          </div>
        )}
        {status === "error" && (
          <div>
            <div className="size-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon icon="error" className="text-red-500 text-3xl" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">رابط غير صالح</h1>
            <p className="text-espresso/50 mb-6">الرابط منتهي الصلاحية أو غير صحيح</p>
            <Link href="/login" className="inline-block bg-primary text-espresso px-6 py-3 rounded-xl font-bold text-sm">
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
