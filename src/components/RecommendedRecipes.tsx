"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Recipe {
  id: string;
  slug: string;
  title: string;
  category: string;
  imageUrl: string | null;
  rating: number;
  author: { id: string; name: string | null; image: string | null } | null;
}

export default function RecommendedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => setRecipes(data))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || recipes.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Recommended for You
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipe/${recipe.slug}`}
            className="flex-shrink-0 w-64 rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-[#25f459]/20 text-[#25f459] font-medium">
                {recipe.category}
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {recipe.title}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(recipe.rating)
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {recipe.author?.name && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  by {recipe.author.name}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
