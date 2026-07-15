'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
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
            if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
                return; // Do nothing, let Next.js do its job!
            }

            // 2. This is an actual, genuine error
            console.error('Failed to trigger server logout:', err);
            alert('Failed to securely log out. Please try again.');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-3 px-6 py-4 w-full rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 active:scale-[0.98] disabled:opacity-50 transition-all duration-200 cursor-pointer group"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin text-brand-accent" />
            ) : (
                <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            )}
            <span>{loading ? 'Signing Out...' : 'Log Out'}</span>
        </button>
    );
}