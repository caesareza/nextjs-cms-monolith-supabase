'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, User, ArrowRight, Search, CheckCircle, Loader2 } from 'lucide-react';
import { ArticleService } from "@/app/(admin)/article/service";
import { formatAuditTimestamp } from '@/utils/date';

export default function PendingListClient() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPending = async () => {
        setLoading(true);
        try {
            const data = await ArticleService.getTopPending(10);
            setArticles(data || []);
        } catch (err) {
            console.error("Failed to fetch dashboard queue:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const filteredArticles = articles.filter(a =>
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.writer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">

            {/* HEADER CONTROLS */}
            <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-[#EE1C25] ${loading ? 'animate-ping' : 'animate-pulse'}`} />
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">
                        Needs Approval
                    </h3>
                    <span className="text-[10px] bg-red-50 text-[#EE1C25] border border-red-100 px-2 py-0.5 rounded-md font-black">
                        {filteredArticles.length} Pending
                    </span>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search queue..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-red-50 focus:border-[#EE1C25]/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* INTERACTIVE DATA ROWS */}
            {loading ? (
                <div className="p-24 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-slate-200" size={32} />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fetching latest queue...</span>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {filteredArticles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/seo-keyword/edit/${article.id}`}
                            className="group flex items-center gap-8 px-10 py-7 hover:bg-slate-50/80 transition-all cursor-pointer"
                        >
                            {/* Title Segment */}
                            <div className="flex-1 space-y-1">
                                <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#EE1C25] transition-colors leading-relaxed line-clamp-1">
                                    {article.title}
                                </h4>
                            </div>

                            {/* Writer Information */}
                            <div className="hidden md:flex items-center gap-3 w-48 shrink-0">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-[#EE1C25] transition-colors">
                                    <User size={14} />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase truncate">
                                    {article.writer?.name || 'Unassigned Writer'}
                                </span>
                            </div>

                            {/* Timestamp Track */}
                            <div className="hidden lg:flex items-center gap-2 w-48 shrink-0">
                                <Clock size={12} className="text-slate-300" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {formatAuditTimestamp(article.created_at)}
                                </span>
                            </div>

                            {/* Action Redirect Pointer Arrow */}
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#EE1C25] transition-all shrink-0">
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}

                    {/* EMPTY RESULTS STATE */}
                    {filteredArticles.length === 0 && (
                        <div className="p-24 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                <CheckCircle size={32} />
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                {searchTerm ? 'No matching pending articles' : 'All caught up! Queue is empty'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}