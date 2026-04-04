"use client";

import { logout } from "@/app/actions";
import MaterialIcon from "@/components/MaterialIcon";

export default function SignOutButton() {
  return (
    <button
      onClick={() => logout()}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
    >
      <MaterialIcon icon="logout" className="text-lg" />
      Sign Out
    </button>
  );
}
