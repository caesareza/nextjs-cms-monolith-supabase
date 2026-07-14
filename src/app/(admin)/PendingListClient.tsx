'use client';

import { useState, useEffect } from 'react';
import { Clock, User, ChevronDown, ChevronUp, Search, CheckCircle, Loader2, AlertTriangle, Flame, ShieldCheck, HelpCircle } from 'lucide-react';
import { ArticleService } from "@/app/(admin)/article/service";
import { formatAuditTimestamp } from '@/utils/date';

export default function PendingListClient() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Inline Expansion & Workflow Tracking States ---
    const [expandedArticleId, setExpandedArticleId] = useState<number | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [showRejectModalId, setShowRejectModalId] = useState<number | null>(null);
    const [internalNote, setInternalNote] = useState('');

    const fetchPending = async () => {
        setLoading(true);
        try {
            // Pull prioritised queue (Oldest First)
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

    // --- DECISION GATE ACTIONS ---

    // 1. Inline Approval Handler
    const handleInlineApprove = async (article: any) => {
        setActionLoadingId(article.id);
        try {
            await ArticleService.updateWorkflow({
                id: String(article.id),
                status: 'writing',
                approval: 'approved',
                oldStatus: article.status || 'seo pending',
                oldApproval: 'pending'
            });
            // Instantly slice out from view layout state
            setArticles(prev => prev.filter(a => a.id !== article.id));
            if (expandedArticleId === article.id) setExpandedArticleId(null);
        } catch (err) {
            console.error(err);
            alert('Encountered an issue processing approval workflow state changes.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // 2. Inline Rejection Confirmation Dispatch
    const handleInlineRejectSubmit = async (e: React.FormEvent, article: any) => {
        e.preventDefault();
        if (!internalNote.trim() || !showRejectModalId) return;

        setActionLoadingId(article.id);
        setShowRejectModalId(null);
        try {
            await ArticleService.updateWorkflow({
                id: String(article.id),
                status: 'seo pending',
                approval: 'rejected',
                oldStatus: article.status || 'seo pending',
                oldApproval: 'pending',
                internal_notes: internalNote
            });
            // Instantly slice out from view layout state
            setArticles(prev => prev.filter(a => a.id !== article.id));
            if (expandedArticleId === article.id) setExpandedArticleId(null);
            setInternalNote('');
        } catch (err) {
            console.error(err);
            alert('Encountered an issue processing rejection workflow notes.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const toggleExpandTray = (id: number) => {
        setExpandedArticleId(expandedArticleId === id ? null : id);
    };

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

            {/* INTERACTIVE DATA REVIEWS */}
            {loading ? (
                <div className="p-24 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-slate-200" size={32} />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fetching latest queue...</span>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {filteredArticles.map((article) => {
                        const isExpanded = expandedArticleId === article.id;
                        const isActionBusy = actionLoadingId === article.id;

                        return (
                            <div key={article.id} className="flex flex-col transition-all">

                                {/* MASTER LINE ROW */}
                                <div
                                    onClick={() => toggleExpandTray(article.id)}
                                    className={`group flex items-center gap-8 px-10 py-7 transition-all cursor-pointer select-none ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/80'}`}
                                >
                                    {/* Title Segment */}
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#EE1C25] transition-colors leading-relaxed line-clamp-1">
                                            {article.title}
                                        </h4>
                                    </div>

                                    {/* Writer Track */}
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

                                    {/* Toggle Action Control Icon */}
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>

                                {/* CONTEXTUAL DETAIL REVIEW TRAY BLOCK */}
                                {isExpanded && (
                                    <div className="px-10 pb-8 pt-2 bg-slate-50/40 border-y border-slate-100 flex flex-col space-y-6 animate-in slide-in-from-top-2 duration-200">

                                        {/* Row 1: Triple Metrics Overview Context */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 border border-slate-200/60 rounded-2xl flex items-center gap-3">
                                                <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl"><Flame size={16}/></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Search Demand</p>
                                                    <p className="text-sm font-black text-slate-800 tabular-nums">{(article.demand || 0).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 border border-slate-200/60 rounded-2xl flex items-center gap-3">
                                                <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl"><HelpCircle size={16}/></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Search Intent</p>
                                                    <p className="text-xs font-black text-slate-700">{article.intent || 'Informational'}</p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 border border-slate-200/60 rounded-2xl flex items-center gap-3">
                                                <div className="p-2.5 bg-red-50 text-[#EE1C25] rounded-xl"><ShieldCheck size={16}/></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Classification</p>
                                                    <p className="text-xs font-black text-slate-700">{article.classification || 'Infantry'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Deep Intent Keyword Copy Deck Data */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1 bg-white p-4 border border-slate-200/60 rounded-2xl">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Target Focus Keyword</span>
                                                <p className="text-xs font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 mt-1">{article.target_keyword || '—'}</p>
                                            </div>

                                            <div className="space-y-1 bg-white p-4 border border-slate-200/60 rounded-2xl">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Meta Description Snippet</span>
                                                <p className="text-xs font-medium text-slate-600 leading-relaxed mt-1">{article.meta_description || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Row 3: Live Decision Trigger Toolbar */}
                                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                                            <button
                                                disabled={isActionBusy}
                                                onClick={() => setShowRejectModalId(article.id)}
                                                className="px-5 py-2.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                                            >
                                                <AlertTriangle size={14} /> Request Revision
                                            </button>

                                            <button
                                                disabled={isActionBusy}
                                                onClick={() => handleInlineApprove(article)}
                                                className="px-6 py-2.5 bg-[#EE1C25] hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                                            >
                                                {isActionBusy ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" /> Authorizing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={14} /> Approve Strategy
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                    </div>
                                )}

                                {/* INDEPENDENT FLOATING INLINE OVERLAY FOR ENTRY LEVEL REJECTIONS */}
                                {showRejectModalId === article.id && (
                                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                                            <h3 className="text-base font-black text-slate-900 mb-1">Reject Strategic Concepts</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Provide clear internal instructions</p>

                                            <form onSubmit={(e) => handleInlineRejectSubmit(e, article)}>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-red-50 focus:border-[#EE1C25]/20 transition-all resize-none"
                                                    placeholder="Specify exact optimizations required (e.g. adjust alignment, target commercial metrics instead...)"
                                                    value={internalNote}
                                                    onChange={(e) => setInternalNote(e.target.value)}
                                                />

                                                <div className="flex justify-end gap-2 mt-4">
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                                                        onClick={() => { setShowRejectModalId(null); setInternalNote(''); }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={!internalNote.trim()}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-40"
                                                    >
                                                        Confirm Reject
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                            </div>
                        );
                    })}

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