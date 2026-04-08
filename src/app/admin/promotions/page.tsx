"use client";

import { useState, useEffect, useCallback } from "react";

interface Promotion {
  id: string;
  companyId: string;
  placement: string;
  message: string | null;
  imageUrl: string | null;
  status: string;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  adminNotes: string | null;
  createdAt: string;
  company: { id: string; name: string; logo: string | null; type: string };
  requester: { id: string; name: string | null; image: string | null };
}

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    priority: 0,
    startDate: "",
    endDate: "",
    adminNotes: "",
  });

  const fetchPromos = useCallback(async () => {
    const res = await fetch("/api/promotions?all=1");
    if (res.ok) {
      const data = await res.json();
      setPromos(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/promotions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchPromos();
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/promotions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priority: editForm.priority,
        startDate: editForm.startDate || null,
        endDate: editForm.endDate || null,
        adminNotes: editForm.adminNotes || null,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchPromos();
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm("حذف طلب الترويج هذا؟")) return;
    const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    if (res.ok) fetchPromos();
  };

  const startEdit = (p: Promotion) => {
    setEditingId(p.id);
    setEditForm({
      priority: p.priority,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      endDate: p.endDate ? p.endDate.slice(0, 10) : "",
      adminNotes: p.adminNotes || "",
    });
  };

  const filtered = filter === "ALL" ? promos : promos.filter((p) => p.status === filter);

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    EXPIRED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const placementLabel: Record<string, string> = {
    HOME_TOP: "الصفحة الرئيسية",
    EXPLORE_TOP: "صفحة الاستكشاف",
    BOTH: "الرئيسية + الاستكشاف",
  };

  const statusLabel: Record<string, string> = {
    PENDING: "قيد المراجعة",
    APPROVED: "موافق عليه",
    REJECTED: "مرفوض",
    EXPIRED: "منتهي",
  };

  const filterLabel: Record<string, string> = {
    ALL: "الكل",
    PENDING: "قيد المراجعة",
    APPROVED: "موافق عليه",
    REJECTED: "مرفوض",
    EXPIRED: "منتهي",
  };

  const pendingCount = promos.filter((p) => p.status === "PENDING").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            طلبات الترويج
            {pendingCount > 0 && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {pendingCount} معلق
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            مراجعة وإدارة طلبات ترويج المحامص
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "EXPIRED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
            }`}
          >
            {s === "ALL" ? `الكل (${promos.length})` : `${filterLabel[s]} (${promos.filter((p) => p.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3 block">campaign</span>
          <p className="text-gray-500 dark:text-gray-400 font-medium">لا توجد طلبات ترويج</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">يمكن للمحامص طلب الترويج من صفحة علامتهم التجارية</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Brand Logo */}
                  <img
                    src={p.company.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.company.name)}&background=25f459&color=fff&size=64`}
                    alt={p.company.name}
                    className="size-14 rounded-xl object-cover border border-gray-200 dark:border-gray-600 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{p.company.name}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor[p.status]}`}>
                        {statusLabel[p.status] || p.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        {placementLabel[p.placement] || p.placement}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">person</span>
                        {p.requester.name || "غير معروف"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                      {p.priority > 0 && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <span className="material-symbols-outlined text-base">priority_high</span>
                          الأولوية: {p.priority}
                        </span>
                      )}
                    </div>
                    {p.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 italic">
                        &ldquo;{p.message}&rdquo;
                      </p>
                    )}
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt="بانر الترويج" className="mt-3 rounded-lg max-h-32 object-cover" />
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                {editingId === p.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">الأولوية (الأعلى = يظهر أولاً)</label>
                      <input
                        type="number"
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">ملاحظات الإدارة</label>
                      <input
                        type="text"
                        value={editForm.adminNotes}
                        onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                        placeholder="ملاحظات داخلية..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">تاريخ البدء</label>
                      <input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">تاريخ الانتهاء</label>
                      <input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(p.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        حفظ التغييرات
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                {p.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => updateStatus(p.id, "APPROVED")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      موافقة
                    </button>
                    <button
                      onClick={() => updateStatus(p.id, "REJECTED")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                      رفض
                    </button>
                  </>
                )}
                {p.status === "APPROVED" && (
                  <button
                    onClick={() => updateStatus(p.id, "EXPIRED")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
                  >
                    <span className="material-symbols-outlined text-base">timer_off</span>
                    إنهاء
                  </button>
                )}
                {p.status === "REJECTED" && (
                  <button
                    onClick={() => updateStatus(p.id, "APPROVED")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    موافقة
                  </button>
                )}
                <button
                  onClick={() => editingId === p.id ? setEditingId(null) : startEdit(p)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                  {editingId === p.id ? "إغلاق" : "إعدادات"}
                </button>
                <button
                  onClick={() => deletePromo(p.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium ml-auto"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
