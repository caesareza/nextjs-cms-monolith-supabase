import React from 'react';

import Link from 'next/link';
import {ArrowRight, CheckCircle, Clock, User} from 'lucide-react';
import { formatAuditTimestamp } from '@/utils/date';
import {ArticleService} from "@/app/(admin)/article/service";

function PendingList({ articles }: { articles: any[] }) {
    return (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-[#EE1C25] animate-pulse" />
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">
                        Needs Approval
                    </h3>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                    {articles.length} Priority Items
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.id}`}
                        className="group flex items-center gap-8 px-10 py-6 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        {/* Title - Takes up most space */}
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#EE1C25] transition-colors">
                                {article.title}
                            </h4>
                        </div>

                        {/* Writer Info */}
                        <div className="hidden md:flex items-center gap-3 w-48">
                            <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-[#EE1C25] transition-colors">
                                <User size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase truncate">
                {article.writer?.name || 'Unassigned'}
              </span>
                        </div>

                        {/* Timestamp */}
                        <div className="hidden lg:flex items-center gap-2 w-48">
                            <Clock size={12} className="text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                {formatAuditTimestamp(article.created_at)}
              </span>
                        </div>

                        {/* Action Arrow */}
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#EE1C25] group-hover:text-white transition-all">
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}

                {articles.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                            <CheckCircle size={32} />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                            Excellent! No pending reviews.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default async function Dashboard() {
    const pendingArticles = await ArticleService.getTopPending(10);

    console.log('pendingArticles', pendingArticles)

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dashboard</h1>
                <p className="text-slate-400 font-bold text-sm mt-1">Direct access to pending editorial tasks.</p>
            </header>

            <PendingList articles={pendingArticles} />
        </div>
    );
}