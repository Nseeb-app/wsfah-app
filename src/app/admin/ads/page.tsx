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
  { id: "1", name: "الرئيسية - بعد الأقسام", slot: "home-mid", page: "الرئيسية", format: "horizontal", enabled: true },
  { id: "2", name: "التغذية - بين الأنشطة", slot: "feed-0", page: "التغذية", format: "horizontal", enabled: true },
  { id: "3", name: "الاستكشاف - بانر علوي", slot: "explore-top", page: "الاستكشاف", format: "horizontal", enabled: true },
  { id: "4", name: "الوصفة - بين الأقسام", slot: "recipe-mid", page: "تفاصيل الوصفة", format: "horizontal", enabled: true },
  { id: "5", name: "الوصفة - فوق التعليقات", slot: "recipe-bottom", page: "تفاصيل الوصفة", format: "rectangle", enabled: true },
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
          <h1 className="text-2xl font-bold text-espresso dark:text-oat-milk">إدارة الإعلانات</h1>
          <p className="text-sm text-espresso/40 dark:text-oat-milk/40 mt-1">
            إعداد مواضع Google AdSense في التطبيق
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">save</span>
          {saved ? "تم الحفظ!" : "حفظ التغييرات"}
        </button>
      </div>

      {/* AdSense Configuration */}
      <div className="bg-white dark:bg-[#1a2420] rounded-2xl border border-espresso/5 dark:border-white/5 p-6 mb-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">ads_click</span>
          Google AdSense
        </h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-[#F2E8DFcc] mb-1">
              معرّف الناشر (NEXT_PUBLIC_ADSENSE_ID)
            </label>
            <input
              type="text"
              value={adsenseId}
              onChange={(e) => setAdsenseId(e.target.value)}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-lg border border-espresso/10 dark:border-white/10 bg-white dark:bg-[#1a2420] text-sm"
            />
            <p className="text-xs text-[#F2E8DF50] mt-1">
              قم بتعيينه في ملف .env.local باسم NEXT_PUBLIC_ADSENSE_ID
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1a2420] rounded-2xl border border-espresso/5 dark:border-white/5 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">monetization_on</span>
            </div>
            <span className="text-sm font-medium text-espresso/40 dark:text-oat-milk/40">الإيرادات المقدرة</span>
          </div>
          <p className="text-2xl font-bold text-espresso dark:text-oat-milk">$0.00</p>
          <p className="text-xs text-[#F2E8DF50] mt-1">اربط AdSense لرؤية البيانات</p>
        </div>
        <div className="bg-white dark:bg-[#1a2420] rounded-2xl border border-espresso/5 dark:border-white/5 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">visibility</span>
            </div>
            <span className="text-sm font-medium text-espresso/40 dark:text-oat-milk/40">مرات الظهور</span>
          </div>
          <p className="text-2xl font-bold text-espresso dark:text-oat-milk">0</p>
          <p className="text-xs text-[#F2E8DF50] mt-1">إجمالي مرات ظهور الإعلانات اليوم</p>
        </div>
        <div className="bg-white dark:bg-[#1a2420] rounded-2xl border border-espresso/5 dark:border-white/5 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">ads_click</span>
            </div>
            <span className="text-sm font-medium text-espresso/40 dark:text-oat-milk/40">المواضع النشطة</span>
          </div>
          <p className="text-2xl font-bold text-espresso dark:text-oat-milk">{enabledCount}/{placements.length}</p>
          <p className="text-xs text-[#F2E8DF50] mt-1">مواضع الإعلانات المفعّلة</p>
        </div>
      </div>

      {/* Ad-Free Tiers Info */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mt-0.5">info</span>
          <div>
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300">قواعد ظهور الإعلانات</h3>
            <ul className="text-xs text-amber-700 dark:text-amber-400 mt-2 space-y-1">
              <li><strong>المستخدمون المجانيون:</strong> يرون جميع الإعلانات المفعّلة</li>
              <li><strong>مشتركو الخطة الأساسية:</strong> بدون إعلانات (تجربة خالية من الإعلانات)</li>
              <li><strong>مشتركو الخطة المميزة:</strong> بدون إعلانات (تجربة خالية من الإعلانات)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ad Placements */}
      <div className="bg-white dark:bg-[#1a2420] rounded-2xl border border-espresso/5 dark:border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-espresso/5 dark:border-white/5">
          <h2 className="font-bold text-lg">مواضع الإعلانات</h2>
        </div>
        <div className="divide-y divide-[#F2E8DF08]">
          {placements.map((placement) => (
            <div key={placement.id} className="flex items-center justify-between px-6 py-4 hover:bg-espresso/[0.02] dark:hover:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-lg flex items-center justify-center ${
                  placement.enabled
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-espresso/5 dark:bg-white/5"
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
                  <p className="font-semibold text-sm text-espresso dark:text-oat-milk">{placement.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 bg-espresso/5 dark:bg-white/5 px-2 py-0.5 rounded">
                      {placement.page}
                    </span>
                    <span className="text-xs text-[#F2E8DF60]">
                      الموضع: {placement.slot}
                    </span>
                    <span className="text-xs text-[#F2E8DF60]">
                      الشكل: {placement.format}
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
      <div className="bg-white dark:bg-[#1a2420] rounded-2xl border border-espresso/5 dark:border-white/5 p-6 mt-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F2E8DF60]">integration_instructions</span>
          دليل الإعداد
        </h2>
        <ol className="text-sm text-espresso/60 dark:text-oat-milk/60 space-y-3 list-decimal list-inside">
          <li>أنشئ حساب Google AdSense على <strong>adsense.google.com</strong></li>
          <li>احصل على معرّف الناشر (يبدأ بـ <code className="bg-espresso/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-xs">ca-pub-</code>)</li>
          <li>أضف <code className="bg-espresso/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXX</code> إلى ملف <strong>.env.local</strong></li>
          <li>أنشئ وحدات إعلانية في AdSense واستبدل معرّفات المواضع أعلاه</li>
          <li>انشر التطبيق وانتظر موافقة AdSense (عادة 1-2 أسبوع)</li>
        </ol>
      </div>
    </div>
  );
}
