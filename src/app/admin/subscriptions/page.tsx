"use client";

import { useState, useEffect, useCallback } from "react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  interval: string;
  description: string | null;
  features: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface PromoPricing {
  id: string;
  name: string;
  placement: string;
  duration: number;
  price: number;
  currency: string;
  discount: number;
  isActive: boolean;
  sortOrder: number;
}

const emptyPlan = { name: "", slug: "", price: "", currency: "USD", interval: "monthly", description: "", features: "", sortOrder: 0 };
const emptyPromo = { name: "", placement: "HOME_TOP", duration: "7", price: "", currency: "USD", discount: "0", sortOrder: 0 };

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [promos, setPromos] = useState<PromoPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"plans" | "promos">("plans");

  // Plan form
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planSaving, setPlanSaving] = useState(false);

  // Promo form
  const [promoForm, setPromoForm] = useState(emptyPromo);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoSaving, setPromoSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [plansRes, promosRes] = await Promise.all([
      fetch("/api/admin/subscriptions"),
      fetch("/api/admin/promotion-pricing"),
    ]);
    if (plansRes.ok) setPlans(await plansRes.json());
    if (promosRes.ok) setPromos(await promosRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Plan CRUD
  const savePlan = async () => {
    setPlanSaving(true);
    const method = editingPlanId ? "PATCH" : "POST";
    const body = editingPlanId ? { id: editingPlanId, ...planForm } : planForm;
    const res = await fetch("/api/admin/subscriptions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setPlanForm(emptyPlan);
      setEditingPlanId(null);
      fetchData();
    }
    setPlanSaving(false);
  };

  const editPlan = (p: Plan) => {
    setEditingPlanId(p.id);
    setPlanForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      currency: p.currency,
      interval: p.interval,
      description: p.description || "",
      features: p.features || "",
      sortOrder: p.sortOrder,
    });
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/admin/subscriptions?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const togglePlan = async (p: Plan) => {
    await fetch("/api/admin/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    fetchData();
  };

  // Promo pricing CRUD
  const savePromo = async () => {
    setPromoSaving(true);
    const method = editingPromoId ? "PATCH" : "POST";
    const body = editingPromoId ? { id: editingPromoId, ...promoForm } : promoForm;
    const res = await fetch("/api/admin/promotion-pricing", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setPromoForm(emptyPromo);
      setEditingPromoId(null);
      fetchData();
    }
    setPromoSaving(false);
  };

  const editPromo = (p: PromoPricing) => {
    setEditingPromoId(p.id);
    setPromoForm({
      name: p.name,
      placement: p.placement,
      duration: String(p.duration),
      price: String(p.price),
      currency: p.currency,
      discount: String(p.discount),
      sortOrder: p.sortOrder,
    });
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Delete this pricing?")) return;
    await fetch(`/api/admin/promotion-pricing?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const togglePromo = async (p: PromoPricing) => {
    await fetch("/api/admin/promotion-pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    fetchData();
  };

  const placementLabels: Record<string, string> = {
    HOME_TOP: "Home Page",
    EXPLORE_TOP: "Explore Page",
    BOTH: "Home + Explore",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Plans & Pricing</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage subscription plans and promotion pricing</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab("plans")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === "plans" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Subscription Plans ({plans.length})
        </button>
        <button
          onClick={() => setTab("promos")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === "promos" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Promotion Pricing ({promos.length})
        </button>
      </div>

      {/* ─── Subscription Plans Tab ─── */}
      {tab === "plans" && (
        <>
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">{editingPlanId ? "edit" : "add_circle"}</span>
              {editingPlanId ? "Edit Plan" : "Create Plan"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value, slug: planForm.slug || e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="e.g. Premium"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                <input
                  type="text"
                  value={planForm.slug}
                  onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                  placeholder="premium"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    placeholder="9.99"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                  />
                  <select
                    value={planForm.currency}
                    onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
                    className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Interval</label>
                <select
                  value={planForm.interval}
                  onChange={(e) => setPlanForm({ ...planForm, interval: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Best for serious coffee enthusiasts"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Features (one per line)</label>
                <textarea
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  placeholder={"Unlimited recipes\nAd-free experience\nPriority support"}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={savePlan}
                disabled={planSaving || !planForm.name || !planForm.price}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">{editingPlanId ? "save" : "add"}</span>
                {planSaving ? "Saving..." : editingPlanId ? "Update Plan" : "Create Plan"}
              </button>
              {editingPlanId && (
                <button
                  onClick={() => { setEditingPlanId(null); setPlanForm(emptyPlan); }}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Plans List */}
          {plans.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3 block">credit_card</span>
              <p className="text-gray-500 font-medium">No subscription plans yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first plan above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div key={p.id} className={`bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden transition-all ${
                  p.isActive ? "border-green-200 dark:border-green-800" : "border-gray-200 dark:border-gray-700 opacity-60"
                }`}>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{p.name}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        p.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-500"
                      }`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : ""}{p.price}
                      </span>
                      <span className="text-sm text-gray-400">/{p.interval === "yearly" ? "year" : "month"}</span>
                    </div>
                    {p.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{p.description}</p>
                    )}
                    {p.features && (
                      <ul className="space-y-1.5 mb-4">
                        {p.features.split("\n").filter(Boolean).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Slug: {p.slug}</p>
                  </div>
                  <div className="flex border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => editPlan(p)} className="flex-1 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-base">edit</span>Edit
                    </button>
                    <button onClick={() => togglePlan(p)} className="flex-1 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center justify-center gap-1 border-x border-gray-100 dark:border-gray-700">
                      <span className="material-symbols-outlined text-base">{p.isActive ? "visibility_off" : "visibility"}</span>
                      {p.isActive ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => deletePlan(p.id)} className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-base">delete</span>Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Promotion Pricing Tab ─── */}
      {tab === "promos" && (
        <>
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">{editingPromoId ? "edit" : "add_circle"}</span>
              {editingPromoId ? "Edit Pricing" : "Create Promotion Pricing"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Package Name</label>
                <input
                  type="text"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  placeholder="e.g. Home Page - 1 Week"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Placement</label>
                <select
                  value={promoForm.placement}
                  onChange={(e) => setPromoForm({ ...promoForm, placement: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="HOME_TOP">Home Page</option>
                  <option value="EXPLORE_TOP">Explore Page</option>
                  <option value="BOTH">Home + Explore</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={promoForm.duration}
                  onChange={(e) => setPromoForm({ ...promoForm, duration: e.target.value })}
                  placeholder="7"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={promoForm.price}
                    onChange={(e) => setPromoForm({ ...promoForm, price: e.target.value })}
                    placeholder="49.99"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                  />
                  <select
                    value={promoForm.currency}
                    onChange={(e) => setPromoForm({ ...promoForm, currency: e.target.value })}
                    className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={promoForm.discount}
                  onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={savePromo}
                disabled={promoSaving || !promoForm.name || !promoForm.price}
                className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-semibold text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">{editingPromoId ? "save" : "add"}</span>
                {promoSaving ? "Saving..." : editingPromoId ? "Update Pricing" : "Create Pricing"}
              </button>
              {editingPromoId && (
                <button
                  onClick={() => { setEditingPromoId(null); setPromoForm(emptyPromo); }}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Pricing List */}
          {promos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3 block">sell</span>
              <p className="text-gray-500 font-medium">No promotion pricing yet</p>
              <p className="text-sm text-gray-400 mt-1">Create pricing packages for roasters</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Package</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Placement</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Duration</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Price</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Discount</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Final</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {promos.map((p) => {
                    const final = p.price * (1 - p.discount / 100);
                    return (
                      <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${!p.isActive ? "opacity-50" : ""}`}>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{p.name}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{placementLabels[p.placement]}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{p.duration} days</td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">${p.price.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          {p.discount > 0 ? (
                            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                              -{p.discount}%
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-green-600 dark:text-green-400">${final.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => editPromo(p)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button onClick={() => togglePromo(p)} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600">
                              <span className="material-symbols-outlined text-lg">{p.isActive ? "visibility_off" : "visibility"}</span>
                            </button>
                            <button onClick={() => deletePromo(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
