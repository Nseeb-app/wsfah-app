"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "لوحة التحكم", href: "/admin", icon: "dashboard" },
  { label: "المستخدمون", href: "/admin/users", icon: "group" },
  { label: "العلامات التجارية", href: "/admin/brands", icon: "storefront" },
  { label: "الوصفات", href: "/admin/recipes", icon: "restaurant_menu" },
  { label: "الإشراف", href: "/admin/moderation", icon: "shield" },
  { label: "التوثيق", href: "/admin/verification", icon: "verified" },
  { label: "التحليلات", href: "/admin/analytics", icon: "analytics" },
  { label: "الاشتراكات", href: "/admin/subscriptions", icon: "credit_card" },
  { label: "التحديات", href: "/admin/challenges", icon: "emoji_events" },
  { label: "المكافآت", href: "/admin/rewards", icon: "redeem" },
  { label: "الترويج", href: "/admin/promotions", icon: "campaign" },
  { label: "الإعلانات", href: "/admin/ads", icon: "ads_click" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
            {open ? "close" : "menu"}
          </span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          WSFA <span className="text-[#25f459]">الإدارة</span>
        </h1>
        <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">home</span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            WSFA <span className="text-[#25f459]">الإدارة</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#25f459]/10 text-[#25f459]"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            العودة للتطبيق
          </Link>
        </div>
      </aside>
    </>
  );
}
