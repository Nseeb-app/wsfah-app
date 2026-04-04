"use client";

import { useState, useEffect } from "react";
import ActivityCard from "@/components/ActivityCard";
import AdSlot from "@/components/AdSlot";
import BottomNav from "@/components/BottomNav";

interface Activity {
  id: string;
  userId: string;
  type: string;
  entityId: string | null;
  entityType: string | null;
  metadata: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function FeedPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchFeed = async (cursor?: string) => {
    try {
      const url = cursor ? `/api/feed?cursor=${cursor}` : "/api/feed";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch feed");
      const data = await res.json();
      if (cursor) {
        setActivities((prev) => [...prev, ...data.activities]);
      } else {
        setActivities(data.activities);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchFeed(nextCursor);
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
        <h1 className="text-xl font-bold">Activity Feed</h1>
      </header>

      {/* Feed */}
      <div className="p-4">
        {activities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No activity yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Follow users to see their activity in your feed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div key={activity.id}>
                <ActivityCard activity={activity} />
                {/* Show ad after every 3rd activity */}
                {(i + 1) % 3 === 0 && i < activities.length - 1 && (
                  <AdSlot slot={`feed-${Math.floor(i / 3)}`} format="horizontal" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {nextCursor && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-primary text-background-dark rounded-full font-bold text-sm hover:bg-primary/80 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
