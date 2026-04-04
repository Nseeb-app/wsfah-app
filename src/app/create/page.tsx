"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";
import BrewMethodPicker from "@/components/BrewMethodPicker";

interface Category {
  id: string;
  name: string;
}

type IngredientUnit = "g" | "ml" | "oz" | "tsp" | "tbsp" | "cups" | "whole";

interface Ingredient {
  name: string;
  amount: string;
  unit: IngredientUnit;
}

const GRIND_SIZES = [
  "Extra Fine",
  "Fine",
  "Medium-Fine",
  "Medium",
  "Medium-Coarse",
  "Coarse",
] as const;

const INGREDIENT_UNITS: { value: IngredientUnit; label: string }[] = [
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "oz", label: "oz" },
  { value: "tsp", label: "tsp" },
  { value: "tbsp", label: "tbsp" },
  { value: "cups", label: "cups" },
  { value: "whole", label: "whole" },
];

function formatBrewTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function CreatePage() {
  const router = useRouter();

  // Basic fields
  const [recipeName, setRecipeName] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [brewTime, setBrewTime] = useState("");
  const [description, setDescription] = useState("");

  // Ingredients with unit support
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "g" },
  ]);

  // Steps
  const [steps, setSteps] = useState([""]);

  // Brewing Parameters
  const [temperature, setTemperature] = useState("");
  const [ratio, setRatio] = useState("");
  const [grindSize, setGrindSize] = useState("");
  const [brewTimeSec, setBrewTimeSec] = useState<number | "">("");

  // Image upload
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // Brand / role state
  const [userRole, setUserRole] = useState<string>("USER");
  const [publishAsBrand, setPublishAsBrand] = useState(false);
  const [userBrand, setUserBrand] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  // Fetch user role and company for brand admins
  useEffect(() => {
    async function checkUserRole() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) return;
        const data = await res.json();
        const role = data.role || "USER";
        setUserRole(role);

        if (role === "BRAND_ADMIN") {
          // Fetch companies owned by this user
          const companiesRes = await fetch("/api/companies");
          if (companiesRes.ok) {
            const companies = await companiesRes.json();
            // Find companies owned by the current user
            const ownCompany = companies.find(
              (c: { owner: { id: string }; status: string }) =>
                c.owner.id === data.id && c.status === "APPROVED"
            );
            if (ownCompany) {
              setUserBrand({ id: ownCompany.id, name: ownCompany.name });
            }
          }
        }
      } catch {
        // Silently fail - user just won't see brand options
      }
    }
    checkUserRole();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  // Ingredient helpers
  const addIngredient = () =>
    setIngredients([...ingredients, { name: "", amount: "", unit: "g" }]);
  const removeIngredient = (idx: number) =>
    setIngredients(ingredients.filter((_, i) => i !== idx));
  const updateIngredient = (
    idx: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], [field]: value };
    setIngredients(updated);
  };

  // Step helpers
  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (idx: number) =>
    setSteps(steps.filter((_, i) => i !== idx));
  const updateStep = (idx: number, value: string) => {
    const updated = [...steps];
    updated[idx] = value;
    setSteps(updated);
  };

  const handlePublish = async () => {
    if (!recipeName || !category) {
      setError("Recipe name and category are required");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const hasBrewParams = temperature || ratio || grindSize || brewTimeSec;

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: recipeName,
          category,
          difficulty,
          brewTime,
          description,
          imageUrl,
          brandId: publishAsBrand && userBrand ? userBrand.id : undefined,
          ingredients: ingredients
            .filter((i) => i.name)
            .map((i) => ({
              name: i.name,
              baseAmount: parseFloat(i.amount) || 0,
              unit: i.unit,
            })),
          steps: steps
            .filter((s) => s.trim())
            .map((s, idx) => ({
              title: `Step ${idx + 1}`,
              description: s,
            })),
          brewParams: hasBrewParams
            ? {
                temperature: temperature || null,
                ratio: ratio || null,
                grindSize: grindSize || null,
                brewTimeSec:
                  typeof brewTimeSec === "number" ? brewTimeSec : null,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }

      setPublished(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishing(false);
    }
  };

  // Shared style tokens
  const inputClass =
    "w-full bg-white rounded-xl px-4 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary transition-colors";
  const labelClass =
    "text-xs font-bold uppercase tracking-widest text-espresso/60 mb-2 block";

  return (
    <div className="bg-background-light text-espresso min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-6 pt-6 pb-4 flex items-center justify-between border-b border-espresso/5">
        <Link
          href="/"
          className="size-10 rounded-full flex items-center justify-center hover:bg-primary/10"
        >
          <MaterialIcon icon="close" />
        </Link>
        <h1 className="text-lg font-bold">إنشاء وصفة</h1>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="text-primary font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
        >
          {publishing ? "..." : "نشر"}
        </button>
      </header>

      {/* Success banner */}
      {published && (
        <div className="mx-6 mt-4 bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <MaterialIcon icon="check_circle" className="text-primary text-xl" />
          <p className="text-sm font-medium text-primary">
            تم نشر الوصفة بنجاح!
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <MaterialIcon icon="error" className="text-red-500 text-xl" />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      <main className="flex-1 px-6 py-6 pb-28 space-y-6">
        {/* Photo Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video rounded-2xl border-2 border-dashed border-espresso/20 flex flex-col items-center justify-center gap-3 bg-white cursor-pointer hover:border-primary/40 transition-colors overflow-hidden relative"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          ) : imageUrl ? (
            <>
              <img src={imageUrl} alt="Recipe" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3">
                  <MaterialIcon icon="edit" className="text-xl text-espresso" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MaterialIcon icon="add_a_photo" className="text-2xl text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">إضافة صورة غلاف</p>
                <p className="text-xs text-espresso/40 mt-1">انقر للرفع</p>
              </div>
            </>
          )}
        </div>

        {/* Recipe Name */}
        <div>
          <label className={labelClass}>اسم الوصفة</label>
          <input
            dir="auto"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className={inputClass}
            placeholder="مثال: قهوة الصباح بالترشيح"
          />
        </div>

        {/* Publish As Toggle - BRAND_ADMIN only */}
        {userRole === "BRAND_ADMIN" && userBrand && (
          <div className="bg-white rounded-2xl border border-espresso/10 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3 border-b border-espresso/5">
              <div className="size-9 rounded-full bg-amber-50 flex items-center justify-center">
                <MaterialIcon icon="storefront" className="text-lg text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-espresso/60">
                  النشر باسم
                </p>
              </div>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPublishAsBrand(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  !publishAsBrand
                    ? "bg-primary/10 border-2 border-primary text-espresso"
                    : "bg-transparent border-2 border-transparent text-espresso/50 hover:bg-espresso/5"
                }`}
              >
                <MaterialIcon
                  icon="group"
                  className={`text-lg ${!publishAsBrand ? "text-primary" : "text-espresso/30"}`}
                />
                <span dir="auto">وصفة مجتمعية</span>
              </button>
              <button
                type="button"
                onClick={() => setPublishAsBrand(true)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  publishAsBrand
                    ? "bg-amber-50 border-2 border-amber-500 text-espresso"
                    : "bg-transparent border-2 border-transparent text-espresso/50 hover:bg-espresso/5"
                }`}
              >
                <MaterialIcon
                  icon="verified"
                  className={`text-lg ${publishAsBrand ? "text-amber-500" : "text-espresso/30"}`}
                />
                <span dir="auto" className="truncate">{userBrand.name}</span>
              </button>
            </div>
            {publishAsBrand && (
              <div className="mx-4 mb-3 px-3 py-2 bg-amber-50 rounded-lg flex items-center gap-2">
                <MaterialIcon icon="info" className="text-sm text-amber-600" />
                <p className="text-xs text-amber-700" dir="auto">
                  سيتم نشر هذه الوصفة تحت <strong>{userBrand.name}</strong> كوصفة رسمية للعلامة التجارية.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Category & Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>القسم</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>الصعوبة</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="Beginner">مبتدئ</option>
              <option value="Intermediate">متوسط</option>
              <option value="Advanced">متقدم</option>
            </select>
          </div>
        </div>

        {/* Brew Time */}
        <div>
          <label className={labelClass}>وقت التحضير</label>
          <input
            dir="auto"
            value={brewTime}
            onChange={(e) => setBrewTime(e.target.value)}
            className={inputClass}
            placeholder="مثال: ١٠ دقائق"
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>الوصف</label>
          <textarea
            dir="auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="أخبرنا قصة وصفتك..."
          />
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/*  BREWING PARAMETERS SECTION                                 */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Section heading */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
              <MaterialIcon icon="tune" className="text-lg text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold">معايير التحضير</h2>
              <p className="text-xs text-espresso/40">
                اضبط معايير تحضيرك للكوب المثالي
              </p>
            </div>
            <BrewMethodPicker
              onSelect={(tmpl) => {
                setTemperature(tmpl.temperature);
                setRatio(tmpl.ratio);
                setGrindSize(tmpl.grindSize);
                setBrewTimeSec(tmpl.brewTimeSec);
              }}
            />
          </div>

          {/* Parameter cards in a bordered container */}
          <div className="bg-white rounded-2xl border border-espresso/10 divide-y divide-espresso/5 overflow-hidden">
            {/* Temperature */}
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <MaterialIcon
                  icon="thermostat"
                  className="text-xl text-red-400"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 block mb-1">
                  الحرارة
                </label>
                <input
                  inputMode="numeric"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-espresso/30"
                  placeholder="مثال: ٩٣"
                />
              </div>
            </div>

            {/* Coffee-to-Water Ratio */}
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MaterialIcon
                  icon="balance"
                  className="text-xl text-blue-400"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 block mb-1">
                  نسبة القهوة إلى الماء
                </label>
                <input
                  dir="ltr"
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-espresso/30"
                  placeholder="مثال: ١:١٥"
                />
              </div>
            </div>

            {/* Grind Size */}
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <MaterialIcon
                  icon="grain"
                  className="text-xl text-amber-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 block mb-1">
                  حجم الطحن
                </label>
                <select
                  value={grindSize}
                  onChange={(e) => setGrindSize(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none appearance-none placeholder:text-espresso/30"
                >
                  <option value="">اختر حجم الطحن...</option>
                  {GRIND_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brew Timer */}
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MaterialIcon
                  icon="timer"
                  className="text-xl text-primary"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 block mb-1">
                  مؤقت التحضير
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={brewTimeSec}
                    onChange={(e) =>
                      setBrewTimeSec(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-espresso/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="مثال: ٢٤٠"
                  />
                  {typeof brewTimeSec === "number" && brewTimeSec > 0 && (
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
                      {formatBrewTime(brewTimeSec)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/*  INGREDIENTS                                                */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-widest text-espresso/60">
              المكونات
            </label>
            <button
              onClick={addIngredient}
              className="text-primary text-xs font-bold flex items-center gap-1"
            >
              <MaterialIcon icon="add" className="text-sm" /> إضافة
            </button>
          </div>
          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  dir="auto"
                  value={ing.name}
                  onChange={(e) =>
                    updateIngredient(idx, "name", e.target.value)
                  }
                  className="flex-1 bg-white rounded-xl px-4 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
                  placeholder="المكوّن"
                />
                <input
                  inputMode="decimal"
                  value={ing.amount}
                  onChange={(e) =>
                    updateIngredient(idx, "amount", e.target.value)
                  }
                  className="w-20 bg-white rounded-xl px-3 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
                  placeholder="الكمية"
                />
                <select
                  value={ing.unit}
                  onChange={(e) =>
                    updateIngredient(idx, "unit", e.target.value)
                  }
                  className="w-20 bg-white rounded-xl px-2 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary appearance-none text-center"
                >
                  {INGREDIENT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                {ingredients.length > 1 && (
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <MaterialIcon icon="delete" className="text-lg" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/*  STEPS                                                      */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-widest text-espresso/60">
              الخطوات
            </label>
            <button
              onClick={addStep}
              className="text-primary text-xs font-bold flex items-center gap-1"
            >
              <MaterialIcon icon="add" className="text-sm" /> إضافة خطوة
            </button>
          </div>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="size-8 rounded-full bg-primary text-espresso flex items-center justify-center font-bold text-sm shrink-0 mt-2.5">
                  {idx + 1}
                </div>
                <textarea
                  dir="auto"
                  value={step}
                  onChange={(e) => updateStep(idx, e.target.value)}
                  rows={2}
                  className="flex-1 bg-white rounded-xl px-4 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary resize-none"
                  placeholder={`تعليمات الخطوة ${idx + 1}...`}
                />
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(idx)}
                    className="text-red-400 hover:text-red-600 mt-2.5"
                  >
                    <MaterialIcon icon="delete" className="text-lg" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Verified Creator Badge */}
        {userRole === "CREATOR" && (
          <div className="flex items-center justify-center gap-2 py-2">
            <MaterialIcon icon="verified" className="text-primary text-lg" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              النشر كمبدع موثق
            </span>
          </div>
        )}

        {/* Brand publish indicator */}
        {publishAsBrand && userBrand && (
          <div className="flex items-center justify-center gap-2 py-2">
            <MaterialIcon icon="storefront" className="text-amber-600 text-lg" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider" dir="auto">
              النشر تحت {userBrand.name}
            </span>
          </div>
        )}

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={publishing}
          className={`w-full font-bold py-4 rounded-xl text-sm active:scale-[0.98] transition-transform shadow-lg disabled:opacity-50 ${
            publishAsBrand && userBrand
              ? "bg-amber-500 text-white shadow-amber-500/20"
              : "bg-primary text-espresso shadow-primary/20"
          }`}
        >
          {publishing
            ? "جارٍ النشر..."
            : publishAsBrand && userBrand
              ? `نشر باسم ${userBrand.name}`
              : "نشر الوصفة"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
