"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MaterialIcon from "./MaterialIcon";

const navItems = [
  { href: "/home", icon: "home", label: "Home" },
  { href: "/search", icon: "search", label: "Search" },
  { href: "/create", icon: "add", label: "Create", isFab: true },
  { href: "/rewards", icon: "workspace_premium", label: "Rewards" },
  { href: "/explore", icon: "explore", label: "Explore" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-espresso/5 px-6 pt-3 pb-8 flex items-center justify-around z-40">
      {navItems.map((item) => {
        if (item.isFab) {
          return (
            <Link key={item.href} href={item.href} className="relative -mt-12">
              <div className="size-16 rounded-full bg-primary text-espresso shadow-xl shadow-primary/20 flex items-center justify-center active:scale-90 transition-transform">
                <MaterialIcon icon={item.icon} className="text-3xl font-bold" />
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-primary">
                {item.label}
              </span>
            </Link>
          );
        }

        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${active ? "text-primary" : "text-espresso/40"}`}
          >
            <MaterialIcon icon={item.icon} filled={active} className="text-2xl" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
