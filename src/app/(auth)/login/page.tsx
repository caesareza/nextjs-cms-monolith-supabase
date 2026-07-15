"use client";
import { AlertCircle, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useTransition } from "react";
import { login } from "./actions";

function PosthinksLoginPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await login(formData);
    });
  };

  return (
    <div className="relative min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
      {/* Background floating gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-light-blue/20 rounded-full blur-[120px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/15 rounded-full blur-[120px] animate-float-slower pointer-events-none" />

      {/* Brand Logo & Header */}
      <div className="mb-8 flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-red/30 border border-brand-red/20">
            <svg
              className="w-10 h-10 text-brand-cream"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Posthinks Logo"
            >
              <rect
                x="15"
                y="15"
                width="70"
                height="70"
                rx="20"
                fill="currentColor"
              />
              <rect
                x="30"
                y="30"
                width="40"
                height="30"
                rx="8"
                fill="#1D3557"
              />
              <path d="M35 55L32 63L43 59" fill="#1D3557" />
            </svg>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-brand-cream">
            Post<span className="text-brand-red font-light">hinks</span>
            <span className="text-[10px] font-bold uppercase px-2 py-1 bg-brand-light-blue/20 text-brand-light-blue rounded-md ml-2 align-middle border border-brand-light-blue/10">
              CMS
            </span>
          </span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-light-blue/70">
          Intelligence-Driven Content Portal
        </p>
      </div>

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-600">
        <div className="bg-brand-cream rounded-[2.5rem] p-8 shadow-[0_24px_70px_rgba(29,53,87,0.4)] border border-brand-light-blue/20">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-brand-navy tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-brand-steel-blue font-medium mt-1">
              Please log in to manage your publication workflow.
            </p>
          </div>

          {errorMessage && !isPending && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} className="text-brand-red shrink-0" />
              <p className="text-xs font-semibold text-brand-red">
                {errorMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase text-brand-steel-blue tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-steel-blue/50">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isPending}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-light-blue/30 text-brand-navy rounded-2xl text-sm focus:border-brand-steel-blue focus:ring-4 focus:ring-brand-light-blue/30 outline-none transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="editor@posthinks.biz.id"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase text-brand-steel-blue tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-steel-blue/50">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isPending}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-light-blue/30 text-brand-navy rounded-2xl text-sm focus:border-brand-steel-blue focus:ring-4 focus:ring-brand-light-blue/30 outline-none transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="••••••••"
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
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Sign In Securely</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center px-4">
          <p className="text-[10px] leading-relaxed text-brand-light-blue/50">
            <strong>Security Note:</strong> Always verify that you are accessing{" "}
            <span className="text-brand-light-blue/80 font-medium">
              https://cms-article.posthinks.biz.id
            </span>{" "}
            before signing in.
          </p>
        </div>
      </div>

      {/* Loading Overlay Dialog */}
      {isPending && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-brand-cream p-8 rounded-[2.5rem] shadow-[0_24px_70px_rgba(29,53,87,0.5)] border border-brand-light-blue/20 flex flex-col items-center gap-4 max-w-[320px] text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-brand-light-blue/10 rounded-2xl flex items-center justify-center border border-brand-light-blue/20">
              <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
            </div>
            <h3 className="text-brand-navy font-black text-lg tracking-tight">
              Authenticating
            </h3>
            <p className="text-brand-steel-blue text-xs leading-relaxed font-medium">
              Please wait while we verify your credentials and establish a
              secure session.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-navy flex items-center justify-center text-brand-cream">
          ...
        </div>
      }
    >
      <PosthinksLoginPage />
    </Suspense>
  );
}
