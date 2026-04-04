"use client";

import { useState, useEffect } from "react";
import MaterialIcon from "./MaterialIcon";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read actual state from DOM (set by inline script in <head>)
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("wsfa-dark", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("wsfa-dark", "false");
    }
  };

  // Prevent hydration mismatch - show neutral state until mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <MaterialIcon icon="light_mode" className="text-xl" />
          <span className="text-sm font-medium">الوضع الداكن</span>
        </div>
        <div className="w-11 h-6 rounded-full bg-slate-300 relative">
          <div className="absolute top-0.5 size-5 rounded-full shadow translate-x-0.5 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex items-center gap-3">
        <MaterialIcon icon={dark ? "dark_mode" : "light_mode"} className="text-xl" />
        <span className="text-sm font-medium">الوضع الداكن</span>
      </div>
      <div className={`w-11 h-6 rounded-full relative transition-colors ${dark ? "bg-primary" : "bg-slate-300"}`}>
        <div className={`absolute top-0.5 size-5 rounded-full shadow transition-transform ${dark ? "translate-x-5 bg-slate-900" : "translate-x-0.5 bg-white"}`} />
      </div>
    </button>
  );
}
