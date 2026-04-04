"use client";

import { useState } from "react";

const REASONS = [
  { value: "spam", label: "بريد مزعج" },
  { value: "inappropriate", label: "محتوى غير لائق" },
  { value: "harassment", label: "تحرش" },
  { value: "misinformation", label: "معلومات مضللة" },
  { value: "other", label: "أخرى" },
];

interface ReportButtonProps {
  entityType: string;
  entityId: string;
}

export default function ReportButton({ entityType, entityId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details: details || undefined, entityType, entityId }),
      });

      if (res.ok) {
        setFeedback({ type: "success", message: "تم إرسال البلاغ. شكراً لك." });
        setReason("");
        setDetails("");
        setTimeout(() => {
          setOpen(false);
          setFeedback(null);
        }, 2000);
      } else {
        const data = await res.json();
        setFeedback({ type: "error", message: data.error || "فشل إرسال البلاغ." });
      }
    } catch {
      setFeedback({ type: "error", message: "خطأ في الشبكة. يرجى المحاولة مرة أخرى." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-sm"
        title="إبلاغ"
      >
        إبلاغ
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">الإبلاغ عن محتوى</h4>

          <div className="space-y-2 mb-3">
            {REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  reason === r.value
                    ? "bg-[#25f459]/10 text-[#25f459]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    reason === r.value ? "border-[#25f459]" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {reason === r.value && <span className="w-2 h-2 rounded-full bg-[#25f459]" />}
                </span>
                {r.label}
              </label>
            ))}
          </div>

          <textarea
            placeholder="تفاصيل إضافية (اختياري)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-[#25f459] focus:border-transparent outline-none mb-3"
          />

          {feedback && (
            <p
              className={`text-xs mb-2 ${
                feedback.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                setOpen(false);
                setFeedback(null);
              }}
              className="flex-1 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {submitting ? "جارٍ الإرسال..." : "إرسال"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
