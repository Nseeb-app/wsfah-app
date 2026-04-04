"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  creatorId: string;
  creator: { id: string; name: string | null; image: string | null };
  _count: { members: number };
  posts: PostData[];
}

interface PostData {
  id: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postBody, setPostBody] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchGroup = useCallback(async () => {
    const res = await fetch(`/api/groups/${id}`);
    if (res.ok) {
      const data: GroupDetail = await res.json();
      setGroup(data);
      setPosts(data.posts);
    }
    setLoading(false);
  }, [id]);

  const fetchPosts = useCallback(async () => {
    const res = await fetch(`/api/groups/${id}/posts`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
  }, [id]);

  const checkMembership = useCallback(async () => {
    // Try to post an empty check - we'll determine membership from the group API
    // For now, we optimistically check via a member join attempt
    // A cleaner approach: just try joining and handle 409
    const res = await fetch(`/api/groups/${id}/members`, { method: "POST" });
    if (res.status === 409) {
      setIsMember(true);
    } else if (res.ok) {
      // Just joined
      setIsMember(true);
      fetchGroup();
    }
  }, [id, fetchGroup]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  async function handleJoin() {
    const res = await fetch(`/api/groups/${id}/members`, { method: "POST" });
    if (res.ok || res.status === 409) {
      setIsMember(true);
      fetchGroup();
    }
  }

  async function handleLeave() {
    const res = await fetch(`/api/groups/${id}/members`, { method: "DELETE" });
    if (res.ok) {
      setIsMember(false);
      fetchGroup();
    }
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!postBody.trim() || posting) return;
    setPosting(true);
    const res = await fetch(`/api/groups/${id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: postBody.trim() }),
    });
    if (res.ok) {
      setPostBody("");
      fetchPosts();
    } else if (res.status === 403) {
      // Not a member - attempt join
      await handleJoin();
    }
    setPosting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">المجموعة غير موجودة.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{group.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {group._count.members} {group._count.members === 1 ? "عضو" : "أعضاء"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              أنشأها {group.creator.name || "غير معروف"}
            </span>
          </div>
          <div className="mt-4">
            {isMember ? (
              <button
                onClick={handleLeave}
                className="border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition-colors"
              >
                مغادرة المجموعة
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="bg-[#25f459] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1de04d] transition-colors"
              >
                انضم للمجموعة
              </button>
            )}
          </div>
        </div>

        {/* Post composer */}
        {isMember && (
          <form onSubmit={handlePost} className="mb-6">
            <textarea
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="اكتب شيئاً للمجموعة..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459] resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={!postBody.trim() || posting}
              className="mt-2 bg-[#25f459] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1de04d] disabled:opacity-50 transition-colors"
            >
              {posting ? "جاري النشر..." : "نشر"}
            </button>
          </form>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              لا توجد منشورات بعد. كن أول من يشارك شيئاً!
            </p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  {post.author.image ? (
                    <img
                      src={post.author.image}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-semibold">
                      {post.author.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.author.name || "غير معروف"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                  {post.body}
                </p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="mt-3 rounded-lg max-h-96 object-cover"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
