"use client";

import { useState } from "react";
import MaterialIcon from "./MaterialIcon";

const FLAVOR_OPTIONS = [
  "Fruity", "Berry", "Citrus", "Tropical",
  "Nutty", "Chocolatey", "Caramel", "Vanilla",
  "Floral", "Herbal", "Spicy", "Smoky",
  "Honey", "Buttery", "Earthy", "Woody",
];

const GRIND_SIZES = ["Extra Fine", "Fine", "Medium-Fine", "Medium", "Medium-Coarse", "Coarse"];

interface BrewLogModalProps {
  recipeId?: string;
  recipeName?: string;
  defaultParams?: {
    grindSize?: string;
    waterTemp?: string;
    brewTimeSec?: number;
    ratio?: string;
  };
  onClose: () => void;
  onSaved: () => void;
}

export default function BrewLogModal({ recipeId, recipeName, defaultParams, onClose, onSaved }: BrewLogModalProps) {
  const [title, setTitle] = useState(recipeName ? `Brewed: ${recipeName}` : "My Brew");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [grindSize, setGrindSize] = useState(defaultParams?.grindSize || "");
  const [waterTemp, setWaterTemp] = useState(defaultParams?.waterTemp || "");
  const [brewTime, setBrewTime] = useState(defaultParams?.brewTimeSec ? String(defaultParams.brewTimeSec) : "");
  const [coffeeGrams, setCoffeeGrams] = useState("");
  const [waterMl, setWaterMl] = useState("");

  // Tasting notes
  const [acidity, setAcidity] = useState(2.5);
  const [body, setBody] = useState(2.5);
  const [sweetness, setSweetness] = useState(2.5);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"brew" | "taste">("brew");

  const toggleFlavor = (f: string) => {
    setSelectedFlavors((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/brew-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipeId || null,
          title,
          notes: notes || null,
          rating: rating || null,
          grindSize: grindSize || null,
          waterTemp: waterTemp || null,
          brewTime: brewTime || null,
          coffeeGrams: coffeeGrams || null,
          waterMl: waterMl || null,
          acidity,
          body: body,
          sweetness,
          flavorNotes: selectedFlavors.length > 0 ? selectedFlavors : null,
        }),
      });
      if (res.ok) {
        onSaved();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log Your Brew</h3>
            {recipeName && <p className="text-sm text-gray-500">{recipeName}</p>}
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
            <MaterialIcon icon="close" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(["brew", "taste"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                tab === t
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "brew" ? "Brew Details" : "Tasting Notes"}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {tab === "brew" ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setRating(v)}
                      onMouseEnter={() => setHoverRating(v)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1"
                    >
                      <MaterialIcon
                        icon="star"
                        filled={v <= (hoverRating || rating)}
                        className={`text-2xl ${v <= (hoverRating || rating) ? "text-amber-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Brew Params Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Coffee (g)</label>
                  <input type="number" value={coffeeGrams} onChange={(e) => setCoffeeGrams(e.target.value)} placeholder="18" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Water (ml)</label>
                  <input type="number" value={waterMl} onChange={(e) => setWaterMl(e.target.value)} placeholder="300" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Temp (°C)</label>
                  <input type="number" value={waterTemp} onChange={(e) => setWaterTemp(e.target.value)} placeholder="93" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Brew Time (sec)</label>
                  <input type="number" value={brewTime} onChange={(e) => setBrewTime(e.target.value)} placeholder="240" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
                </div>
              </div>

              {/* Grind Size */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Grind Size</label>
                <select value={grindSize} onChange={(e) => setGrindSize(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
                  <option value="">Select...</option>
                  {GRIND_SIZES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="How did it turn out? Any adjustments for next time?" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm resize-none" />
              </div>
            </>
          ) : (
            <>
              {/* Tasting Sliders */}
              <div className="space-y-5">
                {[
                  { label: "Acidity", value: acidity, set: setAcidity, low: "Low", high: "Bright" },
                  { label: "Body", value: body, set: setBody, low: "Light", high: "Full" },
                  { label: "Sweetness", value: sweetness, set: setSweetness, low: "Dry", high: "Sweet" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{s.label}</label>
                      <span className="text-xs font-mono text-primary font-bold">{s.value.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={s.value}
                      onChange={(e) => s.set(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                      <span>{s.low}</span>
                      <span>{s.high}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Flavor Tags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Flavor Notes</label>
                <div className="flex flex-wrap gap-2">
                  {FLAVOR_OPTIONS.map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFlavor(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedFlavors.includes(f)
                          ? "bg-primary text-background-dark border-primary"
                          : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-primary"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !title}
            className="w-full py-3.5 bg-primary text-background-dark rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MaterialIcon icon="save" className="text-lg" />
                Save Brew Log
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
