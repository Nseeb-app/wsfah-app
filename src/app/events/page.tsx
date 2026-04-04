"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  host: { id: string; name: string | null; image: string | null };
  _count: { rsvps: number };
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate) return;
    setCreating(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        location: form.location || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setShowCreate(false);
      setForm({ title: "", description: "", location: "", startDate: "", endDate: "" });
      router.push(`/events/${created.id}`);
    }
    setCreating(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-[#25f459] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1de04d] transition-colors"
          >
            Create Event
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
              placeholder="Event title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459]"
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459] resize-none"
              rows={3}
            />
            <input
              type="text"
              placeholder="Location (optional)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459]"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Start date
                </label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  End date (optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating || !form.title.trim() || !form.startDate}
              className="bg-[#25f459] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1de04d] disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create Event"}
            </button>
          </form>
        )}

        {/* Event list */}
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            No upcoming events.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => router.push(`/events/${event.id}`)}
                className="w-full text-left border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                <p className="text-sm text-[#25f459] mt-1">{formatDate(event.startDate)}</p>
                {event.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {event.location}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {event._count.rsvps} {event._count.rsvps === 1 ? "attendee" : "attendees"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
