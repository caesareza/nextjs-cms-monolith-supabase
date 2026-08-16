"use client";
import { AlertCircle, KeyRound, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import StorytellerLogo from "@/components/StorytellerLogo";
import { verifyOTPCode } from "./actions";

interface VerifyPageProps {
  email: string;
}

export default function VerifyPageClient({ email }: VerifyPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await verifyOTPCode(null, formData);
      if (res && !res.success) {
        setError(res.error || "Failed to verify code.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6 relative overflow-hidden select-none font-sans">
      {/* Decorative backdrop shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-red/15 rounded-full blur-[120px] animate-float-slower pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/15 rounded-full blur-[120px] animate-float-slower pointer-events-none" />

      {/* Brand Logo & Header */}
      <div className="mb-8 flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col items-center gap-4 mb-2">
          <StorytellerLogo height={48} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-light-blue/70">
          Intelligence-Driven Content Portal
        </p>
      </div>

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-600">
        <div className="bg-brand-cream rounded-2xl p-8 shadow-[0_24px_70px_rgba(29,53,87,0.4)] border border-brand-light-blue/20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-brand-navy tracking-tight">
              2FA Verification
            </h2>
            <p className="text-xs text-brand-steel-blue font-medium mt-2 leading-relaxed">
              We sent a 6-digit security code to:
              <span className="block font-bold text-brand-navy mt-1 break-all">
                {email}
              </span>
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} className="text-brand-red shrink-0" />
              <p className="text-xs font-semibold text-brand-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-[10px] font-bold uppercase text-brand-steel-blue tracking-wider mb-2 text-center"
              >
                Verification Code
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-steel-blue/50">
                  <KeyRound size={16} />
                </span>
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  disabled={isPending}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-light-blue/30 text-brand-navy rounded-2xl text-center text-lg font-black tracking-[0.4em] focus:border-brand-steel-blue focus:ring-4 focus:ring-brand-light-blue/30 outline-none transition-all placeholder:text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-red hover:bg-brand-red/90 text-brand-cream py-4 rounded-2xl font-bold shadow-lg shadow-brand-red/20 hover:shadow-brand-red/30 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Verify and Login</span>
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            disabled={isPending}
            onClick={() => router.push("/login")}
            className="w-full text-center text-[10px] uppercase tracking-widest text-brand-steel-blue hover:text-brand-navy font-bold transition-colors cursor-pointer mt-6 disabled:opacity-50"
          >
            Back to Login
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center px-4">
          <p className="text-[10px] leading-relaxed text-brand-light-blue/50">
            Please check your spam or promotions folder if you haven't received
            the email within 2 minutes.
          </p>
        </div>
      </div>

      {/* Loading Overlay Dialog */}
      {isPending && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-brand-cream p-8 rounded-2xl shadow-[0_24px_70px_rgba(29,53,87,0.5)] border border-brand-light-blue/20 flex flex-col items-center gap-4 max-w-[320px] text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-brand-light-blue/10 rounded-2xl flex items-center justify-center border border-brand-light-blue/20">
              <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
            </div>
            <h3 className="text-brand-navy font-black text-lg tracking-tight">
              Checking Verification
            </h3>
            <p className="text-brand-steel-blue text-xs leading-relaxed font-medium">
              We are verifying your OTP security credentials and logging you
              into the CMS portal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
