"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import FollowButton from "@/components/FollowButton";
import CommentSection from "@/components/CommentSection";
import BottomNav from "@/components/BottomNav";

interface Post {
  id: string;
  imageUrl: string;
  mediaType: string;
  caption: string | null;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
  company: { id: string; name: string; logo: string | null } | null;
  _count: { galleryLikes: number };
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/gallery/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setLikeCount(data._count?.galleryLikes ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Fetch current user
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((data) => setCurrentUserId(data.id))
      .catch(() => {});
  }, []);

  // Fetch like status
  useEffect(() => {
    fetch(`/api/gallery/${id}/like`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.liked === "boolean") setLiked(data.liked);
      })
      .catch(() => {});
  }, [id]);

  const toggleLike = useCallback(async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    try {
      const res = await fetch(`/api/gallery/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      } else {
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/explore/${id}`;
    if (navigator.share) {
      navigator.share({ title: post?.caption || "شاهد هذا على WSFA!", url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => alert("تم نسخ الرابط!")).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MaterialIcon icon="error_outline" className="text-4xl text-red-400" />
          <p className="text-sm text-slate-500 mt-2">المنشور غير موجود</p>
          <Link href="/explore" className="text-primary text-sm font-bold mt-3 block">العودة للاستكشاف</Link>
        </div>
      </div>
    );
  }

  const displayName = post.company?.name || post.author.name || "مجهول";
  const displayAvatar = post.company?.logo || post.author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=25f459&color=fff&size=64`;
  const profileLink = post.company ? `/brand/${post.company.id}` : "#";
  const followUserId = post.author.id;
  const isOwnPost = currentUserId === post.author.id;

  return (
    <div className="bg-background-light font-display text-espresso min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 justify-between bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <Link href="/explore" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">منشور</h2>
        <button onClick={handleShare} className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="share" />
        </button>
      </header>

      <main className="flex-1 pb-24">
        {/* Author Header */}
        <div className="flex items-center gap-3 p-4">
          <Link href={profileLink} className="shrink-0">
            <img
              src={displayAvatar}
              alt={displayName}
              className="size-11 rounded-full object-cover border-2 border-primary/20"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={profileLink}>
              <p className="font-bold text-sm truncate" dir="auto">{displayName}</p>
              {post.company && (
                <div className="flex items-center gap-1">
                  <MaterialIcon icon="verified" className="text-primary text-[10px]" filled />
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">علامة تجارية</span>
                </div>
              )}
            </Link>
          </div>
          {!isOwnPost && (
            <FollowButton userId={followUserId} className="text-sm px-4 py-2" />
          )}
        </div>

        {/* Media */}
        <div className="bg-black">
          {post.mediaType === "video" ? (
            <video
              src={post.imageUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-[70vh] object-contain mx-auto"
            />
          ) : (
            <img src={post.imageUrl} alt={post.caption || ""} className="w-full max-h-[70vh] object-contain mx-auto" />
          )}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-espresso/5">
          <button
            onClick={toggleLike}
            disabled={likeBusy}
            className="flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
          >
            <MaterialIcon
              icon="favorite"
              filled={liked}
              className={`text-2xl ${liked ? "text-red-500" : "text-espresso/30"}`}
            />
            <span className="text-sm font-bold tabular-nums">{likeCount}</span>
          </button>

          <button onClick={handleShare} className="flex items-center gap-1.5 active:scale-95 transition-transform">
            <MaterialIcon icon="send" className="text-2xl text-espresso/30" />
          </button>

          <div className="ml-auto">
            <span className="text-[10px] text-espresso/40 font-medium">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed" dir="auto">
              <span className="font-bold mr-1">{displayName}</span>
              {post.caption}
            </p>
          </div>
        )}

        {/* Comments Section */}
        <div className="px-4 py-4">
          <CommentSection postId={id} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
