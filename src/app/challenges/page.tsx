"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";

interface UserChallenge {
  id: string;
  currentProgress: number;
  status: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardPoints: number;
  maxProgress: number;
  rank: string;
  category: string;
  users?: UserChallenge[];
}

interface UserData {
  points: number;
  name: string | null;
}

const RANKS = ["All", "Bronze", "Silver", "Gold"] as const;
const CATEGORIES = ["All", "General", "Brewing", "Social", "Streak"] as const;

const rankColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Bronze: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-100 text-orange-600" },
  Silver: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", badge: "bg-slate-200 text-slate-600" },
  Gold: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-600" },
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRank, setActiveRank] = useState<string>("All");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [joining, setJoining] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  // Determine user rank from points
  const userRank = !user ? "Bronze" : user.points >= 2000 ? "Gold" : user.points >= 1000 ? "Silver" : "Bronze";

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeRank !== "All") params.set("rank", activeRank);
    if (activeCategory !== "All") params.set("category", activeCategory);

    fetch(`/api/challenges?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setChallenges(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeRank, activeCategory]);

  const handleJoin = async (challengeId: string) => {
    setJoining(challengeId);
    try {
      const res = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      if (res.ok) {
        // Refresh challenges
        setChallenges((prev) =>
          prev.map((ch) =>
            ch.id === challengeId
              ? { ...ch, users: [{ id: "new", currentProgress: 0, status: "ACTIVE" }] }
              : ch
          )
        );
      }
    } catch {
      // ignore
    } finally {
      setJoining(null);
    }
  };

  const rankOrder = ["Bronze", "Silver", "Gold"];
  const userRankIndex = rankOrder.indexOf(userRank);

  return (
    <div className="bg-background-light text-espresso min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-6 pt-6 pb-4 border-b border-espresso/5">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/rewards" className="size-10 rounded-full flex items-center justify-center hover:bg-primary/10">
            <MaterialIcon icon="arrow_back" />
          </Link>
          <h1 className="text-lg font-bold">التحديات</h1>
        </div>

        {/* User Rank Badge */}
        <div className="flex items-center gap-3 mb-4 bg-white rounded-xl p-3 border border-espresso/10">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MaterialIcon icon="military_tech" className="text-xl text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-espresso/60 font-medium">مرتبتك</p>
            <p className="text-sm font-bold">عضو {userRank}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${rankColors[userRank]?.badge || "bg-orange-100 text-orange-600"}`}>
            {user?.points?.toLocaleString() || 0} pts
          </span>
        </div>

        {/* Rank Filter */}
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          {RANKS.map((rank) => (
            <button
              key={rank}
              onClick={() => setActiveRank(rank)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                activeRank === rank
                  ? "bg-primary text-espresso"
                  : "bg-white border border-espresso/10 text-espresso/60"
              }`}
            >
              {rank}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeCategory === cat
                  ? "bg-espresso text-white"
                  : "bg-espresso/5 text-espresso/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-6 py-6 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <MaterialIcon icon="fitness_center" className="text-4xl text-primary animate-pulse" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-espresso/40">
            <MaterialIcon icon="emoji_events" className="text-5xl mb-4" />
            <p className="text-sm font-medium">لا توجد تحديات متاحة</p>
            <p className="text-xs mt-1">تحقق لاحقاً لتحديات جديدة!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((ch) => {
              const userProgress = ch.users?.[0];
              const isJoined = !!userProgress;
              const progress = userProgress
                ? (userProgress.currentProgress / ch.maxProgress) * 100
                : 0;
              const isCompleted = userProgress?.currentProgress === ch.maxProgress;
              const colors = rankColors[ch.rank] || rankColors.Bronze;
              const challengeRankIndex = rankOrder.indexOf(ch.rank);
              const isLocked = challengeRankIndex > userRankIndex;

              return (
                <div
                  key={ch.id}
                  className={`rounded-2xl border overflow-hidden ${colors.border} ${
                    isLocked ? "opacity-60" : ""
                  }`}
                >
                  <div className={`px-4 py-4 ${colors.bg}`}>
                    <div className="flex items-start gap-3">
                      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${colors.badge}`}>
                        <MaterialIcon icon={isLocked ? "lock" : ch.icon} className="text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold" dir="auto">{ch.title}</h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${colors.badge}`}>
                            {ch.rank}
                          </span>
                        </div>
                        <p className="text-xs text-espresso/60 mb-2" dir="auto">{ch.description}</p>
                        <div className="flex items-center gap-3 text-xs text-espresso/50">
                          <span className="flex items-center gap-1">
                            <MaterialIcon icon="stars" className="text-sm text-primary" />
                            {ch.rewardPoints} pts
                          </span>
                          <span className="flex items-center gap-1">
                            <MaterialIcon icon="flag" className="text-sm" />
                            {ch.maxProgress} goal
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-espresso/5`}>
                            {ch.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for joined challenges */}
                    {isJoined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-espresso/50">التقدم</span>
                          <span className="text-[10px] font-bold">
                            {userProgress.currentProgress}/{ch.maxProgress}
                          </span>
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-primary"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    <div className="mt-3">
                      {isLocked ? (
                        <p className="text-xs text-espresso/40 font-medium flex items-center gap-1">
                          <MaterialIcon icon="lock" className="text-sm" />
                          حقق مرتبة {ch.rank} للفتح
                        </p>
                      ) : isCompleted ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <MaterialIcon icon="check_circle" className="text-lg" />
                          <span className="text-xs font-bold">مكتمل!</span>
                        </div>
                      ) : isJoined ? (
                        <div className="flex items-center gap-2 text-primary">
                          <MaterialIcon icon="trending_up" className="text-lg" />
                          <span className="text-xs font-bold">قيد التنفيذ</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoin(ch.id)}
                          disabled={joining === ch.id}
                          className="bg-primary text-espresso text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
                        >
                          {joining === ch.id ? "جاري الانضمام..." : "انضم للتحدي"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
