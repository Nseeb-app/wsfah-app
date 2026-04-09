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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-espresso/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-oat-milk">
            {open ? "close" : "menu"}
          </span>
        </button>
        <h1 className="text-lg font-bold text-oat-milk tracking-wide">
          وصفة <span className="text-primary">الإدارة</span>
        </h1>
        <Link href="/home" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-oat-milk">home</span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-64 h-screen bg-espresso flex flex-col z-50 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-extrabold text-oat-milk tracking-wide">
            وصفة <span className="text-primary">الإدارة</span>
          </h1>
          <p className="text-[10px] text-oat-milk/40 mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm shadow-primary/5"
                    : "text-oat-milk/60 hover:bg-white/5 hover:text-oat-milk"
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? "text-primary" : ""}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <Link
            href="/home"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-oat-milk/40 hover:bg-white/5 hover:text-oat-milk transition-all"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            العودة للتطبيق
          </Link>
        </div>
      </aside>
    </>
  );
}
