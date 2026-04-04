"use client";

import { useState } from "react";

interface AdPlacement {
  id: string;
  name: string;
  slot: string;
  page: string;
  format: string;
  enabled: boolean;
}

const DEFAULT_PLACEMENTS: AdPlacement[] = [
  { id: "1", name: "Home - After Categories", slot: "home-mid", page: "Home", format: "horizontal", enabled: true },
  { id: "2", name: "Feed - Between Activities", slot: "feed-0", page: "Feed", format: "horizontal", enabled: true },
  { id: "3", name: "Explore - Top Banner", slot: "explore-top", page: "Explore", format: "horizontal", enabled: true },
  { id: "4", name: "Recipe - Between Sections", slot: "recipe-mid", page: "Recipe Detail", format: "horizontal", enabled: true },
  { id: "5", name: "Recipe - Above Comments", slot: "recipe-bottom", page: "Recipe Detail", format: "rectangle", enabled: true },
];

export default function AdminAdsPage() {
  const [placements, setPlacements] = useState(DEFAULT_PLACEMENTS);
  const [adsenseId, setAdsenseId] = useState(process.env.NEXT_PUBLIC_ADSENSE_ID || "");
  const [saved, setSaved] = useState(false);

  const togglePlacement = (id: string) => {
    setPlacements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSave = () => {
    // In production, this would save to DB/env
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enabledCount = placements.filter((p) => p.enabled).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure Google AdSense placements across the app
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">save</span>
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* AdSense Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">ads_click</span>
          Google AdSense
        </h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Publisher ID (NEXT_PUBLIC_ADSENSE_ID)
            </label>
            <input
              type="text"
              value={adsenseId}
              onChange={(e) => setAdsenseId(e.target.value)}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Set in your .env.local file as NEXT_PUBLIC_ADSENSE_ID
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">monetization_on</span>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
          <p className="text-xs text-gray-400 mt-1">Connect AdSense to see data</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">visibility</span>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Impressions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-xs text-gray-400 mt-1">Total ad impressions today</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">ads_click</span>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Slots</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{enabledCount}/{placements.length}</p>
          <p className="text-xs text-gray-400 mt-1">Ad placements enabled</p>
        </div>
      </div>

      {/* Ad-Free Tiers Info */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mt-0.5">info</span>
          <div>
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300">Ad Visibility Rules</h3>
            <ul className="text-xs text-amber-700 dark:text-amber-400 mt-2 space-y-1">
              <li><strong>Free users:</strong> See all enabled ads</li>
              <li><strong>Basic subscribers:</strong> No ads (ad-free experience)</li>
              <li><strong>Premium subscribers:</strong> No ads (ad-free experience)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ad Placements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-lg">Ad Placements</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {placements.map((placement) => (
            <div key={placement.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750">
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-lg flex items-center justify-center ${
                  placement.enabled
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}>
                  <span className={`material-symbols-outlined text-lg ${
                    placement.enabled
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400"
                  }`}>
                    {placement.format === "rectangle" ? "crop_square" : "view_day"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{placement.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {placement.page}
                    </span>
                    <span className="text-xs text-gray-400">
                      Slot: {placement.slot}
                    </span>
                    <span className="text-xs text-gray-400">
                      Format: {placement.format}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => togglePlacement(placement.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  placement.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    placement.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400">integration_instructions</span>
          Setup Guide
        </h2>
        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-3 list-decimal list-inside">
          <li>Create a Google AdSense account at <strong>adsense.google.com</strong></li>
          <li>Get your Publisher ID (starts with <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">ca-pub-</code>)</li>
          <li>Add <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXX</code> to your <strong>.env.local</strong></li>
          <li>Create ad units in AdSense and replace slot IDs in the placements above</li>
          <li>Deploy and wait for AdSense approval (usually 1-2 weeks)</li>
        </ol>
      </div>
    </div>
  );
}
