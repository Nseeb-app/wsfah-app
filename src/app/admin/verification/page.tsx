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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Brand Verification</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No pending verification requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {app.company.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Applicant: {app.applicant?.name || app.applicant?.email || "Unknown"}
                  </p>
                  {app.documents && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(app.documents).map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#25f459] hover:underline"
                          >
                            Document {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Submitted: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAction(app.id, "APPROVED")}
                    className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(app.id, "REJECTED")}
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                  >
                    Reject
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
