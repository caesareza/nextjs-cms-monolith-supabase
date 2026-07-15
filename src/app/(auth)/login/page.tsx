'use client';
import { AlertCircle, Lock, Mail, Sparkles } from 'lucide-react';
import React from 'react';
import { login } from './actions'
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'

function PosthinksLoginPage() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');

    return (
        <div className="relative min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
            {/* Background floating gradient blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-light-blue/20 rounded-full blur-[120px] animate-float-slow pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/15 rounded-full blur-[120px] animate-float-slower pointer-events-none" />
            
            {/* Brand Logo & Header */}
            <div className="mb-8 flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col items-center gap-3 mb-2">
                    <div className="w-16 h-16 bg-brand-cream/10 rounded-2xl flex items-center justify-center shadow-2xl border border-brand-light-blue/20 backdrop-blur-md">
                        <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100">
                                    <stop offset="0%" stopColor="#E63946" />
                                    <stop offset="100%" stopColor="#457B9D" />
                                </linearGradient>
                            </defs>
                            <rect x="15" y="15" width="70" height="70" rx="20" fill="url(#logoGrad)" />
                            <rect x="30" y="30" width="40" height="30" rx="8" fill="#F1FAEE" />
                            <path d="M35 55L32 63L43 59" fill="#F1FAEE" />
                            <circle cx="50" cy="45" r="4" fill="#E63946" />
                            <circle cx="60" cy="45" r="3" fill="#1D3557" />
                            <circle cx="40" cy="45" r="3" fill="#1D3557" />
                            <line x1="43" y1="45" x2="47" y2="45" stroke="#1D3557" strokeWidth="1" />
                            <line x1="53" y1="45" x2="57" y2="45" stroke="#1D3557" strokeWidth="1" />
                        </svg>
                    </div>
                    <span className="text-3xl font-extrabold tracking-tight text-brand-cream">
                        Post<span className="text-brand-red font-light">hinks</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-brand-light-blue/20 text-brand-light-blue rounded-md ml-2 align-middle border border-brand-light-blue/10">CMS</span>
                    </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-light-blue/70">Intelligence-Driven Content Portal</p>
            </div>

            <div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-600">
                <div className="bg-brand-cream rounded-[2.5rem] p-8 shadow-[0_24px_70px_rgba(29,53,87,0.4)] border border-brand-light-blue/20">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-brand-navy tracking-tight">Welcome back</h2>
                        <p className="text-xs text-brand-steel-blue font-medium mt-1">Please log in to manage your publication workflow.</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 flex items-center gap-3 p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle size={20} className="text-brand-red shrink-0" />
                            <p className="text-xs font-semibold text-brand-red">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    <form action={login} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-brand-steel-blue tracking-wider mb-2">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-steel-blue/50">
                                    <Mail size={16} />
                                </span>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-light-blue/30 text-brand-navy rounded-2xl text-sm focus:border-brand-steel-blue focus:ring-4 focus:ring-brand-light-blue/30 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="editor@posthinks.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-brand-steel-blue tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-steel-blue/50">
                                    <Lock size={16} />
                                </span>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-light-blue/30 text-brand-navy rounded-2xl text-sm focus:border-brand-steel-blue focus:ring-4 focus:ring-brand-light-blue/30 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-brand-red hover:bg-brand-red/90 text-brand-cream py-4 rounded-2xl font-bold shadow-lg shadow-brand-red/20 hover:shadow-brand-red/30 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Sparkles size={16} />
                            <span>Sign In Securely</span>
                        </button>
                    </form>
                </div>

                {/* Security Notice */}
                <div className="mt-8 text-center px-4">
                    <p className="text-[10px] leading-relaxed text-brand-light-blue/50">
                        <strong>Security Note:</strong> Always verify that you are accessing <span className="text-brand-light-blue/80 font-medium">https://cms.posthinks.com</span> before signing in.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-brand-navy flex items-center justify-center text-brand-cream">...</div>}>
            <PosthinksLoginPage />
        </Suspense>
    )
}