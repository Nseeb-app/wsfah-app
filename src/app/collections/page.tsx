"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  _count: { recipes: number };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      const data = await res.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isPublic }),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      await fetchCollections();
      setName("");
      setDescription("");
      setIsPublic(false);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 justify-between bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <h1 className="text-xl font-bold">My Collections</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-full font-bold text-sm hover:bg-primary/80 transition-colors"
        >
          <MaterialIcon icon="add" />
          Create
        </button>
      </header>

      {/* Create Collection Form */}
      {showCreateForm && (
        <div className="p-4 bg-white border-b border-primary/10">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Collection name"
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
                placeholder="What's this collection about?"
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
                disabled={creating || !name.trim()}
                className="flex-1 py-3 bg-primary text-background-dark rounded-lg font-bold text-sm hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Collection"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collections Grid */}
      <div className="p-4">
        {collections.length === 0 ? (
          <div className="text-center py-16">
            <MaterialIcon icon="collections_bookmark" className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No collections yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Create your first collection to organize your favorite recipes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg truncate flex-1" dir="auto">
                    {collection.name}
                  </h3>
                  {collection.isPublic && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ml-2">
                      <MaterialIcon icon="public" className="text-[10px]" />
                      Public
                    </span>
                  )}
                </div>
                {collection.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2" dir="auto">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MaterialIcon icon="restaurant" />
                  <span>{collection._count.recipes} recipes</span>
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
