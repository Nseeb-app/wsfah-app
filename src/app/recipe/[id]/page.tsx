"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";
import CommentSection from "@/components/CommentSection";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import AdSlot from "@/components/AdSlot";
import BrewMode from "@/components/BrewMode";
import BrewLogModal from "@/components/BrewLogModal";
import Link from "next/link";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  difficulty: string;
  brewTime: string | null;
  brewTimeSeconds: number;
  imageUrl: string | null;
  source: string;
  rating: number;
  likes: number;
  isVerified: boolean;
  isFeatured: boolean;
  authorId: string;
  author: { id: string; name: string | null; image: string | null; avgRating: number; role: string };
  brand: { id: string; name: string; logo: string | null } | null;
  ingredients: { id: string; name: string; baseAmount: number; unit: string; imageUrl: string | null; sortOrder: number }[];
  steps: { id: string; stepNumber: number; title: string; description: string; imageUrl: string | null }[];
  brewParams: { temperature: string; ratio: string; grindSize: string; brewTimeSec: number } | null;
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [cups, setCups] = useState(1);
  const [timer, setTimer] = useState(180);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Like & Save state
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  // Current user state (for owner actions)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Rating state
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [displayRating, setDisplayRating] = useState(0);

  // Collection modal state
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Brew mode & log state
  const [showBrewMode, setShowBrewMode] = useState(false);
  const [showBrewLog, setShowBrewLog] = useState(false);

  // Fetch recipe data
  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRecipe(data);
        setLikeCount(data.likes ?? 0);
        setDisplayRating(data.rating ?? 0);
        if (data.brewParams?.brewTimeSec) {
          setTimer(data.brewParams.brewTimeSec);
        } else if (data.brewTimeSeconds) {
          setTimer(data.brewTimeSeconds);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Fetch current user
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((data) => {
        setCurrentUserId(data.id);
      })
      .catch(() => {});
  }, []);

  // Fetch initial like status
  useEffect(() => {
    fetch(`/api/recipes/${id}/like`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.liked === "boolean") setLiked(data.liked);
      })
      .catch(() => {});
  }, [id]);

  // Fetch initial save status
  useEffect(() => {
    fetch(`/api/recipes/${id}/save`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.saved === "boolean") setSaved(data.saved);
      })
      .catch(() => {});
  }, [id]);

  // Fetch user's existing rating
  useEffect(() => {
    fetch(`/api/recipes/${id}/rate`)
      .then((r) => r.json())
      .then((data) => {
        if (data.userRating !== null) setUserRating(data.userRating);
      })
      .catch(() => {});
  }, [id]);

  // Submit rating
  const submitRating = useCallback(async (value: number) => {
    if (ratingBusy) return;
    setRatingBusy(true);
    setUserRating(value);
    try {
      const res = await fetch(`/api/recipes/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setDisplayRating(data.rating);
        setUserRating(data.userRating);
      }
    } catch {
      // revert
    } finally {
      setRatingBusy(false);
    }
  }, [id, ratingBusy]);

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    try {
      const res = await fetch(`/api/recipes/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      } else {
        // Revert on failure
        setLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLikeBusy(false);
    }
  }, [id, liked, likeBusy]);

  // Toggle save
  const toggleSave = useCallback(async () => {
    if (saveBusy) return;
    setSaveBusy(true);
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      const res = await fetch(`/api/recipes/${id}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      } else {
        setSaved(wasSaved);
      }
    } catch {
      setSaved(wasSaved);
    } finally {
      setSaveBusy(false);
    }
  }, [id, saved, saveBusy]);

  const isOwner = currentUserId && recipe?.authorId === currentUserId;

  const handleDelete = useCallback(async () => {
    if (!recipe) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/profile");
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [recipe, router]);

  const totalTime = recipe?.brewParams?.brewTimeSec || recipe?.brewTimeSeconds || 180;

  const resetTimer = useCallback(() => {
    setRunning(false);
    setTimer(totalTime);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [totalTime]);

  useEffect(() => {
    if (running && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, timer]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Scale quantities in step descriptions based on cups
  const scaleText = useCallback((text: string) => {
    if (cups === 1) return text;
    // Match numbers followed by units (g, ml, oz, cups, tbsp, tsp, l, cl)
    return text.replace(
      /(\d+\.?\d*)\s*(g|ml|oz|cups?|tbsp|tsp|liters?|l|cl|grams?|ounces?)\b/gi,
      (_match, num, unit) => {
        const scaled = parseFloat(num) * cups;
        const formatted = scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1);
        return `${formatted} ${unit}`;
      }
    );
  }, [cups]);

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MaterialIcon icon="coffee" className="text-4xl text-primary animate-pulse" />
          <p className="text-sm text-slate-500 mt-2">جاري تحميل الوصفة...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MaterialIcon icon="error_outline" className="text-4xl text-red-400" />
          <p className="text-sm text-slate-500 mt-2">الوصفة غير موجودة</p>
          <Link href="/" className="text-primary text-sm font-bold mt-3 block">الرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center bg-background-light/80 backdrop-blur-md p-4 justify-between border-b border-primary/10">
        <Link
          href="/"
          className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer"
        >
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          تفاصيل الوصفة
        </h2>
        <button
          onClick={() => {
            const shareUrl = `${window.location.origin}/recipe/${id}`;
            if (navigator.share) {
              navigator.share({ title: recipe?.title || "وصفة", url: shareUrl }).catch(() => {});
            } else {
              navigator.clipboard.writeText(shareUrl).then(() => alert("تم نسخ الرابط!")).catch(() => {});
            }
          }}
          className="flex cursor-pointer items-center justify-center rounded-full size-10 hover:bg-primary/10 transition-colors"
        >
          <MaterialIcon icon="share" className="text-slate-900" />
        </button>
      </nav>

      <main className="max-w-2xl mx-auto pb-28">
        {/* Hero */}
        <div
          className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden aspect-[4/3] relative"
          style={{
            backgroundImage: `url("${recipe.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDx0adClnNBdxpDHQhAkOyeuKjNOzDBU4Caybjfn5MlzVSfNiCNO-hsVCL2PIN-tYiHqlFOft3gKVAaTuFIARHvs0l1rxBpfUs3Y8BYF8rS4RywIhyxi4EUu3EAh7bp2Y9WX49L5iX0KDWzOtHAgiRAGdwM9kXnMr8PdEUEEdw6xYa--jHE9aXRqSugT_cjoEErbMkBEEv7TvUfzPLsf3v4-TJlVaSq9jHIV1dO70-1YfsFmVl0CsyeRcL2rnkKtpZkpEyj5xazZUdm"}")`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent" />
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-2">
              {recipe.isFeatured && (
                <span className="bg-primary text-background-dark text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  مميز
                </span>
              )}
            </div>
            <h1 dir="auto" className="text-white text-3xl font-extrabold leading-tight tracking-tight">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Meta */}
        <div className="px-4 py-6 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              {recipe.isVerified && (
                <div className="flex items-center gap-2 text-primary">
                  <MaterialIcon icon="verified" className="text-sm" />
                  <p className="text-sm font-bold tracking-wide uppercase">شارة علامة تجارية موثقة</p>
                </div>
              )}
              <div className="flex items-center gap-4 text-slate-600 text-sm font-medium">
                <div className="flex items-center gap-1">
                  <MaterialIcon icon="signal_cellular_alt" className="text-base" />
                  <span>{recipe.difficulty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MaterialIcon icon="schedule" className="text-base" />
                  <span>{recipe.brewTime || `${Math.ceil(recipe.brewTimeSeconds / 60)} mins`}</span>
                </div>
              </div>
            </div>

            {/* Like & Save buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLike}
                disabled={likeBusy}
                className="flex items-center gap-1.5 cursor-pointer rounded-full h-10 px-3 border border-primary/20 hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-60"
                aria-label={liked ? "Unlike recipe" : "Like recipe"}
              >
                <MaterialIcon
                  icon="favorite"
                  filled={liked}
                  className={`text-xl transition-colors ${liked ? "text-red-500" : "text-slate-400"}`}
                />
                <span className="text-sm font-bold text-slate-700 tabular-nums">{likeCount}</span>
              </button>
              <button
                onClick={toggleSave}
                disabled={saveBusy}
                className="flex items-center justify-center cursor-pointer rounded-full size-10 border border-primary/20 hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-60"
                aria-label={saved ? "Unsave recipe" : "Save recipe"}
              >
                <MaterialIcon
                  icon="bookmark"
                  filled={saved}
                  className={`text-xl transition-colors ${saved ? "text-primary" : "text-slate-400"}`}
                />
              </button>
              <button
                onClick={() => setShowCollectionModal(true)}
                className="flex items-center justify-center cursor-pointer rounded-full size-10 border border-primary/20 hover:bg-primary/5 active:scale-95 transition-all"
                aria-label="Add to collection"
              >
                <MaterialIcon
                  icon="collections_bookmark"
                  className="text-xl text-slate-400"
                />
              </button>
            </div>
          </div>

          {/* Author Card */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
            <div
              className="size-12 rounded-full bg-cover bg-center border-2 border-primary/20 shrink-0"
              style={{
                backgroundImage: `url("${recipe.author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipe.author.name || "User")}&background=25f459&color=fff&size=64`}")`,
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p dir="auto" className="font-bold text-sm truncate">{recipe.author.name || "مجهول"}</p>
                {recipe.author.role === "CREATOR" && (
                  <span className="inline-flex items-center gap-0.5 bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                    <MaterialIcon icon="verified" className="text-[10px]" filled />
                    مبدع
                  </span>
                )}
                {recipe.brand && (
                  <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                    <MaterialIcon icon="storefront" className="text-[10px]" />
                    علامة تجارية
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                {recipe.brand?.name || recipe.category}
                {recipe.author.avgRating > 0 && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <MaterialIcon icon="star" className="text-[10px] text-primary" filled />
                    {recipe.author.avgRating.toFixed(1)}
                  </span>
                )}
              </p>
            </div>
            {recipe.brand && (
              <Link
                href={`/brand/${recipe.brand.id}`}
                className="text-xs font-bold text-primary px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors shrink-0"
              >
                عرض العلامة التجارية
              </Link>
            )}
          </div>

          {/* Rating Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-sm">قيّم هذه الوصفة</h4>
                <p className="text-xs text-slate-500">
                  {displayRating > 0 ? `${displayRating.toFixed(1)} متوسط` : "كن أول من يقيّم"}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                <MaterialIcon icon="star" className="text-primary text-sm" filled />
                <span className="text-sm font-bold">{displayRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={ratingBusy}
                  className="p-1 active:scale-110 transition-transform disabled:opacity-50"
                >
                  <MaterialIcon
                    icon="star"
                    filled={star <= (hoverRating || userRating || 0)}
                    className={`text-3xl transition-colors ${
                      star <= (hoverRating || userRating || 0) ? "text-amber-400" : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {userRating && (
              <p className="text-center text-xs text-slate-500 mt-2">
                تقييمك {userRating}/5
              </p>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex gap-3">
              <Link
                href={`/recipe/edit/${id}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
              >
                <MaterialIcon icon="edit" className="text-lg" />
                تعديل الوصفة
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
              >
                <MaterialIcon icon="delete" className="text-lg" />
                حذف
              </button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="size-14 rounded-full bg-red-100 flex items-center justify-center">
                    <MaterialIcon icon="delete_forever" className="text-3xl text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold">حذف الوصفة؟</h3>
                  <p className="text-sm text-slate-500">لا يمكن التراجع عن هذا الإجراء. سيتم حذف الوصفة وجميع البيانات المرتبطة بها نهائياً.</p>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "حذف"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Story */}
          {recipe.description && (
            <section>
              <h3 className="text-xl font-bold mb-3">القصة</h3>
              <p dir="auto" className="text-slate-600 leading-relaxed">{recipe.description}</p>
            </section>
          )}

          {/* Servings */}
          <div className="flex items-center justify-between mb-6 bg-slate-100 p-4 rounded-xl">
            <div>
              <p className="text-sm font-bold">عدد الأكواب</p>
              <p className="text-[10px] text-slate-500">يعدّل كميات المكونات</p>
            </div>
            <div className="flex items-center gap-3 bg-background-light p-1 rounded-full border border-primary/20">
              <button
                onClick={() => setCups((c) => Math.max(1, c - 1))}
                className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-background-dark transition-colors"
              >
                <MaterialIcon icon="remove" />
              </button>
              <span className="text-base font-bold w-4 text-center">{cups}</span>
              <button
                onClick={() => setCups((c) => c + 1)}
                className="size-8 flex items-center justify-center rounded-full bg-primary text-background-dark hover:bg-primary/80 transition-colors"
              >
                <MaterialIcon icon="add" />
              </button>
            </div>
          </div>

          {/* Brewing Parameters */}
          {recipe.brewParams && (
            <section className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MaterialIcon icon="settings_input_component" className="text-primary" />
                معايير التحضير
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "الحرارة", value: recipe.brewParams.temperature },
                  { label: "النسبة", value: recipe.brewParams.ratio },
                  { label: "الطحن", value: recipe.brewParams.grindSize },
                ].map((p) => (
                  <div key={p.label} className="flex flex-col items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-[10px] text-primary/70 uppercase font-black mb-1 tracking-widest">{p.label}</span>
                    <span dir="auto" className="text-base font-bold text-slate-900">{p.value}</span>
                  </div>
                ))}
              </div>

              {/* Timer */}
              <div className="mt-8 pt-6 border-t border-primary/10">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">مؤقت التحضير</p>
                  <div className="text-5xl font-extrabold tracking-tighter text-slate-900 mb-4 tabular-nums">
                    {formatTime(timer)}
                  </div>
                  <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(timer / totalTime) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setRunning(!running)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-background-dark rounded-full font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                    >
                      <MaterialIcon icon={running ? "pause" : "play_arrow"} filled className="text-lg" />
                      <span>{running ? "إيقاف" : "ابدأ"}</span>
                    </button>
                    <button
                      onClick={resetTimer}
                      className="flex items-center gap-2 px-6 py-2.5 border border-primary/20 text-slate-600 rounded-full font-bold text-sm hover:bg-primary/5 active:scale-95 transition-transform"
                    >
                      <MaterialIcon icon="restart_alt" className="text-lg" />
                      <span>إعادة ضبط</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Brew Actions */}
          <div className="flex gap-3">
            {recipe.steps.length > 0 && (
              <button
                onClick={() => setShowBrewMode(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-background-dark font-bold text-sm hover:opacity-90 transition-opacity active:scale-95"
              >
                <MaterialIcon icon="play_circle" className="text-xl" filled />
                ابدأ وضع التحضير
              </button>
            )}
            <button
              onClick={() => setShowBrewLog(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors active:scale-95"
            >
              <MaterialIcon icon="edit_note" className="text-xl" />
              حضّرتها
            </button>
          </div>

          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">المكونات</h3>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  {recipe.ingredients.length} عنصر
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {recipe.ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      {ing.imageUrl && (
                        <div
                          className="size-10 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url('${ing.imageUrl}')` }}
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {(ing.baseAmount * cups).toFixed(ing.baseAmount % 1 === 0 ? 0 : 1)}{ing.unit}
                        </p>
                        <span dir="auto" className="text-[10px] text-slate-500">{ing.name}</span>
                      </div>
                    </div>
                    <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                      <MaterialIcon icon="shopping_cart" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ad between ingredients and steps */}
          <AdSlot slot="recipe-mid" format="horizontal" />

          {/* Steps */}
          {recipe.steps.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4">الخطوات</h3>
              <div className="flex flex-col gap-8">
                {recipe.steps.map((s) => (
                  <div key={s.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="size-8 rounded-full bg-primary text-background-dark flex items-center justify-center font-bold text-sm z-10">
                        {s.stepNumber}
                      </div>
                      <div className="w-0.5 h-full bg-primary/20 mt-1" />
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 dir="auto" className="font-bold mb-2">{s.title}</h4>
                      <p dir="auto" className="text-sm text-slate-600 mb-3 leading-relaxed">{scaleText(s.description)}</p>
                      {s.imageUrl && (
                        <div
                          className="w-full aspect-video rounded-xl bg-cover bg-center"
                          style={{ backgroundImage: `url('${s.imageUrl}')` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ad above comments */}
          <AdSlot slot="recipe-bottom" format="rectangle" />

          {/* Comments Section */}
          <div className="px-4 py-6">
            <CommentSection recipeId={id} />
          </div>
        </div>
      </main>

      {/* Add to Collection Modal */}
      {showCollectionModal && (
        <AddToCollectionModal recipeId={id} onClose={() => setShowCollectionModal(false)} />
      )}

      {/* Brew Mode */}
      {showBrewMode && recipe.steps.length > 0 && (
        <BrewMode
          steps={recipe.steps}
          brewTimeSec={totalTime}
          recipeName={recipe.title}
          onClose={() => setShowBrewMode(false)}
          onComplete={() => {
            setShowBrewMode(false);
            setShowBrewLog(true);
          }}
        />
      )}

      {/* Brew Log Modal */}
      {showBrewLog && (
        <BrewLogModal
          recipeId={recipe.id}
          recipeName={recipe.title}
          defaultParams={recipe.brewParams ? {
            grindSize: recipe.brewParams.grindSize,
            waterTemp: recipe.brewParams.temperature,
            brewTimeSec: recipe.brewParams.brewTimeSec,
            ratio: recipe.brewParams.ratio,
          } : undefined}
          onClose={() => setShowBrewLog(false)}
          onSaved={() => {
            setShowBrewLog(false);
            alert("تم تسجيل التحضير! تحقق من دفتر التحضير.");
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
