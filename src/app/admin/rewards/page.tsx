"use client";

import { useEffect, useState, useCallback } from "react";

interface Reward {
  id: string;
  title: string;
  category: string;
  pointsCost: number;
  imageUrl: string | null;
  isEnabled: boolean;
  _count: { redemptions: number };
}

const REWARD_CATEGORIES = ["Discount", "Merchandise", "Experience", "Digital", "Other"];

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "Discount",
    pointsCost: "500",
    imageUrl: "",
  });

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rewards");
      const data = await res.json();
      setRewards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  function resetForm() {
    setForm({ title: "", category: "Discount", pointsCost: "500", imageUrl: "" });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(r: Reward) {
    setForm({
      title: r.title,
      category: r.category,
      pointsCost: String(r.pointsCost),
      imageUrl: r.imageUrl || "",
    });
    setEditId(r.id);
    setShowForm(true);
  }

  async function handleSubmit() {
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    const res = await fetch("/api/admin/rewards", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      resetForm();
      fetchRewards();
    }
  }

  async function toggleEnabled(id: string, isEnabled: boolean) {
    await fetch("/api/admin/rewards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isEnabled: !isEnabled }),
    });
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, isEnabled: !isEnabled } : r)));
  }

  async function deleteReward(id: string) {
    if (!confirm("حذف هذه المكافأة؟")) return;
    const res = await fetch(`/api/admin/rewards?id=${id}`, { method: "DELETE" });
    if (res.ok) setRewards((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#F2E8DF]">المكافآت</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-[#25f459] text-black rounded-lg text-sm font-bold hover:bg-[#20d64e] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          مكافأة جديدة
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#1a2420] rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-[#F2E8DF0d]">
              <h3 className="text-lg font-bold text-[#F2E8DF]">
                {editId ? "تعديل المكافأة" : "مكافأة جديدة"}
              </h3>
              <button onClick={resetForm} className="size-10 rounded-full hover:bg-[#ffffff08] flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F2E8DFcc] mb-1">العنوان</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#F2E8DF1a] bg-[#1a2420] text-[#F2E8DF] text-sm text-[#F2E8DF]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F2E8DFcc] mb-1">الفئة</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#F2E8DF1a] bg-[#1a2420] text-[#F2E8DF] text-sm text-[#F2E8DF]">
                    {REWARD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F2E8DFcc] mb-1">تكلفة النقاط</label>
                  <input type="number" value={form.pointsCost} onChange={(e) => setForm({ ...form, pointsCost: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#F2E8DF1a] bg-[#1a2420] text-[#F2E8DF] text-sm text-[#F2E8DF]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F2E8DFcc] mb-1">رابط الصورة (اختياري)</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-[#F2E8DF1a] bg-[#1a2420] text-[#F2E8DF] text-sm text-[#F2E8DF]" />
              </div>
              <button onClick={handleSubmit} className="w-full py-3 bg-[#25f459] text-black rounded-2xl font-bold text-sm hover:bg-[#20d64e] transition-colors">
                {editId ? "تحديث المكافأة" : "إنشاء المكافأة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-[#F2E8DF66]">جاري التحميل...</p>
      ) : rewards.length === 0 ? (
        <p className="text-[#F2E8DF66]">لا توجد مكافآت بعد.</p>
      ) : (
        <div className="overflow-x-auto bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#F2E8DF0d]">
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">المكافأة</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">الفئة</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">تكلفة النقاط</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">مرات الاستبدال</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">الحالة</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id} className="border-b border-[#F2E8DF0d] last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt="" className="size-10 rounded-lg object-cover" />
                      ) : (
                        <div className="size-10 rounded-lg bg-[#25f459]/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#25f459]">redeem</span>
                        </div>
                      )}
                      <p className="font-medium text-[#F2E8DF]">{r.title}</p>
                    </div>
                  </td>
                  <td className="p-4 text-[#F2E8DFaa]">{r.category}</td>
                  <td className="p-4 text-[#F2E8DF] font-medium">{r.pointsCost} نقطة</td>
                  <td className="p-4 text-[#F2E8DFaa]">{r._count.redemptions} مرة</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleEnabled(r.id, r.isEnabled)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.isEnabled
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {r.isEnabled ? "مفعّلة" : "معطّلة"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(r)} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                        تعديل
                      </button>
                      <button onClick={() => deleteReward(r.id)} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium">
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
