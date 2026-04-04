"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface RecipeOption {
  id: string;
  title: string;
}

export default function NewBrewLogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <NewBrewLogInner />
    </Suspense>
  );
}

function NewBrewLogInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledRecipeId = searchParams.get("recipeId") || "";

  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [recipeId, setRecipeId] = useState(prefilledRecipeId);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [grindSize, setGrindSize] = useState("");
  const [waterTemp, setWaterTemp] = useState("");
  const [brewTime, setBrewTime] = useState("");
  const [coffeeGrams, setCoffeeGrams] = useState("");
  const [waterMl, setWaterMl] = useState("");
  const [brewDate, setBrewDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch("/api/recipes?limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecipes(data.map((r: { id: string; title: string }) => ({ id: r.id, title: r.title })));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const body: Record<string, unknown> = { title };
    if (recipeId) body.recipeId = recipeId;
    if (notes) body.notes = notes;
    if (rating > 0) body.rating = rating;
    if (grindSize) body.grindSize = grindSize;
    if (waterTemp) body.waterTemp = parseFloat(waterTemp);
    if (brewTime) body.brewTime = parseInt(brewTime);
    if (coffeeGrams) body.coffeeGrams = parseFloat(coffeeGrams);
    if (waterMl) body.waterMl = parseFloat(waterMl);
    if (brewDate) body.brewDate = brewDate;

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save brew log");
        return;
      }

      router.push("/journal");
    } catch {
      setError("Failed to save brew log");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          سجّل تحضيراً
        </h1>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العنوان *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Morning Pour Over"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
            />
          </div>

          {/* Recipe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الوصفة
            </label>
            <select
              value={recipeId}
              onChange={(e) => setRecipeId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
            >
              <option value="">بدون وصفة</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الملاحظات
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="كيف كان الطعم؟ هل تريد تعديل شيء؟"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              التقييم
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    } hover:text-yellow-400 transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Brew Parameters Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                حجم الطحن
              </label>
              <input
                type="text"
                value={grindSize}
                onChange={(e) => setGrindSize(e.target.value)}
                placeholder="Medium-fine"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                حرارة الماء (&deg;C)
              </label>
              <input
                type="number"
                value={waterTemp}
                onChange={(e) => setWaterTemp(e.target.value)}
                placeholder="96"
                min={0}
                max={120}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وقت التحضير (ثواني)
              </label>
              <input
                type="number"
                value={brewTime}
                onChange={(e) => setBrewTime(e.target.value)}
                placeholder="240"
                min={1}
                max={86400}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                القهوة (غرام)
              </label>
              <input
                type="number"
                value={coffeeGrams}
                onChange={(e) => setCoffeeGrams(e.target.value)}
                placeholder="18"
                min={0}
                step={0.1}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الماء (مل)
              </label>
              <input
                type="number"
                value={waterMl}
                onChange={(e) => setWaterMl(e.target.value)}
                placeholder="300"
                min={0}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                التاريخ
              </label>
              <input
                type="date"
                value={brewDate}
                onChange={(e) => setBrewDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#25f459] text-gray-900 font-semibold rounded-lg hover:bg-[#25f459]/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "جاري الحفظ..." : "حفظ سجل التحضير"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
