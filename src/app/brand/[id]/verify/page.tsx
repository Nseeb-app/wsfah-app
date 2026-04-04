"use client";

import { useState, use } from "react";

export default function BrandVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [documents, setDocuments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Parse document URLs from newline-separated input
      const urls = documents
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

      const res = await fetch("/api/brands/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: id,
          documents: urls.length > 0 ? JSON.stringify(urls) : undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "فشل تقديم طلب التوثيق.");
      }
    } catch {
      setError("خطأ في الشبكة. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#25f459]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#25f459]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            تم تقديم طلب التوثيق
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            تم تقديم طلب توثيق علامتك التجارية وهو قيد المراجعة. سيتم إعلامك عند اتخاذ القرار.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">توثيق العلامة التجارية</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          قدّم المستندات لتوثيق علامتك التجارية. أدخل روابط المستندات الداعمة (رابط واحد في كل سطر).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              روابط المستندات
            </label>
            <textarea
              value={documents}
              onChange={(e) => setDocuments(e.target.value)}
              rows={4}
              placeholder="https://example.com/business-license.pdf&#10;https://example.com/certificate.pdf"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-[#25f459] focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              أدخل رابطاً واحداً في كل سطر. المقبول: رخصة تجارية، شهادة ضريبية، إلخ.
            </p>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-[#25f459] hover:bg-[#20d64e] text-black font-medium text-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "جاري التقديم..." : "تقديم طلب التوثيق"}
          </button>
        </form>
      </div>
    </div>
  );
}
