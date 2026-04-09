"use client";

import { useEffect, useState, useCallback } from "react";

interface Brand {
  id: string;
  name: string;
  type: string;
  status: string;
  owner: { name: string | null; email: string | null };
}

const TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"];
const TAB_LABELS: Record<string, string> = {
  ALL: "الكل",
  PENDING: "قيد المراجعة",
  APPROVED: "موافق عليها",
  REJECTED: "مرفوضة",
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeTab === "ALL" ? "/api/admin/brands" : `/api/admin/brands?status=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      setBrands(data.companies || []);
    } catch {
      // fetch failed
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  async function updateStatus(companyId: string, status: string) {
    try {
      const res = await fetch("/api/admin/brands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, status }),
      });
      if (res.ok) {
        setBrands((prev) => prev.map((b) => (b.id === companyId ? { ...b, status } : b)));
      }
    } catch {
      // update failed
    }
  }

  const STATUS_LABELS: Record<string, string> = {
    APPROVED: "موافق عليها",
    REJECTED: "مرفوضة",
    PENDING: "قيد المراجعة",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#F2E8DF] mb-6">العلامات التجارية</h2>

      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#25f459] text-black"
                : "bg-[#F2E8DF08] text-[#F2E8DFaa] hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {TAB_LABELS[tab] || tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#F2E8DF66]">جاري التحميل...</p>
      ) : brands.length === 0 ? (
        <p className="text-[#F2E8DF66]">لا توجد علامات تجارية.</p>
      ) : (
        <div className="overflow-x-auto bg-[#1a2420] border border-[#F2E8DF0d] rounded-2xl">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#F2E8DF0d]">
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">الشركة</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">النوع</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">المالك</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">الحالة</th>
                <th className="text-left p-4 text-[#F2E8DF66] font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-[#F2E8DF0d] last:border-0">
                  <td className="p-4 text-[#F2E8DF] font-medium">{brand.name}</td>
                  <td className="p-4 text-[#F2E8DFaa]">{brand.type}</td>
                  <td className="p-4 text-[#F2E8DFaa]">
                    {brand.owner?.name || brand.owner?.email || "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        brand.status === "APPROVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : brand.status === "REJECTED"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {STATUS_LABELS[brand.status] || brand.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {brand.status !== "APPROVED" && (
                      <button
                        onClick={() => updateStatus(brand.id, "APPROVED")}
                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                      >
                        موافقة
                      </button>
                    )}
                    {brand.status !== "REJECTED" && (
                      <button
                        onClick={() => updateStatus(brand.id, "REJECTED")}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                      >
                        رفض
                      </button>
                    )}
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
