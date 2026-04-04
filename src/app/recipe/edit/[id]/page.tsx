"use client";

import { useState, useEffect, useRef } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";

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

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [recipeName, setRecipeName] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [brewTime, setBrewTime] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "g" },
  ]);
  const [steps, setSteps] = useState([""]);

  const [temperature, setTemperature] = useState("");
  const [ratio, setRatio] = useState("");
  const [grindSize, setGrindSize] = useState("");
  const [brewTimeSec, setBrewTimeSec] = useState<number | "">("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadRecipe() {
      try {
        const res = await fetch(`/api/recipes/${id}`);
        if (!res.ok) {
          setError("Recipe not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setRecipeName(data.title || "");
        setCategory(data.category || "");
        setDifficulty(data.difficulty || "Beginner");
        setBrewTime(data.brewTime || "");
        setDescription(data.description || "");
        setImageUrl(data.imageUrl || null);

        if (data.ingredients?.length) {
          setIngredients(
            data.ingredients.map((i: { name: string; baseAmount: number; unit: string }) => ({
              name: i.name,
              amount: String(i.baseAmount),
              unit: i.unit as IngredientUnit,
            }))
          );
        }

        if (data.steps?.length) {
          setSteps(data.steps.map((s: { description: string }) => s.description));
        }

        if (data.brewParams) {
          setTemperature(data.brewParams.temperature || "");
          setRatio(data.brewParams.ratio || "");
          setGrindSize(data.brewParams.grindSize || "");
          setBrewTimeSec(data.brewParams.brewTimeSec || "");
        }
      } catch {
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [id]);

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

  const addIngredient = () =>
    setIngredients([...ingredients, { name: "", amount: "", unit: "g" }]);
  const removeIngredient = (idx: number) =>
    setIngredients(ingredients.filter((_, i) => i !== idx));
  const updateIngredient = (idx: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (idx: number) => setSteps(steps.filter((_, i) => i !== idx));
  const updateStep = (idx: number, value: string) => {
    const updated = [...steps];
    updated[idx] = value;
    setSteps(updated);
  };

  const handleSave = async () => {
    if (!recipeName || !category) {
      setError("Recipe name and category are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const hasBrewParams = temperature || ratio || grindSize || brewTimeSec;

      const res = await fetch(`/api/recipes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: recipeName,
          category,
          difficulty,
          brewTime,
          description,
          imageUrl,
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
                brewTimeSec: typeof brewTimeSec === "number" ? brewTimeSec : null,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);
      setTimeout(() => router.push(`/recipe/${id}`), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-white rounded-xl px-4 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary transition-colors";
  const labelClass =
    "text-xs font-bold uppercase tracking-widest text-espresso/60 mb-2 block";

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-background-light text-espresso min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-6 pt-6 pb-4 flex items-center justify-between border-b border-espresso/5">
        <Link
          href={`/recipe/${id}`}
          className="size-10 rounded-full flex items-center justify-center hover:bg-primary/10"
        >
          <MaterialIcon icon="close" />
        </Link>
        <h1 className="text-lg font-bold">Edit Recipe</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-primary font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
        >
          {saving ? "..." : "Save"}
        </button>
      </header>

      {saved && (
        <div className="mx-6 mt-4 bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <MaterialIcon icon="check_circle" className="text-primary text-xl" />
          <p className="text-sm font-medium text-primary">Recipe updated successfully!</p>
        </div>
      )}

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
                <p className="text-sm font-bold">Add Cover Photo</p>
                <p className="text-xs text-espresso/40 mt-1">Tap to upload</p>
              </div>
            </>
          )}
        </div>

        {/* Recipe Name */}
        <div>
          <label className={labelClass}>Recipe Name</label>
          <input
            dir="auto"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className={inputClass}
            placeholder="e.g., Morning Ritual Pour Over"
          />
        </div>

        {/* Category & Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
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
            <label className={labelClass}>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Brew Time */}
        <div>
          <label className={labelClass}>Brew Time</label>
          <input
            dir="auto"
            value={brewTime}
            onChange={(e) => setBrewTime(e.target.value)}
            className={inputClass}
            placeholder="e.g., 10 mins"
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            dir="auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Tell the story behind your recipe..."
          />
        </div>

        {/* Brewing Parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
              <MaterialIcon icon="tune" className="text-lg text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Brewing Parameters</h2>
              <p className="text-xs text-espresso/40">Fine-tune your brew</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-espresso/10 divide-y divide-espresso/5 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <MaterialIcon icon="thermostat" className="text-xl text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 block mb-1">Temperature</label>
                <input
                  inputMode="numeric"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-espresso/30"
                  placeholder="e.g., 93"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MaterialIcon icon="balance" className="text-xl text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 block mb-1">Coffee-to-Water Ratio</label>
                <input
                  dir="ltr"
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-espresso/30"
                  placeholder="e.g., 1:15"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <MaterialIcon icon="grain" className="text-xl text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 block mb-1">Grind Size</label>
                <select
                  value={grindSize}
                  onChange={(e) => setGrindSize(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none appearance-none"
                >
                  <option value="">Select grind size...</option>
                  {GRIND_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MaterialIcon icon="timer" className="text-xl text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 block mb-1">Brew Timer (seconds)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={brewTimeSec}
                    onChange={(e) =>
                      setBrewTimeSec(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-espresso/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="e.g., 240"
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

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-widest text-espresso/60">Ingredients</label>
            <button onClick={addIngredient} className="text-primary text-xs font-bold flex items-center gap-1">
              <MaterialIcon icon="add" className="text-sm" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  dir="auto"
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                  className="flex-1 bg-white rounded-xl px-4 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
                  placeholder="Ingredient"
                />
                <input
                  inputMode="decimal"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                  className="w-20 bg-white rounded-xl px-3 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
                  placeholder="Amt"
                />
                <select
                  value={ing.unit}
                  onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                  className="w-20 bg-white rounded-xl px-2 py-3 border border-espresso/10 text-sm font-medium outline-none focus:border-primary appearance-none text-center"
                >
                  {INGREDIENT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600">
                    <MaterialIcon icon="delete" className="text-lg" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-widest text-espresso/60">Steps</label>
            <button onClick={addStep} className="text-primary text-xs font-bold flex items-center gap-1">
              <MaterialIcon icon="add" className="text-sm" /> Add Step
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
                  placeholder={`Step ${idx + 1} instructions...`}
                />
                {steps.length > 1 && (
                  <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-600 mt-2.5">
                    <MaterialIcon icon="delete" className="text-lg" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-espresso font-bold py-4 rounded-xl text-sm active:scale-[0.98] transition-transform shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
