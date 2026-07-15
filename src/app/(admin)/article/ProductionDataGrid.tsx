'use client';

import Link from 'next/link';
import { Loader2, User, ArrowRight } from 'lucide-react';
import type { ArticleDisplay } from '@/types/article';

interface ProductionDataGridProps {
    articles: ArticleDisplay[];
    loading: boolean;
}

// Restored: Exact workflow status badge logic map matching your system
function getArticleWorkflowBadge(status: string, content?: string) {
    if (status === 'writing') {
        const isCleanSlate = !content || content.trim() === '' || content.trim() === '<p></p>';
        if (isCleanSlate) {
            return { label: 'Ready to Write', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100' };
        }
        return { label: 'In Progress', color: 'text-blue-600 bg-blue-50/60 border-blue-100' };
    }
    if (status === 'ready for review') {
        return { label: 'Ready for Review', color: 'text-purple-600 bg-purple-50/60 border-purple-100' };
    }
    if (status === 'published') {
        return { label: 'Published', color: 'text-green-600 bg-green-50/60 border-green-200' };
    }
    return { label: 'Draft', color: 'text-slate-500 bg-slate-50 border-slate-200' };
}

export default function ProductionDataGrid({ articles, loading }: ProductionDataGridProps) {
    return (
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                    <th className="pl-8 pr-4 py-4.5 w-7/12">Topic / Title Asset</th>
                    <th className="px-6 py-4.5 w-3/12">Status</th>
                    <th className="pr-8 pl-4 py-4.5 text-right w-2/12">Workspace</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                {loading ? (
                    <tr>
                        <td colSpan={3} className="py-24 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Loader2 className="animate-spin text-slate-300" size={20} />
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Loading Assigned Briefs...</span>
                            </div>
                        </td>
                    </tr>
                ) : articles.length > 0 ? (
                    articles.map((item) => {
                        const badge = getArticleWorkflowBadge(item.status, (item as any).content || '');
                        return (
                            <tr key={item.id} className="group hover:bg-slate-50/40 transition-colors">

                                {/* 1. TOPIC & AUTHOR BLOCK */}
                                <td className="pl-8 pr-4 py-5">
                                    <div className="flex flex-col space-y-1 max-w-xl">
                                        <Link href={`/article/${item.id}`} className="text-sm font-bold text-slate-900 group-hover:text-brand-accent transition-colors leading-snug line-clamp-1 cursor-pointer">
                                            {item.title}
                                        </Link>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 select-none">
                                            <User size={11} className="text-slate-300 shrink-0" />
                                            <span>{item.writer || 'Unassigned Writer'}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* 2. SIMPLIFIED WORKFLOW BADGE */}
                                <td className="px-6 py-5">
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${badge.color} select-none`}>
                                            {badge.label}
                                        </span>
                                </td>

                                {/* 3. WORKSPACE PORTAL */}
                                <td className="pr-8 pl-4 py-5 text-right">
                                    <Link href={`/article/edit/${item.id}`} className="inline-flex items-center text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-950 hover:bg-slate-800 transition-all shadow-xs">
                                        Open <ArrowRight size={11} className="ml-1 shrink-0" />
                                    </Link>
                                </td>

                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={3} className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-wider italic">
                            No assigned production assets found for this cycle.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}