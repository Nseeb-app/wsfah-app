"use client";

import { useEffect, useState } from "react";

interface WeekData {
  week: string;
  count: number;
}

interface Analytics {
  usersPerWeek: WeekData[];
  recipesPerWeek: WeekData[];
  totalLikes: number;
  totalComments: number;
  totalFollows: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>;
  }

  if (!data) {
    return <p className="text-red-500">Failed to load analytics.</p>;
  }

  const maxUsers = Math.max(...data.usersPerWeek.map((w) => w.count), 1);
  const maxRecipes = Math.max(...data.recipesPerWeek.map((w) => w.count), 1);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Likes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {data.totalLikes.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Comments</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {data.totalComments.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Follows</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {data.totalFollows.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users per week chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            New Users Per Week
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.usersPerWeek.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{week.count}</span>
                <div
                  className="w-full bg-[#25f459] rounded-t"
                  style={{ height: `${(week.count / maxUsers) * 100}%`, minHeight: week.count > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate w-full text-center">
                  {week.week}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipes per week chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            New Recipes Per Week
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.recipesPerWeek.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{week.count}</span>
                <div
                  className="w-full bg-[#25f459] rounded-t"
                  style={{ height: `${(week.count / maxRecipes) * 100}%`, minHeight: week.count > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate w-full text-center">
                  {week.week}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Users Table</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-2 text-gray-500 dark:text-gray-400">Week</th>
                <th className="text-right py-2 text-gray-500 dark:text-gray-400">New Users</th>
              </tr>
            </thead>
            <tbody>
              {data.usersPerWeek.map((w) => (
                <tr key={w.week} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="py-2 text-gray-700 dark:text-gray-300">{w.week}</td>
                  <td className="py-2 text-right text-gray-900 dark:text-white font-medium">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recipes Table</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-2 text-gray-500 dark:text-gray-400">Week</th>
                <th className="text-right py-2 text-gray-500 dark:text-gray-400">New Recipes</th>
              </tr>
            </thead>
            <tbody>
              {data.recipesPerWeek.map((w) => (
                <tr key={w.week} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="py-2 text-gray-700 dark:text-gray-300">{w.week}</td>
                  <td className="py-2 text-right text-gray-900 dark:text-white font-medium">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
