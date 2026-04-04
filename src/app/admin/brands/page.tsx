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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Brands</h2>

      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#25f459] text-black"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : brands.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No brands found.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Company</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Owner</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="p-4 text-gray-900 dark:text-white font-medium">{brand.name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{brand.type}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
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
                      {brand.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {brand.status !== "APPROVED" && (
                      <button
                        onClick={() => updateStatus(brand.id, "APPROVED")}
                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                      >
                        Approve
                      </button>
                    )}
                    {brand.status !== "REJECTED" && (
                      <button
                        onClick={() => updateStatus(brand.id, "REJECTED")}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                      >
                        Reject
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
