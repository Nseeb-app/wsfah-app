"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  totalRecipes: number;
  totalBrands: number;
  totalPoints: number;
  recentUsers: { id: string; name: string | null; email: string | null; createdAt: string }[];
}

const STAT_ICONS = ["group", "restaurant_menu", "storefront", "stars"];
const STAT_COLORS = ["#25f459", "#D4AF37", "#2D7D7D", "#8B5CF6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">coffee</span>
          <p className="text-espresso/40 dark:text-oat-milk/40 text-sm font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-500">فشل تحميل الإحصائيات.</p>;
  }

  const cards = [
    { label: "المستخدمون", value: stats.totalUsers },
    { label: "الوصفات", value: stats.totalRecipes },
    { label: "العلامات التجارية", value: stats.totalBrands },
    { label: "النقاط الممنوحة", value: stats.totalPoints },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-espresso dark:text-oat-milk">لوحة التحكم</h2>
        <p className="text-sm text-espresso/40 dark:text-oat-milk/40 mt-1">نظرة عامة على تطبيق وصفة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-4 lg:p-6 relative overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <div
              className="absolute top-3 left-3 lg:top-4 lg:left-4 w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity"
              style={{ backgroundColor: STAT_COLORS[i] }}
            >
              <span className="material-symbols-outlined text-2xl" style={{ color: STAT_COLORS[i] }}>
                {STAT_ICONS[i]}
              </span>
            </div>
            <div className="relative">
              <p className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-espresso/40 dark:text-oat-milk/40">
                {card.label}
              </p>
              <p className="text-2xl lg:text-3xl font-extrabold text-espresso dark:text-oat-milk mt-1">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-espresso/5 dark:border-white/5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">person_add</span>
          <h3 className="font-bold text-espresso dark:text-oat-milk">التسجيلات الأخيرة</h3>
        </div>
        <div className="divide-y divide-espresso/5 dark:divide-white/5">
          {stats.recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-espresso/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">
                    {(user.name || "U")[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-espresso dark:text-oat-milk truncate">
                    {user.name || "بدون اسم"}
                  </p>
                  <p className="text-[11px] text-espresso/40 dark:text-oat-milk/40 truncate">{user.email || "—"}</p>
                </div>
              </div>
              <p className="text-[10px] text-espresso/30 dark:text-oat-milk/30 shrink-0">
                {new Date(user.createdAt).toLocaleDateString("ar-SA")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
