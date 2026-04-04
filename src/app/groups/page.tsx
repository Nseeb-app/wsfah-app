"use client";

import { useEffect, useState } from "react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  _count: { members: number };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", isPublic: true });
  const [creating, setCreating] = useState(false);

  async function fetchGroups(query = "") {
    setLoading(true);
    const params = query ? `?search=${encodeURIComponent(query)}` : "";
    const res = await fetch(`/api/groups${params}`);
    if (res.ok) {
      const data = await res.json();
      setGroups(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchGroups(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ name: "", description: "", isPublic: true });
      fetchGroups(search);
    }
    setCreating(false);
  }

  async function handleJoin(groupId: string) {
    const res = await fetch(`/api/groups/${groupId}/members`, { method: "POST" });
    if (res.ok || res.status === 409) {
      window.location.href = `/groups/${groupId}`;
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Groups</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-[#25f459] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1de04d] transition-colors"
          >
            Create Group
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="mb-6 p-4 border border-gray-200 dark:border-gray-800 rounded-lg space-y-3"
          >
            <input
              type="text"
              placeholder="Group name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459]"
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459] resize-none"
              rows={3}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                id="isPublic"
                className="accent-[#25f459]"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                Public group
              </label>
            </div>
            <button
              type="submit"
              disabled={creating || !form.name.trim()}
              className="bg-[#25f459] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1de04d] disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459]"
        />

        {/* List */}
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">Loading...</p>
        ) : groups.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">No groups found.</p>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <div
                key={g.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{g.name}</h3>
                  {g.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {g.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {g._count.members} {g._count.members === 1 ? "member" : "members"}
                  </p>
                </div>
                <button
                  onClick={() => handleJoin(g.id)}
                  className="flex-shrink-0 border border-[#25f459] text-[#25f459] px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#25f459] hover:text-gray-900 transition-colors"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
