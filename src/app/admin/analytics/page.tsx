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
    return <p className="text-[#F2E8DF66]">جاري تحميل التحليلات...</p>;
  }

  if (!data) {
    return <p className="text-red-500">فشل تحميل التحليلات.</p>;
  }

  const maxUsers = Math.max(...data.usersPerWeek.map((w) => w.count), 1);
  const maxRecipes = Math.max(...data.recipesPerWeek.map((w) => w.count), 1);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#F2E8DF] mb-6">التحليلات</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl p-6 overflow-x-auto">
          <p className="text-sm text-[#F2E8DF66]">إجمالي الإعجابات</p>
          <p className="text-3xl font-bold text-[#F2E8DF] mt-1">
            {data.totalLikes.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl p-6 overflow-x-auto">
          <p className="text-sm text-[#F2E8DF66]">إجمالي التعليقات</p>
          <p className="text-3xl font-bold text-[#F2E8DF] mt-1">
            {data.totalComments.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl p-6 overflow-x-auto">
          <p className="text-sm text-[#F2E8DF66]">إجمالي المتابعات</p>
          <p className="text-3xl font-bold text-[#F2E8DF] mt-1">
            {data.totalFollows.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users per week chart */}
        <div className="bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-[#F2E8DF] mb-4">
            المستخدمون الجدد أسبوعياً
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.usersPerWeek.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-[#F2E8DF66] mb-1">{week.count}</span>
                <div
                  className="w-full bg-[#25f459] rounded-t"
                  style={{ height: `${(week.count / maxUsers) * 100}%`, minHeight: week.count > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-[#F2E8DF50] mt-1 truncate w-full text-center">
                  {week.week}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipes per week chart */}
        <div className="bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-[#F2E8DF] mb-4">
            الوصفات الجديدة أسبوعياً
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.recipesPerWeek.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-[#F2E8DF66] mb-1">{week.count}</span>
                <div
                  className="w-full bg-[#25f459] rounded-t"
                  style={{ height: `${(week.count / maxRecipes) * 100}%`, minHeight: week.count > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-[#F2E8DF50] mt-1 truncate w-full text-center">
                  {week.week}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-[#F2E8DF] mb-4">جدول المستخدمين</h3>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#F2E8DF0d]">
                <th className="text-left py-2 text-[#F2E8DF66]">الأسبوع</th>
                <th className="text-right py-2 text-[#F2E8DF66]">مستخدمون جدد</th>
              </tr>
            </thead>
            <tbody>
              {data.usersPerWeek.map((w) => (
                <tr key={w.week} className="border-b border-[#F2E8DF0d] last:border-0">
                  <td className="py-2 text-[#F2E8DFcc]">{w.week}</td>
                  <td className="py-2 text-right text-[#F2E8DF] font-medium">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-[#F2E8DF] mb-4">جدول الوصفات</h3>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#F2E8DF0d]">
                <th className="text-left py-2 text-[#F2E8DF66]">الأسبوع</th>
                <th className="text-right py-2 text-[#F2E8DF66]">وصفات جديدة</th>
              </tr>
            </thead>
            <tbody>
              {data.recipesPerWeek.map((w) => (
                <tr key={w.week} className="border-b border-[#F2E8DF0d] last:border-0">
                  <td className="py-2 text-[#F2E8DFcc]">{w.week}</td>
                  <td className="py-2 text-right text-[#F2E8DF] font-medium">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
