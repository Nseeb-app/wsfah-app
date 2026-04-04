"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string | null;
  image: string | null;
  points: number;
  followers: number;
  recipes: number;
  score: number;
}

type SortTab = "points" | "recipes" | "followers";

const TABS: { key: SortTab; label: string }[] = [
  { key: "points", label: "النقاط" },
  { key: "recipes", label: "الوصفات" },
  { key: "followers", label: "المتابعين" },
];

function getMedal(rank: number): string | null {
  if (rank === 1) return "\u{1F947}";
  if (rank === 2) return "\u{1F948}";
  if (rank === 3) return "\u{1F949}";
  return null;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<SortTab>("points");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?sort=${activeTab}`)
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        المتصدرين
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-black shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            style={
              activeTab === tab.key
                ? { backgroundColor: "#25f459" }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          جاري التحميل...
        </p>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          لا يوجد مستخدمون بعد.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const medal = getMedal(entry.rank);
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700"
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {medal ? (
                    <span className="text-xl">{medal}</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.name || "مستخدم"}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {getInitials(entry.name)}
                    </span>
                  </div>
                )}

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {entry.name || "مجهول"}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p
                    className="text-sm font-bold"
                    style={{ color: "#25f459" }}
                  >
                    {entry.score.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeTab}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
