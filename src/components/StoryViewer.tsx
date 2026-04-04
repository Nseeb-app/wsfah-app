"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  company: { id: string; name: string; logo: string | null };
}

interface StoryViewerProps {
  stories: Story[];
  onClose: () => void;
}

export default function StoryViewer({ stories, onClose }: StoryViewerProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  const current = stories[index];

  const recordView = useCallback((storyId: string) => {
    if (viewedRef.current.has(storyId)) return;
    viewedRef.current.add(storyId);
    fetch(`/api/stories/${storyId}/view`, { method: "POST" }).catch(() => {});
  }, []);

  const goNext = useCallback(() => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [index, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setProgress(0);
    }
  }, [index]);

  // Auto-advance timer (5 seconds)
  useEffect(() => {
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);

    const interval = 50; // 50ms ticks
    const totalTicks = 5000 / interval; // 100 ticks for 5 seconds
    let tick = 0;

    timerRef.current = setInterval(() => {
      tick++;
      setProgress((tick / totalTicks) * 100);
      if (tick >= totalTicks) {
        goNext();
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, goNext]);

  // Record view on story change
  useEffect(() => {
    if (current) recordView(current.id);
  }, [current, recordView]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      goPrev();
    } else {
      goNext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3 pb-2">
        {stories.map((s, i) => (
          <div
            key={s.id}
            className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden"
          >
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{
                width:
                  i < index
                    ? "100%"
                    : i === index
                    ? `${progress}%`
                    : "0%",
                transition: i === index ? "width 50ms linear" : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          {current.company.logo ? (
            <img
              src={current.company.logo}
              alt={current.company.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {current.company.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-white text-sm font-semibold">
            {current.company.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white text-2xl leading-none p-2 hover:opacity-70 transition-opacity"
          aria-label="إغلاق"
        >
          &times;
        </button>
      </div>

      {/* Media area */}
      <div className="flex-1 relative cursor-pointer" onClick={handleTap}>
        {current.mediaType === "video" ? (
          <video
            key={current.id}
            src={current.mediaUrl}
            className="absolute inset-0 w-full h-full object-contain"
            autoPlay
            muted
            playsInline
          />
        ) : (
          <img
            key={current.id}
            src={current.mediaUrl}
            alt={current.caption || "قصة"}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* Caption */}
        {current.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-sm">{current.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
