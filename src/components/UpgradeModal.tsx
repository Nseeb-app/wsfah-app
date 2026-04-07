"use client";

import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";

interface UpgradeModalProps {
  open: boolean;
  feature?: string;
  onClose: () => void;
}

export default function UpgradeModal({ open, feature, onClose }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-espresso rounded-2xl w-full max-w-sm p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center">
          <MaterialIcon icon="workspace_premium" className="text-brand-gold text-3xl" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-espresso dark:text-oat-milk mb-2">
          لقد وصلت للحد الأقصى
        </h2>

        {/* Description */}
        <p className="text-sm text-espresso/60 dark:text-oat-milk/60 mb-6">
          {feature
            ? `قم بالترقية للحصول على ${feature}`
            : "قم بالترقية لفتح المزيد من المميزات"}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="w-full py-3 rounded-xl bg-primary text-espresso font-bold text-sm hover:bg-primary/90 transition-colors block"
          >
            عرض الخطط
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-espresso/10 dark:border-oat-milk/10 text-espresso/60 dark:text-oat-milk/60 text-sm font-medium hover:bg-espresso/5 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
