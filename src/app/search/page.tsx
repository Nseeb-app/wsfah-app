"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  rating: number;
  category: string;
  source: string;
  author: { name: string | null };
  brand: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync activeCategory when URL param changes
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "All";
    setActiveCategory(urlCategory);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (activeCategory !== "All") params.set("category", activeCategory);

    fetch(`/api/recipes?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query, activeCategory]);

  const allCategories = ["All", ...categories.map((c) => c.name)];

  return (
    <div className="bg-background-light text-espresso min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="size-10 rounded-full flex items-center justify-center hover:bg-primary/10">
            <MaterialIcon icon="arrow_back" />
          </Link>
          <h1 className="text-lg font-bold">Search</h1>
        </div>
        <label className="flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-espresso/5">
          <MaterialIcon icon="search" className="text-espresso/40 mr-3" />
          <input
            dir="auto"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 p-0 w-full text-sm placeholder:text-espresso/30 font-medium outline-none"
            placeholder="Search recipes, roasters, or tea blends"
            type="text"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <MaterialIcon icon="close" className="text-espresso/40 ml-2" />
            </button>
          )}
        </label>
      </header>

      <main className="flex-1 px-6 pb-28">
        {/* Category chips */}
        <div className="flex overflow-x-auto gap-2 mb-6 no-scrollbar">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-espresso"
                  : "bg-white border border-espresso/10 text-espresso/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <MaterialIcon icon="coffee" className="text-4xl text-primary animate-pulse" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-espresso/40">
            <MaterialIcon icon="search_off" className="text-5xl mb-4" />
            <p className="text-sm font-medium">No recipes found</p>
            <p className="text-xs mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recipes.map((item) => (
              <Link href={`/recipe/${item.slug}`} key={item.id} className="flex flex-col gap-3">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                  <img
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={item.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKhsPBTqVlKYRHt_XAv75ctvX3xBReG2P2T-ZoZnEalDyG9bGPiRvCXkljkKqVJea63kHokg5v2TbguwCd0ktoGmjt-OyhKjN6o3hmFbK4vv6LXyO0HKkbzfy14JOdKU1PHqEvyQjwSjoXy98PLVww8Mz7npuKv_u-MwuCXSqmRgxm6Z8rD_A1zGUa0jw4OqouaseX54IjXRusSJoROTVfGP3OuqbM-HMC7A4lFQAwxsDYfilbqHSNVYtZdPQtuFTx4n1kTHvZaIe"}
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    {item.brand ? (
                      <div className="bg-brand-gold text-[8px] font-black px-2 py-0.5 rounded text-white shadow-sm flex items-center gap-0.5">
                        <MaterialIcon icon="verified" className="text-[10px]" /> BRAND
                      </div>
                    ) : (
                      <div className="bg-community-teal text-[8px] font-black px-2 py-0.5 rounded text-white shadow-sm flex items-center gap-0.5">
                        <MaterialIcon icon="group" className="text-[10px]" /> COMMUNITY
                      </div>
                    )}
                  </div>
                  <button className="absolute top-3 right-3 size-8 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center">
                    <MaterialIcon icon="favorite" className="text-sm" />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight mb-1">{item.title}</h4>
                  <p className="text-[10px] opacity-60 font-semibold tracking-wide flex items-center gap-1 uppercase">
                    {item.brand?.name || item.author.name}
                    {item.rating > 0 && (
                      <>
                        {" "}&bull; {item.rating.toFixed(1)} <MaterialIcon icon="star" className="text-[10px] text-primary" />
                      </>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
