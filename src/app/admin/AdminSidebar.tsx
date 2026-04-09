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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: "#1a1410", borderBottom: "1px solid rgba(37, 244, 89, 0.1)" }}>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined" style={{ color: "#F2E8DF" }}>
            {open ? "close" : "menu"}
          </span>
        </button>
        <h1 className="text-lg font-extrabold" style={{ color: "#F2E8DF" }}>
          وصفة <span style={{ color: "#25f459" }}>الإدارة</span>
        </h1>
        <Link href="/home" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined" style={{ color: "#F2E8DF" }}>home</span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-64 h-screen flex flex-col z-50 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#1a1410" }}
      >
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: "1px solid rgba(37, 244, 89, 0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(37, 244, 89, 0.15)" }}>
              <span className="material-symbols-outlined text-xl" style={{ color: "#25f459" }}>coffee</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold" style={{ color: "#F2E8DF" }}>
                وصفة <span style={{ color: "#25f459" }}>الإدارة</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[3px]" style={{ color: "rgba(242, 232, 223, 0.3)" }}>Admin Panel</p>
            </div>
          </div>
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
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={isActive ? {
                  backgroundColor: "rgba(37, 244, 89, 0.12)",
                  color: "#25f459",
                  boxShadow: "0 0 20px rgba(37, 244, 89, 0.05)",
                } : {
                  color: "rgba(242, 232, 223, 0.5)",
                }}
              >
                <span className="material-symbols-outlined text-xl" style={isActive ? { color: "#25f459" } : {}}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(37, 244, 89, 0.08)" }}>
          <Link
            href="/home"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ color: "rgba(242, 232, 223, 0.3)" }}
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            العودة للتطبيق
          </Link>
        </div>
      </aside>
    </>
  );
}
