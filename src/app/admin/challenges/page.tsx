"use client";

import { useEffect, useState, useCallback } from "react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardPoints: number;
  maxProgress: number;
  rank: string;
  category: string;
  isActive: boolean;
  _count: { users: number };
}

const RANKS = ["Bronze", "Silver", "Gold"];
const CATEGORIES = ["General", "Brewing", "Social", "Streak"];

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "emoji_events",
    rewardPoints: "100",
    maxProgress: "5",
    rank: "Bronze",
    category: "General",
  });

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/challenges");
      const data = await res.json();
      setChallenges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  function resetForm() {
    setForm({ title: "", description: "", icon: "emoji_events", rewardPoints: "100", maxProgress: "5", rank: "Bronze", category: "General" });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(c: Challenge) {
    setForm({
      title: c.title,
      description: c.description,
      icon: c.icon,
      rewardPoints: String(c.rewardPoints),
      maxProgress: String(c.maxProgress),
      rank: c.rank,
      category: c.category,
    });
    setEditId(c.id);
    setShowForm(true);
  }

  async function handleSubmit() {
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    const res = await fetch("/api/admin/challenges", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      resetForm();
      fetchChallenges();
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/challenges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c)));
  }

  async function deleteChallenge(id: string) {
    if (!confirm("حذف هذا التحدي؟")) return;
    const res = await fetch(`/api/admin/challenges?id=${id}`, { method: "DELETE" });
    if (res.ok) setChallenges((prev) => prev.filter((c) => c.id !== id));
  }

  const rankColor: Record<string, string> = {
    Bronze: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Silver: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    Gold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-espresso dark:text-oat-milk">التحديات</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-[#25f459] text-black rounded-lg text-sm font-bold hover:bg-[#20d64e] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          تحدي جديد
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2420] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-espresso/5 dark:border-white/5">
              <h3 className="text-lg font-bold text-espresso dark:text-oat-milk">
                {editId ? "تعديل التحدي" : "تحدي جديد"}
              </h3>
              <button onClick={resetForm} className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-sm text-espresso dark:text-oat-milk" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-sm text-espresso dark:text-oat-milk resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الأيقونة (Material)</label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-[#25f459]">{form.icon}</span>
                    <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-sm text-espresso dark:text-oat-milk" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نقاط المكافأة</label>
                  <input type="number" value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-sm text-espresso dark:text-oat-milk" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأقصى للتقدم</label>
                  <input type="number" value={form.maxProgress} onChange={(e) => setForm({ ...form, maxProgress: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-sm text-espresso dark:text-oat-milk" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرتبة</label>
                  <select value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-sm text-espresso dark:text-oat-milk">
                    {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الفئة</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-sm text-espresso dark:text-oat-milk">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSubmit} className="w-full py-3 bg-[#25f459] text-black rounded-2xl font-bold text-sm hover:bg-[#20d64e] transition-colors">
                {editId ? "تحديث التحدي" : "إنشاء التحدي"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-espresso/40 dark:text-oat-milk/40">جاري التحميل...</p>
      ) : challenges.length === 0 ? (
        <p className="text-espresso/40 dark:text-oat-milk/40">لا توجد تحديات بعد.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-espresso/5 dark:border-white/5">
                <th className="text-left p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">التحدي</th>
                <th className="text-left p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">الرتبة</th>
                <th className="text-left p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">الفئة</th>
                <th className="text-left p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">النقاط</th>
                <th className="text-left p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">التقدم</th>
                <th className="text-left p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">المشاركون</th>
                <th className="text-left p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">الحالة</th>
                <th className="text-left p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((c) => (
                <tr key={c.id} className="border-b border-espresso/5 dark:border-white/5 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl text-[#25f459]">{c.icon}</span>
                      <div>
                        <p className="font-medium text-espresso dark:text-oat-milk">{c.title}</p>
                        <p className="text-xs text-espresso/40 dark:text-oat-milk/40 max-w-[200px] truncate">{c.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${rankColor[c.rank] || rankColor.Bronze}`}>
                      {c.rank}
                    </span>
                  </td>
                  <td className="p-4 text-espresso/60 dark:text-oat-milk/60">{c.category}</td>
                  <td className="p-4 text-espresso dark:text-oat-milk font-medium">{c.rewardPoints}</td>
                  <td className="p-4 text-espresso/60 dark:text-oat-milk/60">{c.maxProgress} خطوة</td>
                  <td className="p-4 text-espresso/60 dark:text-oat-milk/60">{c._count.users}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(c.id, c.isActive)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {c.isActive ? "نشط" : "غير نشط"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(c)} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                        تعديل
                      </button>
                      <button onClick={() => deleteChallenge(c.id)} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium">
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
