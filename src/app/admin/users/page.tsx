"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
}

const ROLES = ["USER", "CREATOR", "BRAND_ADMIN", "SUPERADMIN"];
const ROLE_LABELS: Record<string, string> = { USER: "مستخدم", CREATOR: "منشئ", BRAND_ADMIN: "مدير علامة", SUPERADMIN: "مدير عام" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      // fetch failed
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function updateUser(userId: string, updates: { role?: string; status?: string }) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
    } catch {}
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h2 className="text-2xl font-bold text-espresso dark:text-oat-milk mb-6">المستخدمون</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="البحث عن مستخدمين..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full px-4 py-2.5 rounded-2xl border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-espresso dark:text-oat-milk focus:ring-2 focus:ring-[#25f459] focus:border-transparent outline-none text-sm"
        />
      </div>

      {loading ? (
        <p className="text-espresso/40 dark:text-oat-milk/40">جاري التحميل...</p>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="lg:hidden space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-espresso dark:text-oat-milk">{user.name || "بدون اسم"}</p>
                    <p className="text-xs text-espresso/40 dark:text-oat-milk/40 mt-0.5">{user.email || "—"}</p>
                  </div>
                  <button
                    onClick={() => updateUser(user.id, { status: user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {user.status === "ACTIVE" ? "نشط" : "معلّق"}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-espresso dark:text-oat-milk text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden lg:block overflow-x-auto bg-white dark:bg-[#1a2420] border border-espresso/5 dark:border-white/5 rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/5 dark:border-white/5">
                  <th className="text-right p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">الاسم</th>
                  <th className="text-right p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">البريد الإلكتروني</th>
                  <th className="text-right p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">الدور</th>
                  <th className="text-right p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">الحالة</th>
                  <th className="text-right p-4 text-espresso/40 dark:text-oat-milk/40 font-medium">تاريخ الانضمام</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-espresso/5 dark:border-white/5 last:border-0">
                    <td className="p-4 text-espresso dark:text-oat-milk font-medium">{user.name || "بدون اسم"}</td>
                    <td className="p-4 text-espresso/60 dark:text-oat-milk/60">{user.email || "—"}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(user.id, { role: e.target.value })}
                        className="px-2 py-1 rounded border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-espresso dark:text-oat-milk text-xs"
                      >
                        {ROLES.map((r) => (<option key={r} value={r}>{ROLE_LABELS[r] || r}</option>))}
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => updateUser(user.id, { status: user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "نشط" : "معلّق"}
                      </button>
                    </td>
                    <td className="p-4 text-espresso/40 dark:text-oat-milk/40 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-espresso/40 dark:text-oat-milk/40">
              صفحة {page} من {totalPages || 1} ({total} مستخدم)
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border border-espresso/10 dark:border-white/10 text-sm disabled:opacity-50 text-[#F2E8DFcc]">
                السابق
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-espresso/10 dark:border-white/10 text-sm disabled:opacity-50 text-[#F2E8DFcc]">
                التالي
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
