"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  totalRecipes: number;
  totalBrands: number;
  totalPoints: number;
  recentUsers: { id: string; name: string | null; email: string | null; createdAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-500">Failed to load stats.</p>;
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Total Recipes", value: stats.totalRecipes },
    { label: "Total Brands", value: stats.totalBrands },
    { label: "Total Points Issued", value: stats.totalPoints },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Signups</h3>
        <div className="space-y-3">
          {stats.recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name || "Unnamed"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || "No email"}</p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
