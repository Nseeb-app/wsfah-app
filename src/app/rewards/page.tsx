"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";

interface UserChallenge {
  currentProgress: number;
  status: string;
}

interface Challenge {
  id: string;
  title: string;
  icon: string;
  rewardPoints: number;
  maxProgress: number;
  rank: string;
  users: UserChallenge[];
}

interface Reward {
  id: string;
  title: string;
  category: string;
  pointsCost: number;
  imageUrl: string | null;
}

interface UserData {
  name: string | null;
  image: string | null;
  points: number;
  dailyStreak: number;
}

export default function RewardsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemMessage, setRedeemMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [userRes, rewardsRes, challengesRes] = await Promise.all([
          fetch("/api/users/me"),
          fetch("/api/rewards"),
          fetch("/api/challenges"),
        ]);

        if (cancelled) return;

        if (!userRes.ok) {
          window.location.href = "/login";
          return;
        }

        const userData = await userRes.json();
        setUser(userData);

        if (rewardsRes.ok) {
          setRewards(await rewardsRes.json());
        }

        if (challengesRes.ok) {
          setChallenges(await challengesRes.json());
        }
      } catch {
        if (!cancelled) window.location.href = "/login";
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleRedeem = useCallback(async (rewardId: string, pointsCost: number) => {
    if (!user || user.points < pointsCost) return;
    setRedeeming(rewardId);
    setRedeemMessage(null);

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser((prev) => prev ? { ...prev, points: data.remainingPoints } : prev);
        setRedeemMessage({ type: "success", text: "تم استبدال المكافأة بنجاح!" });
      } else {
        const err = await res.json();
        setRedeemMessage({ type: "error", text: err.error || "فشل الاستبدال" });
      }
    } catch {
      setRedeemMessage({ type: "error", text: "حدث خطأ ما" });
    } finally {
      setRedeeming(null);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const memberTier = user.points >= 2000 ? "Gold" : user.points >= 1000 ? "Silver" : "Bronze";
  const tierColors: Record<string, string> = {
    Bronze: "text-orange-500",
    Silver: "text-slate-400",
    Gold: "text-amber-500",
  };

  // Only show first 3 active challenges (in-progress ones)
  const activeChallenges = challenges.filter((ch) => ch.users?.length > 0 && ch.users[0].currentProgress < ch.maxProgress).slice(0, 3);

  return (
    <div className="bg-background-light font-display text-slate-900 relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center bg-background-light p-4 justify-between border-b border-primary/10 sticky top-0 z-10">
        <Link href="/" className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          مكافآت WSFA
        </h2>
        <Link href="/notifications" className="flex items-center justify-center rounded-lg h-12 bg-transparent text-slate-900 p-0">
          <MaterialIcon icon="notifications" />
        </Link>
      </header>

      {/* Profile Section */}
      <div className="flex p-6">
        <div className="flex w-full flex-col gap-4 items-center">
          <div className="flex gap-4 flex-col items-center">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-24 w-24 ring-4 ring-primary/20"
              style={{
                backgroundImage: `url("${user.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User") + "&background=25f459&color=fff&size=128"}")`,
              }}
            />
            <div className="flex flex-col items-center justify-center">
              <p className="text-slate-900 text-2xl font-bold leading-tight tracking-tight text-center" dir="auto">
                {user.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <MaterialIcon icon="stars" className={`text-sm ${tierColors[memberTier]}`} />
                <p className={`text-sm font-semibold uppercase tracking-wider ${tierColors[memberTier]}`}>
                  عضو {memberTier}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Progress Bar */}
      <div className="px-4 pb-2">
        <div className="bg-white rounded-xl p-5 border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MaterialIcon icon="military_tech" className={tierColors[memberTier]} />
              <p className="text-slate-900 text-base font-bold">تقدم المرتبة</p>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
              memberTier === "Gold" ? "bg-amber-100 text-amber-600" :
              memberTier === "Silver" ? "bg-slate-100 text-slate-500" :
              "bg-orange-100 text-orange-600"
            }`}>
              {memberTier}
            </span>
          </div>
          {(() => {
            const tierThresholds = [
              { name: "Bronze", min: 0, max: 1000, color: "from-orange-400 to-orange-500" },
              { name: "Silver", min: 1000, max: 2000, color: "from-slate-300 to-slate-400" },
              { name: "Gold", min: 2000, max: 2000, color: "from-amber-400 to-amber-500" },
            ];
            const currentTier = tierThresholds.find(t => t.name === memberTier)!;
            const isMaxed = memberTier === "Gold";
            const progress = isMaxed ? 100 : ((user.points - currentTier.min) / (currentTier.max - currentTier.min)) * 100;
            const nextTierName = memberTier === "Bronze" ? "Silver" : memberTier === "Silver" ? "Gold" : null;

            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {tierThresholds.map((tier, i) => (
                    <div key={tier.name} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${
                        i === 0 ? "rounded-l-full" : i === 2 ? "rounded-r-full" : ""
                      } bg-slate-100`}>
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all duration-500`}
                          style={{
                            width: user.points >= tier.max && tier.name !== "Gold"
                              ? "100%"
                              : tier.name === memberTier
                                ? `${Math.min(progress, 100)}%`
                                : user.points >= tier.min
                                  ? "100%"
                                  : "0%"
                          }}
                        />
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        tier.name === memberTier ? "opacity-100" : "opacity-30"
                      }`}>{tier.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2 text-center">
                  {isMaxed ? (
                    <span className="text-amber-500 font-bold">وصلت لأعلى مرتبة! أنت عضو ذهبي!</span>
                  ) : (
                    <>
                      <span className="text-slate-900 font-bold">{user.points.toLocaleString()}</span>
                      {" / "}
                      {currentTier.max.toLocaleString()} pts &mdash;{" "}
                      <span className="text-primary font-bold">{(currentTier.max - user.points).toLocaleString()} نقطة لـ{nextTierName}</span>
                    </>
                  )}
                </p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Redeem Message */}
      {redeemMessage && (
        <div className={`mx-4 mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          redeemMessage.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {redeemMessage.text}
        </div>
      )}

      {/* Points Balance Card */}
      <div className="px-4 pb-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-primary text-slate-900 shadow-lg shadow-primary/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-900/70 text-sm font-bold uppercase tracking-widest">رصيد النقاط الإجمالي</p>
              <p className="text-4xl font-extrabold leading-tight mt-1">
                {user.points.toLocaleString()}
              </p>
            </div>
            <MaterialIcon icon="toll" className="text-4xl opacity-50" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-900/10 flex justify-between items-center">
            <span className="text-sm font-bold">
              المرتبة التالية: {memberTier === "Gold" ? "وصلت الأعلى!" : memberTier === "Silver" ? `${2000 - user.points} نقطة للذهبي` : `${1000 - user.points} نقطة للفضي`}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Streak */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl p-5 border border-primary/10">
          <div className="flex gap-2 justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <MaterialIcon icon="local_fire_department" className="text-orange-500" />
              <p className="text-slate-900 text-base font-bold leading-normal">سلسلة يومية</p>
            </div>
            <p className="text-slate-900 text-sm font-bold">{user.dailyStreak}/5 أيام</p>
          </div>
          <div className="h-3 rounded-full bg-primary/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary shadow-[0_0_8px_rgba(37,244,89,0.5)]"
              style={{ width: `${Math.min((user.dailyStreak / 5) * 100, 100)}%` }}
            />
          </div>
          <p className="text-slate-600 text-xs mt-3 font-medium">
            {user.dailyStreak >= 5 ? (
              <span className="text-primary font-bold">السلسلة مكتملة! +50 نقطة إضافية!</span>
            ) : (
              <>
                {5 - user.dailyStreak} يوم متبقي للحصول على{" "}
                <span className="text-primary font-bold">50 نقطة إضافية</span>!
              </>
            )}
          </p>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-900 text-lg font-bold">التحديات النشطة</h3>
          <Link href="/challenges" className="text-primary text-sm font-bold">
            عرض الكل
          </Link>
        </div>
        {activeChallenges.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-primary/5 text-center">
            <MaterialIcon icon="emoji_events" className="text-3xl text-espresso/20 mb-2" />
            <p className="text-sm text-espresso/50 font-medium">لا توجد تحديات نشطة</p>
            <Link href="/challenges" className="text-primary text-xs font-bold mt-2 inline-block">
              تصفح التحديات
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeChallenges.map((ch) => {
              const userProgress = ch.users[0];
              const progress = (userProgress.currentProgress / ch.maxProgress) * 100;

              return (
                <div key={ch.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-primary/5">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MaterialIcon icon={ch.icon} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900" dir="auto">{ch.title}</p>
                    <p className="text-xs text-slate-500 mt-1">المكافأة: {ch.rewardPoints} نقطة</p>
                    <div className="mt-2 h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {userProgress.currentProgress}/{ch.maxProgress}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redeemable Rewards */}
      <div className="px-4 py-6">
        <h3 className="text-slate-900 text-lg font-bold mb-4">مكافآت قابلة للاستبدال</h3>
        {rewards.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-primary/5 text-center">
            <MaterialIcon icon="redeem" className="text-3xl text-espresso/20 mb-2" />
            <p className="text-sm text-espresso/50 font-medium">لا توجد مكافآت متاحة بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {rewards.map((rw) => {
              const canRedeem = user.points >= rw.pointsCost;
              return (
                <div key={rw.id} className="bg-white rounded-xl overflow-hidden border border-primary/5 flex flex-col">
                  <div
                    className="h-32 bg-cover bg-center bg-slate-100"
                    style={rw.imageUrl ? { backgroundImage: `url('${rw.imageUrl}')` } : {}}
                  />
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-xs font-bold text-primary uppercase mb-1">{rw.category}</p>
                    <p className="text-sm font-bold text-slate-900 mb-3" dir="auto">{rw.title}</p>
                    <button
                      onClick={() => handleRedeem(rw.id, rw.pointsCost)}
                      disabled={!canRedeem || redeeming === rw.id}
                      className={`mt-auto w-full py-2.5 bg-primary text-slate-900 text-xs font-bold rounded-lg transition-opacity ${
                        !canRedeem ? "opacity-50 cursor-not-allowed" : "active:scale-95"
                      }`}
                    >
                      {redeeming === rw.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="size-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                          جاري الاستبدال...
                        </span>
                      ) : (
                        `${rw.pointsCost.toLocaleString()} pts`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-28" />
      <BottomNav />
    </div>
  );
}
