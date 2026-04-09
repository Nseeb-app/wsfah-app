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
          <span className="material-symbols-outlined text-4xl animate-spin" style={{ color: "#25f459" }}>coffee</span>
          <p className="text-sm font-medium" style={{ color: "rgba(242, 232, 223, 0.4)" }}>جاري التحميل...</p>
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
        <h2 className="text-2xl font-extrabold" style={{ color: "#F2E8DF" }}>لوحة التحكم</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(242, 232, 223, 0.35)" }}>نظرة عامة على تطبيق وصفة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="rounded-2xl p-4 lg:p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform"
            style={{
              backgroundColor: "#1a2420",
              border: `1px solid ${STAT_COLORS[i]}20`,
            }}
          >
            {/* Background glow */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl"
              style={{ backgroundColor: STAT_COLORS[i] }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg" style={{ color: STAT_COLORS[i] }}>
                  {STAT_ICONS[i]}
                </span>
                <p className="text-[10px] lg:text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(242, 232, 223, 0.4)" }}>
                  {card.label}
                </p>
              </div>
              <p className="text-2xl lg:text-4xl font-extrabold" style={{ color: "#F2E8DF" }}>
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1a2420", border: "1px solid rgba(37, 244, 89, 0.06)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(37, 244, 89, 0.06)" }}>
          <span className="material-symbols-outlined text-lg" style={{ color: "#25f459" }}>person_add</span>
          <h3 className="font-bold" style={{ color: "#F2E8DF" }}>التسجيلات الأخيرة</h3>
        </div>
        <div>
          {stats.recentUsers.map((user, i) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
              style={i < stats.recentUsers.length - 1 ? { borderBottom: "1px solid rgba(242, 232, 223, 0.04)" } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(37, 244, 89, 0.1)" }}>
                  <span className="font-bold text-sm" style={{ color: "#25f459" }}>
                    {(user.name || "U")[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#F2E8DF" }}>
                    {user.name || "بدون اسم"}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "rgba(242, 232, 223, 0.35)" }}>{user.email || "—"}</p>
                </div>
              </div>
              <p className="text-[10px] shrink-0" style={{ color: "rgba(242, 232, 223, 0.2)" }}>
                {new Date(user.createdAt).toLocaleDateString("ar-SA")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
