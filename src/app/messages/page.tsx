"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  updatedAt: string;
  otherUser: { id: string; name: string | null; image: string | null } | null;
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    sender: { id: string; name: string | null };
  } | null;
  lastReadAt: string | null;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/messages/conversations")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
      })
      .finally(() => setLoading(false));
  }, []);

  function isUnread(c: Conversation) {
    if (!c.lastMessage || !c.lastReadAt) return !!c.lastMessage;
    return new Date(c.lastMessage.createdAt) > new Date(c.lastReadAt);
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Messages
        </h1>

        {conversations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            No conversations yet.
          </p>
        ) : (
          <div className="space-y-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/messages/${c.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {c.otherUser?.image ? (
                    <img
                      src={c.otherUser.image}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold text-lg">
                      {c.otherUser?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  {isUnread(c) && (
                    <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#25f459] border-2 border-white dark:border-gray-950" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium truncate ${
                        isUnread(c)
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {c.otherUser?.name || "Unknown"}
                    </span>
                    {c.lastMessage && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {c.lastMessage && (
                    <p
                      className={`text-sm truncate ${
                        isUnread(c)
                          ? "text-gray-800 dark:text-gray-200 font-medium"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {c.lastMessage.body}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
