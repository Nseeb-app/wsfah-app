"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";

interface Notification {
  id: string;
  type: "LIKE" | "SAVE" | "FOLLOW" | "BADGE" | "CHALLENGE" | "SYSTEM";
  title: string;
  body: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const NOTIFICATION_ICON_MAP: Record<
  Notification["type"],
  { icon: string; color: string; bg: string }
> = {
  LIKE: { icon: "favorite", color: "text-red-500", bg: "bg-red-50" },
  SAVE: { icon: "bookmark", color: "text-blue-500", bg: "bg-blue-50" },
  FOLLOW: { icon: "person_add", color: "text-green-600", bg: "bg-green-50" },
  BADGE: { icon: "military_tech", color: "text-amber-500", bg: "bg-amber-50" },
  CHALLENGE: { icon: "emoji_events", color: "text-purple-500", bg: "bg-purple-50" },
  SYSTEM: { icon: "info", color: "text-slate-500", bg: "bg-slate-100" },
};

function relativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}y ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkAllRead() {
    setMarkingAllRead(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch {
      // Silently handle errors
    } finally {
      setMarkingAllRead(false);
    }
  }

  async function handleNotificationClick(notif: Notification) {
    if (!notif.isRead) {
      try {
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id }),
        });
        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch {
        // Silently handle errors
      }
    }

    if (notif.link) {
      router.push(notif.link);
    }
  }

  return (
    <div className="bg-background-light font-display text-espresso min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <Link
          href="/"
          className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10"
        >
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          الإشعارات
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-primary text-espresso rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        <div className="w-10" />
      </header>

      {/* Mark all as read */}
      {unreadCount > 0 && (
        <div className="px-4 pt-3 pb-1 flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <MaterialIcon icon="done_all" className="text-base" />
            {markingAllRead ? "جاري التحديد..." : "تحديد الكل كمقروء"}
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">جاري تحميل الإشعارات...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 px-8">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
              <MaterialIcon icon="notifications_none" className="text-4xl text-primary" />
            </div>
            <h3 className="text-lg font-bold text-espresso">لا توجد إشعارات بعد</h3>
            <p className="text-sm text-slate-500 text-center leading-relaxed">
              عندما يعجب أحد بوصفتك، أو يتابعك، أو تحصل على شارة، ستراها هنا.
            </p>
            <Link
              href="/"
              className="mt-2 bg-primary text-espresso font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              استكشف الوصفات
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200/60">
            {notifications.map((notif) => {
              const meta = NOTIFICATION_ICON_MAP[notif.type];

              return (
                <li key={notif.id}>
                  <button
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-4 transition-colors hover:bg-white/60 ${
                      !notif.isRead
                        ? "border-l-[3px] border-l-primary bg-primary/[0.04]"
                        : "border-l-[3px] border-l-transparent"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`size-10 rounded-full ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <MaterialIcon
                        icon={meta.icon}
                        className={`text-xl ${meta.color}`}
                        filled
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-snug ${
                            !notif.isRead ? "font-bold" : "font-semibold"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0 mt-0.5">
                          {relativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notif.isRead && (
                      <div className="size-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
