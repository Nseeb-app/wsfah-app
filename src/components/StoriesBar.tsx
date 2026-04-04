"use client";

import { useState, useEffect } from "react";
import StoryViewer from "@/components/StoryViewer";

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  companyId: string;
  company: { id: string; name: string; logo: string | null };
}

interface CompanyGroup {
  company: { id: string; name: string; logo: string | null };
  stories: Story[];
}

export default function StoriesBar() {
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [activeStories, setActiveStories] = useState<Story[] | null>(null);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => setGroups(data))
      .catch(() => {});
  }, []);

  if (groups.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto px-4 py-3 scrollbar-hide">
        {groups.map((group) => (
          <button
            key={group.company.id}
            onClick={() => setActiveStories(group.stories)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-tr from-[#25f459] to-[#25f459]/60">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-[2px]">
                {group.company.logo ? (
                  <img
                    src={group.company.logo}
                    alt={group.company.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                    {group.company.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 max-w-[64px] truncate">
              {group.company.name}
            </span>
          </button>
        ))}
      </div>

      {activeStories && (
        <StoryViewer
          stories={activeStories}
          onClose={() => setActiveStories(null)}
        />
      )}
    </>
  );
}
