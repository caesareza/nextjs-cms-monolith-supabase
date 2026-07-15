"use client";

import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/(auth)/login/actions";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err: any) {
      // 1. Check if the error is actually just Next.js trying to redirect
      // Next.js internal redirect errors contain the string 'NEXT_REDIRECT'
      if (
        err?.message?.includes("NEXT_REDIRECT") ||
        err?.digest?.includes("NEXT_REDIRECT")
      ) {
        return; // Do nothing, let Next.js do its job!
      }

      // 2. This is an actual, genuine error
      console.error("Failed to trigger server logout:", err);
      alert("Failed to securely log out. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      type="button"
      className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-semibold text-slate-500 hover:bg-brand-red/10 hover:text-brand-red active:scale-[0.98] disabled:opacity-50 transition-all duration-200 cursor-pointer group"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-brand-red" />
      ) : (
        <LogOut
          size={18}
          className="text-slate-400 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all duration-200"
        />
      )}
      <span>{loading ? "Signing Out..." : "Log Out"}</span>
    </button>
  );
}
