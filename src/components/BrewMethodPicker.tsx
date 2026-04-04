"use client";

import { useState, useEffect } from "react";
import MaterialIcon from "./MaterialIcon";

interface Template {
  id: string;
  name: string;
  icon: string;
  temperature: string;
  ratio: string;
  grindSize: string;
  brewTimeSec: number;
  description: string | null;
  steps: string | null;
}

interface BrewMethodPickerProps {
  onSelect: (template: {
    temperature: string;
    ratio: string;
    grindSize: string;
    brewTimeSec: number;
    steps?: string[];
  }) => void;
}

// Default built-in templates (used if no DB templates exist)
const DEFAULT_TEMPLATES = [
  { name: "V60 ترشيح", icon: "filter_alt", temperature: "93°C", ratio: "1:15", grindSize: "Medium-Fine", brewTimeSec: 210, description: "نكهات نظيفة ومشرقة" },
  { name: "ايروبريس", icon: "coffee_maker", temperature: "85°C", ratio: "1:12", grindSize: "Fine", brewTimeSec: 120, description: "ناعم ومركز" },
  { name: "فرنش بريس", icon: "coffee", temperature: "96°C", ratio: "1:15", grindSize: "Coarse", brewTimeSec: 240, description: "قوام كامل وغني" },
  { name: "إسبريسو", icon: "local_cafe", temperature: "93°C", ratio: "1:2", grindSize: "Extra Fine", brewTimeSec: 28, description: "مكثف مع كريما" },
  { name: "كولد برو", icon: "ac_unit", temperature: "Room Temp", ratio: "1:8", grindSize: "Coarse", brewTimeSec: 43200, description: "ناعم وحلو، ١٢ ساعة" },
  { name: "كيمكس", icon: "science", temperature: "92°C", ratio: "1:16", grindSize: "Medium-Coarse", brewTimeSec: 270, description: "نظيف وحلو" },
  { name: "موكا بوت", icon: "local_fire_department", temperature: "Medium Heat", ratio: "1:7", grindSize: "Fine", brewTimeSec: 300, description: "قوي، على الموقد" },
  { name: "تركي", icon: "emoji_food_beverage", temperature: "Low Heat", ratio: "1:10", grindSize: "Extra Fine", brewTimeSec: 180, description: "تقليدي، بدون فلتر" },
];

export default function BrewMethodPicker({ onSelect }: BrewMethodPickerProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    fetch("/api/brewing-templates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTemplates(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open, loaded]);

  const items = templates.length > 0
    ? templates.map((t) => ({
        name: t.name,
        icon: t.icon,
        temperature: t.temperature,
        ratio: t.ratio,
        grindSize: t.grindSize,
        brewTimeSec: t.brewTimeSec,
        description: t.description,
        steps: t.steps ? JSON.parse(t.steps) : undefined,
      }))
    : DEFAULT_TEMPLATES;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
      >
        <MaterialIcon icon="auto_awesome" className="text-lg" />
        استخدم القالب
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">طريقة التحضير</h3>
              <button onClick={() => setOpen(false)} className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
                <MaterialIcon icon="close" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {items.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    onSelect({
                      temperature: t.temperature,
                      ratio: t.ratio,
                      grindSize: t.grindSize,
                      brewTimeSec: t.brewTimeSec,
                      steps: "steps" in t ? t.steps : undefined,
                    });
                    setOpen(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-center"
                >
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MaterialIcon icon={t.icon} className="text-2xl text-primary" />
                  </div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{t.description}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <span className="text-[9px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400">{t.temperature}</span>
                    <span className="text-[9px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400">{t.ratio}</span>
                    <span className="text-[9px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400">{t.grindSize}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
