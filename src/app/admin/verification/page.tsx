"use client";

import { useEffect, useState } from "react";

interface Application {
  id: string;
  documents: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  company: { id: string; name: string };
  applicant: { name: string | null; email: string | null };
}

export default function AdminVerificationPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/verification")
      .then((r) => r.json())
      .then((data) => setApplications(data.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(applicationId: string, status: string) {
    try {
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== applicationId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-espresso dark:text-oat-milk mb-6">توثيق العلامات التجارية</h2>

      {loading ? (
        <p className="text-espresso/40 dark:text-oat-milk/40">جاري التحميل...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-8 text-center">
          <p className="text-espresso/40 dark:text-oat-milk/40">لا توجد طلبات توثيق معلقة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-espresso dark:text-oat-milk">
                    {app.company.name}
                  </h3>
                  <p className="text-sm text-espresso/60 dark:text-oat-milk/60 mt-1">
                    مقدم الطلب: {app.applicant?.name || app.applicant?.email || "غير معروف"}
                  </p>
                  {app.documents && (
                    <div className="mt-2">
                      <p className="text-xs text-espresso/40 dark:text-oat-milk/40 mb-1">المستندات:</p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(app.documents).map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#25f459] hover:underline"
                          >
                            مستند {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-espresso/30 dark:text-oat-milk/30 mt-2">
                    تاريخ التقديم: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAction(app.id, "APPROVED")}
                    className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                  >
                    موافقة
                  </button>
                  <button
                    onClick={() => handleAction(app.id, "REJECTED")}
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                  >
                    رفض
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
