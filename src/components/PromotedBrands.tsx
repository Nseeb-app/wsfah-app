"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

interface Promotion {
  id: string;
  placement: string;
  message: string | null;
  imageUrl: string | null;
  company: {
    id: string;
    name: string;
    logo: string | null;
    type: string;
    description: string | null;
  };
}

interface PromotedBrandsProps {
  placement: "HOME_TOP" | "EXPLORE_TOP";
}

export default function PromotedBrands({ placement }: PromotedBrandsProps) {
  const [promos, setPromos] = useState<Promotion[]>([]);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((data: Promotion[]) => {
        const filtered = data.filter(
          (p) => p.placement === placement || p.placement === "BOTH"
        );
        setPromos(filtered);
      })
      .catch(() => {});
  }, [placement]);

  if (promos.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <MaterialIcon icon="campaign" className="text-amber-500 text-lg" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Sponsored
        </h3>
      </div>
      <div className="flex overflow-x-auto gap-3 no-scrollbar -mx-2 px-2">
        {promos.map((p) => (
          <Link
            key={p.id}
            href={`/brand/${p.company.id}`}
            className="shrink-0 w-72 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
          >
            {p.imageUrl ? (
              <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url('${p.imageUrl}')` }} />
            ) : (
              <div className="h-28 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <img
                  src={p.company.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.company.name)}&background=f59e0b&color=fff&size=80`}
                  alt={p.company.name}
                  className="size-16 rounded-full border-3 border-white/30 object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                {!p.imageUrl && p.company.logo && (
                  <img src={p.company.logo} alt="" className="size-6 rounded-full object-cover" />
                )}
                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" dir="auto">
                  {p.company.name}
                </h4>
                <span className="bg-amber-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded ml-auto">
                  AD
                </span>
              </div>
              {p.company.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1" dir="auto">
                  {p.company.description}
                </p>
              )}
              {p.message && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 italic line-clamp-1">
                  {p.message}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
