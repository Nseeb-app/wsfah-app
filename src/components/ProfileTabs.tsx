"use client";

import { useState } from "react";
import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

type RecipeCard = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  rating: number;
  likes: number;
};

type SaveEntry = {
  id: string;
  recipe: RecipeCard;
};

type LikeEntry = {
  id: string;
  recipe: RecipeCard;
};

interface ProfileTabsProps {
  recipes: RecipeCard[];
  saves: SaveEntry[];
  likes: LikeEntry[];
}

const PLACEHOLDER_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKhsPBTqVlKYRHt_XAv75ctvX3xBReG2P2T-ZoZnEalDyG9bGPiRvCXkljkKqVJea63kHokg5v2TbguwCd0ktoGmjt-OyhKjN6o3hmFbK4vv6LXyO0HKkbzfy14JOdKU1PHqEvyQjwSjoXy98PLVww8Mz7npuKv_u-MwuCXSqmRgxm6Z8rD_A1zGUa0jw4OqouaseX54IjXRusSJoROTVfGP3OuqbM-HMC7A4lFQAwxsDYfilbqHSNVYtZdPQtuFTx4n1kTHvZaIe";

type TabKey = "recipes" | "saved" | "liked";

const tabs: { key: TabKey; label: string }[] = [
  { key: "recipes", label: "وصفاتي" },
  { key: "saved", label: "المحفوظات" },
  { key: "liked", label: "الإعجابات" },
];

function RecipeGrid({ items, emptyIcon, emptyText, emptyAction }: {
  items: RecipeCard[];
  emptyIcon: string;
  emptyText: string;
  emptyAction?: { label: string; href: string };
}) {
  if (items.length === 0) {
    return (
      <div className="col-span-2 flex flex-col items-center py-12 text-slate-400">
        <MaterialIcon icon={emptyIcon} className="text-4xl mb-2" />
        <p className="text-sm font-medium" dir="auto">{emptyText}</p>
        {emptyAction && (
          <Link href={emptyAction.href} className="text-primary text-sm font-bold mt-2" dir="auto">
            {emptyAction.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {items.map((r) => (
        <Link href={`/recipe/${r.slug}`} key={r.id} className="flex flex-col gap-2">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={r.imageUrl || PLACEHOLDER_IMG}
              alt={r.title}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <div className="flex items-center justify-between text-white text-[10px] font-bold">
                <div className="flex items-center gap-1">
                  <MaterialIcon icon="favorite" className="text-xs" filled />
                  {r.likes}
                </div>
                <div className="flex items-center gap-0.5">
                  {r.rating.toFixed(1)} <MaterialIcon icon="star" className="text-xs text-primary" filled />
                </div>
              </div>
            </div>
          </div>
          <h4 className="font-bold text-sm leading-tight" dir="auto">{r.title}</h4>
        </Link>
      ))}
    </>
  );
}

export default function ProfileTabs({ recipes, saves, likes }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("recipes");

  const savedRecipes = saves.map((s) => s.recipe);
  const likedRecipes = likes.map((l) => l.recipe);

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex border-b border-slate-200 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-slate-900"
                : "border-transparent text-slate-500 font-medium"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {activeTab === "recipes" && (
          <RecipeGrid
            items={recipes}
            emptyIcon="menu_book"
            emptyText="لا توجد وصفات بعد"
            emptyAction={{ label: "أنشئ وصفتك الأولى", href: "/create" }}
          />
        )}
        {activeTab === "saved" && (
          <RecipeGrid
            items={savedRecipes}
            emptyIcon="bookmark"
            emptyText="لا توجد وصفات محفوظة بعد"
            emptyAction={{ label: "استكشف الوصفات", href: "/search" }}
          />
        )}
        {activeTab === "liked" && (
          <RecipeGrid
            items={likedRecipes}
            emptyIcon="favorite"
            emptyText="لا توجد وصفات معجب بها بعد"
            emptyAction={{ label: "استكشف الوصفات", href: "/search" }}
          />
        )}
      </div>
    </div>
  );
}
