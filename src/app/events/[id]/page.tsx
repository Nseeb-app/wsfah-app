"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  host: { id: string; name: string | null; image: string | null };
  _count: { rsvps: number };
  userRsvp: string | null;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${id}`);
    if (res.ok) {
      setEvent(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  async function handleRsvp(status: "GOING" | "INTERESTED") {
    setRsvpLoading(true);
    const res = await fetch(`/api/events/${id}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              userRsvp: data.rsvp,
              _count: {
                ...prev._count,
                rsvps: data.rsvp
                  ? prev.userRsvp
                    ? prev._count.rsvps
                    : prev._count.rsvps + 1
                  : prev._count.rsvps - 1,
              },
            }
          : prev
      );
    }
    setRsvpLoading(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h1>

        <div className="mt-4 space-y-2">
          <p className="text-[#25f459] font-medium">{formatDate(event.startDate)}</p>
          {event.endDate && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              to {formatDate(event.endDate)}
            </p>
          )}
          {event.location && (
            <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hosted by {event.host.name || "Unknown"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {event._count.rsvps} {event._count.rsvps === 1 ? "attendee" : "attendees"}
          </p>
        </div>

        {event.description && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* RSVP buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => handleRsvp("GOING")}
            disabled={rsvpLoading}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              event.userRsvp === "GOING"
                ? "bg-[#25f459] text-gray-900"
                : "border border-[#25f459] text-[#25f459] hover:bg-[#25f459] hover:text-gray-900"
            } disabled:opacity-50`}
          >
            {event.userRsvp === "GOING" ? "Going" : "Going"}
          </button>
          <button
            onClick={() => handleRsvp("INTERESTED")}
            disabled={rsvpLoading}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              event.userRsvp === "INTERESTED"
                ? "bg-yellow-500 text-gray-900"
                : "border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900"
            } disabled:opacity-50`}
          >
            Interested
          </button>
          {event.userRsvp && (
            <button
              onClick={() => handleRsvp(event.userRsvp as "GOING" | "INTERESTED")}
              disabled={rsvpLoading}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
