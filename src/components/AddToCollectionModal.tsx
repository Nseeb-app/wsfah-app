"use client";

import { useState, useEffect } from "react";
import MaterialIcon from "@/components/MaterialIcon";

interface Collection {
  id: string;
  name: string;
  _count: { recipes: number };
}

interface AddToCollectionModalProps {
  recipeId: string;
  onClose: () => void;
}

export default function AddToCollectionModal({ recipeId, onClose }: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      const data = await res.json();
      setCollections(data);
      // Find which collections already contain this recipe
      const checks = data.map((col: Collection) =>
        fetch(`/api/collections/${col.id}/recipes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        })
          .then((r) => r.ok)
          .catch(() => false)
      );
      const results = await Promise.all(checks);
      const existingIds = data
        .filter((_: Collection, i: number) => results[i])
        .map((col: Collection) => col.id);
      setSelectedIds(new Set(existingIds));
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [recipeId]);

  const handleToggle = async (collectionId: string, isSelected: boolean) => {
    try {
      setUpdating((prev) => new Set(prev).add(collectionId));
      const res = await fetch(`/api/collections/${collectionId}/recipes`, {
        method: isSelected ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!res.ok) throw new Error("Failed to update collection");
      if (isSelected) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(collectionId);
          return next;
        });
      } else {
        setSelectedIds((prev) => new Set(prev).add(collectionId));
      }
    } catch (error) {
      console.error("Error toggling collection:", error);
      alert("Failed to update collection");
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(collectionId);
        return next;
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setCreating(true);
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          isPublic: newIsPublic,
        }),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      const newCollection = await res.json();
      setCollections((prev) => [newCollection, ...prev]);
      // Add recipe to new collection
      await handleToggle(newCollection.id, false);
      setNewName("");
      setNewDescription("");
      setNewIsPublic(false);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Add to Collection</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full size-8 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MaterialIcon icon="close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <MaterialIcon icon="collections_bookmark" className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No collections yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-primary font-bold text-sm"
              >
                Create your first collection
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {collections.map((collection) => {
                const isSelected = selectedIds.has(collection.id);
                const isUpdating = updating.has(collection.id);
                return (
                  <label
                    key={collection.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleToggle(collection.id, e.target.checked)}
                      disabled={isUpdating}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm block" dir="auto">
                        {collection.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {collection._count.recipes} recipes
                      </span>
                    </div>
                    {isUpdating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {/* Create New Collection Form */}
          {showCreateForm && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-sm mb-3">Create New Collection</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Collection name"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={2}
                    maxLength={500}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newIsPublic"
                    checked={newIsPublic}
                    onChange={(e) => setNewIsPublic(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="newIsPublic" className="text-sm">
                    Make collection public
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="w-full py-3 bg-primary text-background-dark rounded-lg font-bold text-sm hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create & Add"}
                </button>
              </form>
            </div>
          )}

          {!showCreateForm && collections.length > 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full mt-4 py-3 border border-primary text-primary rounded-lg font-bold text-sm hover:bg-primary/5 transition-colors"
            >
              <MaterialIcon icon="add" className="mr-1" />
              Create New Collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
