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
    return <p className="text-espresso/40 dark:text-oat-milk/40">جاري تحميل التحليلات...</p>;
  }

  if (!data) {
    return <p className="text-red-500">فشل تحميل التحليلات.</p>;
  }

  const maxUsers = Math.max(...data.usersPerWeek.map((w) => w.count), 1);
  const maxRecipes = Math.max(...data.recipesPerWeek.map((w) => w.count), 1);

  return (
    <div>
      <h2 className="text-2xl font-bold text-espresso dark:text-oat-milk mb-6">التحليلات</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6 overflow-x-auto">
          <p className="text-sm text-espresso/40 dark:text-oat-milk/40">إجمالي الإعجابات</p>
          <p className="text-3xl font-bold text-espresso dark:text-oat-milk mt-1">
            {data.totalLikes.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6 overflow-x-auto">
          <p className="text-sm text-espresso/40 dark:text-oat-milk/40">إجمالي التعليقات</p>
          <p className="text-3xl font-bold text-espresso dark:text-oat-milk mt-1">
            {data.totalComments.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6 overflow-x-auto">
          <p className="text-sm text-espresso/40 dark:text-oat-milk/40">إجمالي المتابعات</p>
          <p className="text-3xl font-bold text-espresso dark:text-oat-milk mt-1">
            {data.totalFollows.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users per week chart */}
        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-espresso dark:text-oat-milk mb-4">
            المستخدمون الجدد أسبوعياً
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.usersPerWeek.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-espresso/40 dark:text-oat-milk/40 mb-1">{week.count}</span>
                <div
                  className="w-full bg-[#25f459] rounded-t"
                  style={{ height: `${(week.count / maxUsers) * 100}%`, minHeight: week.count > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-espresso/30 dark:text-oat-milk/30 mt-1 truncate w-full text-center">
                  {week.week}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipes per week chart */}
        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-espresso dark:text-oat-milk mb-4">
            الوصفات الجديدة أسبوعياً
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.recipesPerWeek.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-espresso/40 dark:text-oat-milk/40 mb-1">{week.count}</span>
                <div
                  className="w-full bg-[#25f459] rounded-t"
                  style={{ height: `${(week.count / maxRecipes) * 100}%`, minHeight: week.count > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-espresso/30 dark:text-oat-milk/30 mt-1 truncate w-full text-center">
                  {week.week}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-espresso dark:text-oat-milk mb-4">جدول المستخدمين</h3>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-espresso/5 dark:border-white/5">
                <th className="text-left py-2 text-espresso/40 dark:text-oat-milk/40">الأسبوع</th>
                <th className="text-right py-2 text-espresso/40 dark:text-oat-milk/40">مستخدمون جدد</th>
              </tr>
            </thead>
            <tbody>
              {data.usersPerWeek.map((w) => (
                <tr key={w.week} className="border-b border-espresso/5 dark:border-white/5 last:border-0">
                  <td className="py-2 text-[#F2E8DFcc]">{w.week}</td>
                  <td className="py-2 text-right text-espresso dark:text-oat-milk font-medium">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-espresso dark:text-oat-milk mb-4">جدول الوصفات</h3>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-espresso/5 dark:border-white/5">
                <th className="text-left py-2 text-espresso/40 dark:text-oat-milk/40">الأسبوع</th>
                <th className="text-right py-2 text-espresso/40 dark:text-oat-milk/40">وصفات جديدة</th>
              </tr>
            </thead>
            <tbody>
              {data.recipesPerWeek.map((w) => (
                <tr key={w.week} className="border-b border-espresso/5 dark:border-white/5 last:border-0">
                  <td className="py-2 text-[#F2E8DFcc]">{w.week}</td>
                  <td className="py-2 text-right text-espresso dark:text-oat-milk font-medium">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
