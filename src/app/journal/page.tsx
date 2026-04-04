"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrewCalendar from "@/components/BrewCalendar";

interface Stats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  streak: number;
}

interface BrewLog {
  id: string;
  title: string;
  notes: string | null;
  rating: number | null;
  brewDate: string;
  recipe: { id: string; title: string; slug: string } | null;
}

export default function JournalPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<BrewLog[]>([]);
  const [brewDates, setBrewDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/journal/stats").then((r) => r.json()),
      fetch("/api/journal?limit=20").then((r) => r.json()),
    ])
      .then(([s, l]) => {
        setStats(s);
        setLogs(Array.isArray(l) ? l : []);
        setBrewDates(
          Array.isArray(l) ? l.map((log: BrewLog) => log.brewDate) : []
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#25f459] border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    { label: "إجمالي التحضيرات", value: stats?.total ?? 0, icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
    { label: "هذا الأسبوع", value: stats?.thisWeek ?? 0, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "هذا الشهر", value: stats?.thisMonth ?? 0, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "السلسلة", value: `${stats?.streak ?? 0} أيام`, icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            دفتر التحضير
          </h1>
          <Link
            href="/journal/new"
            className="px-4 py-2 bg-[#25f459] text-gray-900 font-semibold rounded-lg hover:bg-[#25f459]/90 transition-colors"
          >
            سجّل تحضيراً
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-[#25f459]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
                <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="mb-8">
          <BrewCalendar brewDates={brewDates} />
        </div>

        {/* Recent Logs */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          التحضيرات الأخيرة
        </h2>
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              لا توجد سجلات بعد. ابدأ بتتبع رحلتك مع القهوة!
            </p>
            <Link
              href="/journal/new"
              className="text-[#25f459] hover:underline font-medium"
            >
              سجّل أول تحضير لك
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {log.title}
                    </h3>
                    {log.recipe && (
                      <Link
                        href={`/recipe/${log.recipe.slug}`}
                        className="text-sm text-[#25f459] hover:underline"
                      >
                        {log.recipe.title}
                      </Link>
                    )}
                    {log.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.brewDate).toLocaleDateString()}
                    </p>
                    {log.rating && (
                      <div className="flex gap-0.5 mt-1 justify-end">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className={`w-4 h-4 ${
                              s <= log.rating! ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
