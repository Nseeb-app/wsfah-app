"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  brewTime: string | null;
  brewTimeSeconds: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  accessTier: string;
  author: { name: string | null };
}

interface RecipeDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  brewTime: string | null;
  brewTimeSeconds: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  accessTier: string;
  ingredients: { name: string; baseAmount: number; unit: string }[];
  steps: { title: string; description: string }[];
  brewParams: { temperature: string; ratio: string; grindSize: string; brewTimeSec: number } | null;
}

const CATEGORIES = ["pour-over", "cold-brew", "espresso", "matcha", "tea", "rituals"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">(value && value.startsWith("http") ? "url" : "upload");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      console.error(err);
      alert("فشل الرفع");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            mode === "upload"
              ? "bg-[#25f459]/20 text-[#25f459] border border-[#25f459]/30"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-transparent"
          }`}
        >
          رفع
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            mode === "url"
              ? "bg-[#25f459]/20 text-[#25f459] border border-[#25f459]/30"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-transparent"
          }`}
        >
          رابط
        </button>
      </div>

      {mode === "upload" ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm hover:border-[#25f459]/50 hover:bg-[#25f459]/5 transition-colors disabled:opacity-50"
          >
            {uploading ? "جاري الرفع..." : value ? "تغيير الصورة" : "اضغط لرفع صورة"}
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#25f459] focus:border-transparent outline-none"
          placeholder="https://example.com/image.jpg"
        />
      )}

      {value && (
        <div className="relative">
          <img
            src={value}
            alt="معاينة"
            className="w-full max-w-[200px] h-auto rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "pour-over",
    difficulty: "Beginner",
    brewTime: "",
    brewTimeSeconds: 180,
    imageUrl: "",
    accessTier: "FREE",
    isFeatured: false,
    isVerified: false,
  });
  const [ingredients, setIngredients] = useState<{ name: string; baseAmount: number; unit: string }[]>([
    { name: "", baseAmount: 0, unit: "g" },
  ]);
  const [steps, setSteps] = useState<{ title: string; description: string }[]>([
    { title: "", description: "" },
  ]);
  const [brewParams, setBrewParams] = useState({
    temperature: "",
    ratio: "",
    grindSize: "",
    brewTimeSec: 180,
  });

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?recipes=1&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  function resetForm() {
    setForm({
      title: "",
      description: "",
      category: "pour-over",
      difficulty: "Beginner",
      brewTime: "",
      brewTimeSeconds: 180,
      imageUrl: "",
      accessTier: "FREE",
      isFeatured: false,
      isVerified: false,
    });
    setIngredients([{ name: "", baseAmount: 0, unit: "g" }]);
    setSteps([{ title: "", description: "" }]);
    setBrewParams({ temperature: "", ratio: "", grindSize: "", brewTimeSec: 180 });
    setEditingId(null);
  }

  async function openEdit(recipeId: string) {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (!res.ok) return;
      const data: RecipeDetail = await res.json();
      setForm({
        title: data.title,
        description: data.description || "",
        category: data.category,
        difficulty: data.difficulty,
        brewTime: data.brewTime || "",
        brewTimeSeconds: data.brewTimeSeconds,
        imageUrl: data.imageUrl || "",
        accessTier: data.accessTier,
        isFeatured: data.isFeatured,
        isVerified: data.isVerified,
      });
      setIngredients(
        data.ingredients.length > 0
          ? data.ingredients.map((i) => ({ name: i.name, baseAmount: i.baseAmount, unit: i.unit }))
          : [{ name: "", baseAmount: 0, unit: "g" }]
      );
      setSteps(
        data.steps.length > 0
          ? data.steps.map((s) => ({ title: s.title, description: s.description }))
          : [{ title: "", description: "" }]
      );
      setBrewParams(
        data.brewParams
          ? { temperature: data.brewParams.temperature, ratio: data.brewParams.ratio, grindSize: data.brewParams.grindSize, brewTimeSec: data.brewParams.brewTimeSec }
          : { temperature: "", ratio: "", grindSize: "", brewTimeSec: 180 }
      );
      setEditingId(recipeId);
      setShowForm(true);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);

    const filteredIngredients = ingredients.filter((i) => i.name.trim());
    const filteredSteps = steps.filter((s) => s.title.trim() || s.description.trim());
    const hasBrewParams = brewParams.temperature || brewParams.ratio || brewParams.grindSize;

    const payload = {
      ...form,
      brewTimeSeconds: Number(form.brewTimeSeconds) || 180,
      ingredients: filteredIngredients.length > 0 ? filteredIngredients : undefined,
      steps: filteredSteps.length > 0 ? filteredSteps : undefined,
      brewParams: hasBrewParams ? { ...brewParams, brewTimeSec: Number(brewParams.brewTimeSec) || 180 } : undefined,
    };

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/recipes/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchRecipes();
      } else {
        const err = await res.json();
        alert(err.error || "فشل الحفظ");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function updateAccessTier(recipeId: string, tier: string) {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessTier: tier }),
      });
      if (res.ok) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === recipeId ? { ...r, accessTier: tier } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleField(recipeId: string, field: "isFeatured" | "isVerified", value: boolean) {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === recipeId ? { ...r, [field]: value } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteRecipe(recipeId: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الوصفة؟")) return;
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#25f459] focus:border-transparent outline-none";
  const labelClass = "block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1";

  function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`w-10 h-5 rounded-full relative transition-colors ${
            checked ? "bg-[#25f459]" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              checked ? "left-5" : "left-0.5"
            }`}
          />
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </label>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الوصفات</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-lg bg-[#25f459] text-black font-medium text-sm hover:bg-[#25f459]/80 transition-colors"
        >
          {showForm ? "إلغاء" : "+ وصفة جديدة"}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingId ? "تعديل الوصفة" : "إنشاء وصفة جديدة"}
          </h3>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>العنوان *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>صورة الوصفة</label>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>
            <div>
              <label className={labelClass}>القسم</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>الصعوبة</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className={inputClass}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>وقت التحضير (عرض)</label>
              <input
                type="text"
                value={form.brewTime}
                onChange={(e) => setForm({ ...form, brewTime: e.target.value })}
                className={inputClass}
                placeholder="مثال: 4 دقائق"
              />
            </div>
            <div>
              <label className={labelClass}>وقت التحضير (ثواني)</label>
              <input
                type="number"
                value={form.brewTimeSeconds}
                onChange={(e) => setForm({ ...form, brewTimeSeconds: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass + " min-h-[80px]"}
              rows={3}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <Toggle checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} label="مميزة" />
            <Toggle checked={form.isVerified} onChange={(v) => setForm({ ...form, isVerified: v })} label="موثقة" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">الوصول:</label>
              <select
                value={form.accessTier}
                onChange={(e) => setForm({ ...form, accessTier: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="FREE">مجاني (جميع المستخدمين)</option>
                <option value="BASIC">الخطة الأساسية</option>
                <option value="PREMIUM">الخطة المميزة</option>
                <option value="PRO">الخطة الاحترافية</option>
              </select>
            </div>
          </div>

          {/* Brewing Parameters */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">معايير التحضير</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>درجة الحرارة</label>
                <input
                  type="text"
                  value={brewParams.temperature}
                  onChange={(e) => setBrewParams({ ...brewParams, temperature: e.target.value })}
                  className={inputClass}
                  placeholder="93°C"
                />
              </div>
              <div>
                <label className={labelClass}>النسبة</label>
                <input
                  type="text"
                  value={brewParams.ratio}
                  onChange={(e) => setBrewParams({ ...brewParams, ratio: e.target.value })}
                  className={inputClass}
                  placeholder="1:16"
                />
              </div>
              <div>
                <label className={labelClass}>حجم الطحن</label>
                <input
                  type="text"
                  value={brewParams.grindSize}
                  onChange={(e) => setBrewParams({ ...brewParams, grindSize: e.target.value })}
                  className={inputClass}
                  placeholder="متوسط-ناعم"
                />
              </div>
              <div>
                <label className={labelClass}>المؤقت (ثانية)</label>
                <input
                  type="number"
                  value={brewParams.brewTimeSec}
                  onChange={(e) => setBrewParams({ ...brewParams, brewTimeSec: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">المكونات</h4>
              <button
                type="button"
                onClick={() => setIngredients([...ingredients, { name: "", baseAmount: 0, unit: "g" }])}
                className="text-xs text-[#25f459] font-medium hover:underline"
              >
                + إضافة
              </button>
            </div>
            <div className="space-y-3">
              {ingredients.map((ing, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">#{i + 1}</span>
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                        className="text-red-500 text-xs hover:text-red-700 font-medium"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => {
                        const copy = [...ingredients];
                        copy[i].name = e.target.value;
                        setIngredients(copy);
                      }}
                      className={inputClass}
                      placeholder="اسم المكون"
                    />
                    <input
                      type="number"
                      value={ing.baseAmount || ""}
                      onChange={(e) => {
                        const copy = [...ingredients];
                        copy[i].baseAmount = parseFloat(e.target.value) || 0;
                        setIngredients(copy);
                      }}
                      className={inputClass}
                      placeholder="الكمية"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => {
                        const copy = [...ingredients];
                        copy[i].unit = e.target.value;
                        setIngredients(copy);
                      }}
                      className={inputClass}
                    >
                      {["g", "ml", "oz", "tsp", "tbsp", "cup", "piece"].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">الخطوات</h4>
              <button
                type="button"
                onClick={() => setSteps([...steps, { title: "", description: "" }])}
                className="text-xs text-[#25f459] font-medium hover:underline"
              >
                + إضافة خطوة
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 pt-2 w-6 shrink-0">
                    {i + 1}.
                  </span>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const copy = [...steps];
                        copy[i].title = e.target.value;
                        setSteps(copy);
                      }}
                      className={inputClass}
                      placeholder="عنوان الخطوة"
                    />
                    <textarea
                      value={step.description}
                      onChange={(e) => {
                        const copy = [...steps];
                        copy[i].description = e.target.value;
                        setSteps(copy);
                      }}
                      className={inputClass + " min-h-[50px]"}
                      placeholder="وصف الخطوة"
                      rows={2}
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                      className="text-red-500 text-sm hover:text-red-700 pt-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-[#25f459] text-black font-medium text-sm disabled:opacity-50 hover:bg-[#25f459]/80 transition-colors"
            >
              {saving ? "جاري الحفظ..." : editingId ? "تحديث الوصفة" : "إنشاء الوصفة"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="البحث عن وصفات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent outline-none"
        />
      </div>

      {/* Recipe Table */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
      ) : recipes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">لا توجد وصفات.</p>
      ) : (
        <>
        {/* Mobile: Card layout */}
        <div className="lg:hidden space-y-3">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{recipe.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{recipe.author?.name || "—"} · {recipe.category}</p>
                </div>
                <select
                  value={recipe.accessTier}
                  onChange={(e) => updateAccessTier(recipe.id, e.target.value)}
                  className="shrink-0 px-2 py-1 rounded text-[10px] font-bold border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="FREE">مجاني</option>
                  <option value="BASIC">أساسي</option>
                  <option value="PREMIUM">مميز</option>
                  <option value="PRO">احترافي</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <button
                    onClick={() => toggleField(recipe.id, "isFeatured", !recipe.isFeatured)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${recipe.isFeatured ? "bg-[#25f459]" : "bg-gray-300 dark:bg-gray-700"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${recipe.isFeatured ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                  مميزة
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <button
                    onClick={() => toggleField(recipe.id, "isVerified", !recipe.isVerified)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${recipe.isVerified ? "bg-[#25f459]" : "bg-gray-300 dark:bg-gray-700"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${recipe.isVerified ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                  موثقة
                </label>
                <div className="flex gap-2 mr-auto">
                  <button onClick={() => openEdit(recipe.id)} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">تعديل</button>
                  <button onClick={() => deleteRecipe(recipe.id)} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden lg:block overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">العنوان</th>
                <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">المؤلف</th>
                <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">القسم</th>
                <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">مميزة</th>
                <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">موثقة</th>
                <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">المستوى</th>
                <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="p-4 text-gray-900 dark:text-white font-medium">{recipe.title}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{recipe.author?.name || "—"}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{recipe.category}</td>
                  <td className="p-4">
                    <button onClick={() => toggleField(recipe.id, "isFeatured", !recipe.isFeatured)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${recipe.isFeatured ? "bg-[#25f459]" : "bg-gray-300 dark:bg-gray-700"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${recipe.isFeatured ? "left-5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleField(recipe.id, "isVerified", !recipe.isVerified)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${recipe.isVerified ? "bg-[#25f459]" : "bg-gray-300 dark:bg-gray-700"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${recipe.isVerified ? "left-5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="p-4">
                    <select value={recipe.accessTier} onChange={(e) => updateAccessTier(recipe.id, e.target.value)}
                      className="px-2 py-1 rounded text-xs font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="FREE">مجاني</option>
                      <option value="BASIC">أساسي</option>
                      <option value="PREMIUM">مميز</option>
                      <option value="PRO">احترافي</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(recipe.id)} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">تعديل</button>
                      <button onClick={() => deleteRecipe(recipe.id)} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
