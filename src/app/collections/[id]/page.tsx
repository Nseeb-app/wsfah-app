"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userId: string;
  recipes: Array<{
    id: string;
    addedAt: string;
    recipe: {
      id: string;
      title: string;
      imageUrl: string | null;
      category: string;
      difficulty: string;
      rating: number;
      likes: number;
      author: {
        id: string;
        name: string | null;
        image: string | null;
      };
    };
  }>;
}

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/collections/${id}`);
      if (!res.ok) throw new Error("Failed to fetch collection");
      const data = await res.json();
      setCollection(data);
      setName(data.name);
      setDescription(data.description || "");
      setIsPublic(data.isPublic);
    } catch (error) {
      console.error("Error fetching collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.id);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchCollection();
    fetchCurrentUser();
  }, [id]);

  const isOwner = currentUserId && collection?.userId === currentUserId;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setEditing(true);
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isPublic }),
      });
      if (!res.ok) throw new Error("Failed to update collection");
      await fetchCollection();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating collection:", error);
      alert("Failed to update collection");
    } finally {
      setEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MaterialIcon icon="error_outline" className="text-4xl text-red-400" />
          <p className="text-sm text-slate-500 mt-2">Collection not found</p>
          <Link href="/collections" className="text-primary text-sm font-bold mt-3 block">Back to Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 justify-between bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <Link href="/collections" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center truncate">
          {collection.name}
        </h1>
        {isOwner && (
          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="flex items-center justify-center rounded-full size-10 hover:bg-primary/10"
          >
            <MaterialIcon icon="edit" />
          </button>
        )}
      </header>

      {/* Edit Form */}
      {showEditForm && isOwner && (
        <div className="p-4 bg-white border-b border-primary/10">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="isPublic" className="text-sm">
                Make collection public
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={editing || !name.trim()}
                className="flex-1 py-3 bg-primary text-background-dark rounded-lg font-bold text-sm hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editing ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                disabled={editing}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collection Info */}
      <div className="p-4">
        {collection.description && (
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400" dir="auto">
              {collection.description}
            </p>
          </div>
        )}

        {/* Public/Private Badge */}
        <div className="flex items-center gap-2 mb-6">
          {collection.isPublic ? (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <MaterialIcon icon="public" className="text-xs" />
              Public Collection
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <MaterialIcon icon="lock" className="text-xs" />
              Private Collection
            </span>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {collection.recipes.length} recipes
          </span>
        </div>

        {/* Recipes Grid */}
        {collection.recipes.length === 0 ? (
          <div className="text-center py-16">
            <MaterialIcon icon="restaurant" className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No recipes yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Add recipes to this collection to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.recipes.map(({ recipe }) => (
              <Link
                key={recipe.id}
                href={`/recipe/${recipe.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div
                  className="aspect-[4/3] bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${recipe.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDx0adClnNBdxpDHQhAkOyeuKjNOzDBU4Caybjfn5MlzVSfNiCNO-hsVCL2PIN-tYiHqlFOft3gKVAaTuFIARHvs0l1rxBpfUs3Y8BYF8rS4RywIhyxi4EUu3EAh7bp2Y9WX49L5iX0KDWzOtHAgiRAGdwM9kXnMr8PdEUEEdw6xYa--jHE9aXRqSugT_cjoEErbMkBEEv7TvUfzPLsf3v4-TJlVaSq9jHIV1dO70-1YfsFmVl0CsyeRcL2rnkKtpZkpEyj5xazZUdm"}')`,
                  }}
                />
                <div className="p-4">
                  <h3 className="font-bold text-base mb-2 line-clamp-2" dir="auto">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{recipe.category}</span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MaterialIcon icon="star" className="text-[10px] text-amber-400" filled />
                      {recipe.rating > 0 ? recipe.rating.toFixed(1) : "No rating"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MaterialIcon icon="favorite" className="text-[10px] text-red-400" filled />
                      {recipe.likes}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
