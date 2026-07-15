'use client';

import { useState } from 'react';
import { ArticleService } from '../service';
import {
    Send,
    CheckCircle,
    Globe,
    Loader2,
    Link2,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkflowProps {
    article: {
        id: string;
        status: string;
        approval: string;
        title: string;
    };
}

export default function WorkflowActions({ article }: WorkflowProps) {
    const [loading, setLoading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlPublished, setUrlPublished] = useState('');
    const router = useRouter();

    const { id, status, approval } = article;

    // Validation: Must be a valid URL and preferably an OCBC domain
    const isValidUrl = urlPublished.startsWith('https://') && urlPublished.includes('.');

    const handleUpdate = async (newStatus: string, newApproval: string, url?: string) => {
        setLoading(true);
        try {
            await ArticleService.updateWorkflow({
                id,
                status: newStatus,
                approval: newApproval,
                url_published: url,
                oldStatus: status,
                oldApproval: approval
            });
            setShowUrlInput(false);
            setUrlPublished('');
            router.refresh();
        } catch (err) {
            console.error("Workflow Error:", err);
            alert("Failed to transition state. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    // 1. Final State: Already Published
    if (status === 'published') {
        return (
            <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black border border-emerald-100 uppercase tracking-[0.2em] shadow-sm">
                <Globe size={14} /> Live on Production
            </div>
        );
    }

    return (
        <>
            {/* THE MAIN ACTION BUTTONS */}
            <div className="flex items-center gap-3">
                {loading && <Loader2 size={18} className="animate-spin text-brand-accent" />}

                {/* STAGE: DRAFT -> READY FOR REVIEW */}
                {(status === 'draft' || status === 'progress') && (
                    <button
                        disabled={loading}
                        onClick={() => handleUpdate('ready for review', 'pending')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                    >
                        <Send size={14} /> Submit for Review
                    </button>
                )}

                {/* STAGE: REVIEW -> APPROVED */}
                {status === 'ready for review' && approval === 'pending' && (
                    <button
                        disabled={loading}
                        onClick={() => handleUpdate('ready for review', 'approved')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-accent/20 cursor-pointer hover:bg-brand-navy transition-all"
                    >
                        <CheckCircle size={14} /> Approve Content
                    </button>
                )}

                {/* STAGE: APPROVED -> PUBLISH (Opens the Overlay) */}
                {status === 'ready for review' && approval === 'approved' && !showUrlInput && (
                    <button
                        onClick={() => setShowUrlInput(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-accent/20 cursor-pointer animate-pulse active:scale-95 hover:bg-brand-navy transition-all"
                    >
                        <Globe size={14} /> Finalize Publication
                    </button>
                )}
            </div>

            {/* THE GLOBAL PUBLICATION OVERLAY */}
            {showUrlInput && (
                <div className="fixed inset-0 z-999 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="absolute top-0 left-0 w-full bg-white shadow-2xl border-b border-slate-200 p-8 animate-in slide-in-from-top-full duration-500 ease-out">
                        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">

                            {/* Context Info */}
                            <div className="hidden lg:block w-1/4">
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Publishing Article</span>
                                <p className="text-xs font-bold text-slate-900 line-clamp-1">{article.title}</p>
                            </div>

                            {/* URL Input Area */}
                            <div className="flex-1 w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Link2 size={14} /> Paste Production URL
                                    </label>
                                    {!isValidUrl && urlPublished.length > 0 && (
                                        <span className="text-[9px] font-bold text-red-500 flex items-center gap-1 italic">
                      <AlertCircle size={10} /> Must start with https://
                    </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        autoFocus
                                        type="url"
                                        value={urlPublished}
                                        onChange={(e) => setUrlPublished(e.target.value)}
                                        placeholder="https://www.ocbc.id/id/article/..."
                                        className="w-full pl-6 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-brand-accent/20 focus:ring-4 focus:ring-brand-light-blue/20 focus:bg-white transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setShowUrlInput(false)}
                                    className="px-6 py-4 text-slate-400 font-bold text-xs hover:text-slate-900 cursor-pointer transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!isValidUrl || loading}
                                    onClick={() => handleUpdate('published', 'approved', urlPublished)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-brand-accent hover:bg-brand-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Confirm <ArrowRight size={14}/></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}