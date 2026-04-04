"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
  replies: Comment[];
}

interface CommentSectionProps {
  recipeId?: string;
  postId?: string;
}

export default function CommentSection({ recipeId, postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [newComment, setNewComment] = useState("");

  const endpoint = recipeId ? `/api/recipes/${recipeId}/comments` : `/api/gallery/${postId}/comments`;

  const fetchComments = async (cursor?: string) => {
    try {
      setLoading(true);
      const url = cursor ? `${endpoint}?cursor=${cursor}` : endpoint;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      if (cursor) {
        setComments((prev) => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [recipeId, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user?.id) return;

    try {
      setSubmitting(true);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment, parentId: replyingTo || null }),
      });
      if (!res.ok) throw new Error("Failed to create comment");
      const newCommentData = await res.json();
      if (replyingTo) {
        // Add reply to parent comment
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo
              ? { ...c, replies: [...c.replies, newCommentData] }
              : c
          )
        );
      } else {
        // Add new top-level comment at the beginning
        setComments((prev) => [newCommentData, ...prev]);
      }
      setNewComment("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editBody.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody }),
      });
      if (!res.ok) throw new Error("Failed to update comment");
      const updatedComment = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, ...updatedComment }
            : {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, ...updatedComment } : r
                ),
              }
        )
      );
      setEditingId(null);
      setEditBody("");
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      setComments((prev) =>
        prev.filter((c) => c.id !== commentId && !c.replies.some((r) => r.id === commentId))
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} د`;
    if (diffHours < 24) return `منذ ${diffHours} س`;
    if (diffDays < 7) return `منذ ${diffDays} ي`;
    return date.toLocaleDateString("ar");
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwnComment = comment.author.id === session?.user?.id;
    const isEditing = editingId === comment.id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? "ml-12 mt-3" : "mt-4"} bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {comment.author.image ? (
              <img
                src={comment.author.image}
                alt={comment.author.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {comment.author.name?.charAt(0) || "?"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {comment.author.name || "مجهول"}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  disabled={submitting}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(comment.id)}
                    disabled={submitting || !editBody.trim()}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditBody("");
                    }}
                    disabled={submitting}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 break-words">{comment.body}</p>
            )}
            {!isEditing && (
              <div className="flex gap-3 mt-2">
                {!isReply && (
                  <button
                    onClick={() => {
                      setReplyingTo(comment.id);
                      setNewComment("");
                    }}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    رد
                  </button>
                )}
                {isOwnComment && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditBody(comment.body);
                      }}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      حذف
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        التعليقات ({comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)})
      </h2>

      {session?.user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {session.user.name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyingTo
                    ? "اكتب رداً..."
                    : "اكتب تعليقاً..."
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-2">
                {replyingTo && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setNewComment("");
                    }}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    إلغاء الرد
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "جارٍ النشر..." : "نشر التعليق"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {!session?.user && (
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          يرجى{" "}
          <a href="/login" className="text-green-600 dark:text-green-400 hover:underline">
            تسجيل الدخول
          </a>{" "}
          لكتابة تعليق.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => renderComment(comment))}
      </div>

      {loading && <p className="text-center text-gray-500 dark:text-gray-400 mt-4">جارٍ التحميل...</p>}

      {nextCursor && !loading && (
        <button
          onClick={() => fetchComments(nextCursor!)}
          className="mt-4 w-full py-2 text-center text-green-600 dark:text-green-400 hover:underline"
        >
          تحميل المزيد من التعليقات
        </button>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          لا توجد تعليقات بعد. كن أول من يعلق!
        </p>
      )}
    </div>
  );
}
