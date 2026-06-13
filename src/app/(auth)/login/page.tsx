'use client';
import { AlertCircle } from 'lucide-react';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { login } from './actions'
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'

function OCBCLoginPage() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');

    return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
                {/* Brand Header */}
                <div className="mb-10 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#EE1C25] rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                            <ShieldCheck size={22} className="text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900">OCBC <span className="font-light">Nexus</span></span>
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Secure Personal Login</p>
                </div>

                <div className="w-full max-w-100">
                    <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Login to Dashboard</h2>

                        {errorMessage && (
                            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle size={20} className="text-[#EE1C25] shrink-0" />
                                <p className="text-xs font-bold text-[#EE1C25]">
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        <form action={login} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-2">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-red-50 outline-none"
                                    placeholder="dreas@ocbc.com"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-2">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-red-50 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#EE1C25] hover:bg-[#D71921] text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-[0.98]"
                            >
                                Sign In Securely
                            </button>
                        </form>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-8 px-4">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <span className="text-amber-600 font-bold text-[10px]">!</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-400">
                                <strong>Security Tip:</strong> Always ensure the URL in your browser starts with <span className="text-slate-600">https://nexus.ocbc.com</span>. Never share your PIN with anyone.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<>...</>}>
            <OCBCLoginPage />
        </Suspense>
    )
}