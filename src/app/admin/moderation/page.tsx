"use client";

import { useEffect, useState } from "react";

interface Report {
  id: string;
  reason: string;
  details: string | null;
  entityType: string;
  entityId: string;
  status: string;
  createdAt: string;
  reporter: { name: string | null; email: string | null };
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(reportId: string, status: string) {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-espresso dark:text-oat-milk mb-6">الإشراف</h2>

      {loading ? (
        <p className="text-espresso/40 dark:text-oat-milk/40">جاري التحميل...</p>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-8 text-center">
          <p className="text-espresso/40 dark:text-oat-milk/40">لا توجد بلاغات معلقة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {report.reason}
                    </span>
                    <span className="text-xs text-espresso/40 dark:text-oat-milk/40">
                      {report.entityType} / {report.entityId}
                    </span>
                  </div>
                  <p className="text-sm text-espresso/60 dark:text-oat-milk/60 mb-1">
                    أبلغ بواسطة: {report.reporter?.name || report.reporter?.email || "غير معروف"}
                  </p>
                  {report.details && (
                    <p className="text-sm text-[#F2E8DFcc] mt-2">{report.details}</p>
                  )}
                  <p className="text-xs text-espresso/30 dark:text-oat-milk/30 mt-2">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAction(report.id, "DISMISSED")}
                    className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-[#F2E8DFcc] text-xs font-medium"
                  >
                    رفض
                  </button>
                  <button
                    onClick={() => handleAction(report.id, "ACTION_TAKEN")}
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                  >
                    اتخاذ إجراء
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
