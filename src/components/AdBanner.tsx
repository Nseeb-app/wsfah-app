"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string; // Google AdSense ad slot ID
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
  label?: string; // e.g. "Sponsored"
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default function AdBanner({
  slot,
  format = "auto",
  className = "",
  label = "Sponsored",
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or blocked
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mb-1 uppercase tracking-widest font-bold">
        {label}
      </p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-XXXXXXXXXXXXXXXX"}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
