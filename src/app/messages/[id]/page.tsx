"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface MessageData {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
}

interface ConversationInfo {
  messages: MessageData[];
  nextCursor: string | null;
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [otherUser, setOtherUser] = useState<{ name: string | null } | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/messages/conversations/${id}`);
    if (!res.ok) return;
    const data: ConversationInfo = await res.json();
    setMessages(data.messages.slice().reverse());

    // Determine other user from messages
    if (data.messages.length > 0 && currentUserId) {
      const other = data.messages.find((m) => m.sender.id !== currentUserId);
      if (other) setOtherUser({ name: other.sender.name });
    }
  }, [id, currentUserId]);

  // Get current user
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s?.user?.id) setCurrentUserId(s.user.id);
      });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: input.trim() }),
      });

      if (res.ok) {
        const msg: MessageData = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInput("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/messages")}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {otherUser?.name || "Conversation"}
        </h1>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.sender.id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isOwn
                    ? "bg-[#25f459] text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                {!isOwn && (
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {msg.sender.name}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? "text-gray-700" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25f459] focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-[#25f459] text-gray-900 rounded-full px-5 py-2 text-sm font-medium hover:bg-[#1de04d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
