"use client";

import { useState, useEffect } from "react";

interface FollowButtonProps {
  userId: string;
  className?: string;
}

export default function FollowButton({ userId, className = "" }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/follow?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => setIsFollowing(d.following))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`font-bold py-3 rounded-xl transition-all disabled:opacity-50 ${
        isFollowing
          ? "bg-slate-100 text-slate-600 border border-slate-200"
          : "bg-primary text-background-dark hover:opacity-90"
      } ${className}`}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
