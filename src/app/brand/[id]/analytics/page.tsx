"use client";

import { useEffect, useState, use } from "react";

interface Analytics {
  totalViews: number;
  uniqueVisitors: number;
  viewsByPage: { page: string; count: number }[];
  recentViews: { date: string; count: number }[];
}

export default function BrandAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/brand/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load analytics");
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Access denied
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxPageCount = Math.max(...data.viewsByPage.map((v) => v.count), 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Brand Analytics
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Views
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Unique Visitors
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.uniqueVisitors.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Views by Page - Bar Chart */}
      {data.viewsByPage.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Views by Page
          </h2>
          <div className="space-y-3">
            {data.viewsByPage
              .sort((a, b) => b.count - a.count)
              .map((item) => (
                <div key={item.page}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.page}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="h-4 rounded-full transition-all"
                      style={{
                        width: `${(item.count / maxPageCount) * 100}%`,
                        backgroundColor: "#25f459",
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Views per Day */}
      {data.recentViews.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Views (Last 30 Days)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {data.recentViews.map((item) => (
              <div
                key={item.date}
                className="flex justify-between px-4 py-3 text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {item.date}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.count.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
