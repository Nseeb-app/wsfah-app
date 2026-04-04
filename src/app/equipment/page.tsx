"use client";

import { useState, useEffect, useCallback } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  imageUrl: string | null;
  notes: string | null;
}

const CATEGORIES = [
  { value: "grinder", label: "مطحنة", icon: "grain" },
  { value: "kettle", label: "غلاية", icon: "water_drop" },
  { value: "dripper", label: "قطارة", icon: "filter_alt" },
  { value: "scale", label: "ميزان", icon: "scale" },
  { value: "espresso_machine", label: "ماكينة إسبريسو", icon: "coffee_maker" },
  { value: "other", label: "أخرى", icon: "devices_other" },
];

export default function EquipmentPage() {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "grinder", brand: "", model: "", notes: "" });

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/equipment");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function resetForm() {
    setForm({ name: "", category: "grinder", brand: "", model: "", notes: "" });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(item: EquipmentItem) {
    setForm({
      name: item.name,
      category: item.category,
      brand: item.brand || "",
      model: item.model || "",
      notes: item.notes || "",
    });
    setEditId(item.id);
    setShowForm(true);
  }

  async function handleSave() {
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    const res = await fetch("/api/equipment", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      resetForm();
      fetchItems();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد إزالة هذه المعدات؟")) return;
    const res = await fetch(`/api/equipment?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const getCategoryInfo = (cat: string) => CATEGORIES.find((c) => c.value === cat) || CATEGORIES[5];

  const grouped = CATEGORIES.reduce<Record<string, EquipmentItem[]>>((acc, cat) => {
    const filtered = items.filter((i) => i.category === cat.value);
    if (filtered.length > 0) acc[cat.value] = filtered;
    return acc;
  }, {});

  return (
    <div className="bg-background-light font-display text-espresso min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-espresso/5">
        <Link href="/profile" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">معداتي</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="add" className="text-primary" />
        </button>
      </header>

      <main className="flex-1 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <MaterialIcon icon="coffee" className="text-4xl text-primary animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MaterialIcon icon="coffee_maker" className="text-4xl text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">لا توجد معدات بعد</h3>
            <p className="text-espresso/50 text-sm mb-6">تتبع أدوات التحضير للحصول على اقتراحات وصفات مخصصة.</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-primary text-background-dark font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              إضافة معدات
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <MaterialIcon icon="inventory_2" className="text-primary text-xl" />
                <h3 className="font-bold">ملخص المعدات</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.filter((c) => items.some((i) => i.category === c.value)).map((cat) => {
                  const count = items.filter((i) => i.category === cat.value).length;
                  return (
                    <div key={cat.value} className="bg-background-light rounded-xl p-2 text-center">
                      <MaterialIcon icon={cat.icon} className="text-primary text-lg" />
                      <p className="text-xs font-bold mt-0.5">{count}</p>
                      <p className="text-[9px] text-espresso/50">{cat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipment List by Category */}
            {Object.entries(grouped).map(([catValue, catItems]) => {
              const cat = getCategoryInfo(catValue);
              return (
                <div key={catValue}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-espresso/50 mb-3 flex items-center gap-2">
                    <MaterialIcon icon={cat.icon} className="text-base" />
                    {cat.label}
                  </h3>
                  <div className="space-y-2">
                    {catItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <MaterialIcon icon={cat.icon} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{item.name}</p>
                          {(item.brand || item.model) && (
                            <p className="text-xs text-espresso/50">
                              {[item.brand, item.model].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {item.notes && <p className="text-xs text-espresso/40 mt-1">{item.notes}</p>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(item)} className="size-8 rounded-lg hover:bg-primary/10 flex items-center justify-center">
                            <MaterialIcon icon="edit" className="text-sm text-espresso/40" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="size-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                            <MaterialIcon icon="delete" className="text-sm text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold">{editId ? "تعديل المعدات" : "إضافة معدات"}</h3>
              <button onClick={resetForm} className="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <MaterialIcon icon="close" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Comandante C40" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العلامة التجارية</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="اختياري" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموديل</label>
                  <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="اختياري" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="أي ملاحظات..." className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm resize-none" />
              </div>
              <button onClick={handleSave} disabled={!form.name} className="w-full py-3 bg-primary text-background-dark rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50">
                {editId ? "تحديث" : "إضافة معدات"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
