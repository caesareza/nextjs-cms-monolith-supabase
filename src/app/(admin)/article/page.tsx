import { createClient } from '@/utils/supabase/server';
import {
    Eye, Edit2, Trash2, ChevronLeft, ChevronRight,
    FileText
} from 'lucide-react';
import Link from 'next/link';

export default async function ArticlesPage({searchParams }: {
    searchParams: { page?: string };
}) {
    const supabase = await createClient();

    // 1. Pagination Logic
    const currentPage = Number(searchParams.page) || 1;
    const pageSize = 10;
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // 2. Fetch Data with Count
    const { data: articles, count } = await supabase
        .from('article')
        .select('*, writer(name)', { count: 'exact' }) // Joining with writer table to get names
        .order('created_at', { ascending: false })
        .range(from, to);

    const totalPages = Math.ceil((count || 0) / pageSize);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Articles</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and monitor your published content.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EE1C25] text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-[#D71921] transition-all">
                    <FileText size={18} /> New Article
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Title</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Writer</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {articles?.map((article) => (
                            <tr key={article.id} className="group hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-5">
                                    <span className="text-sm font-bold text-slate-900">{article.title}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                            {article.writer?.name?.charAt(0) || 'W'}
                                        </div>
                                        <span className="text-sm font-medium text-slate-600">{article.writer?.name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 bg-emerald-50 text-emerald-600">
                      Published
                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-1">
                                        <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"><Eye size={16}/></button>
                                        <button className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit2 size={16}/></button>
                                        <button className="p-2 text-slate-300 hover:text-[#EE1C25] hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Dynamic Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="text-slate-900 font-bold">{from + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(to + 1, count || 0)}</span> of <span className="text-slate-900 font-bold">{count}</span> articles
                    </p>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/articles?page=${currentPage - 1}`}
                            className={`p-2 rounded-lg border border-slate-200 bg-white transition-all ${currentPage <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-slate-50'}`}
                        >
                            <ChevronLeft size={16} />
                        </Link>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Link
                                    key={p}
                                    href={`/articles?page=${p}`}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                        p === currentPage
                                            ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                                            : 'text-slate-500 hover:bg-white hover:border-slate-200'
                                    }`}
                                >
                                    {p}
                                </Link>
                            ))}
                        </div>

                        <Link
                            href={`/articles?page=${currentPage + 1}`}
                            className={`p-2 rounded-lg border border-slate-200 bg-white transition-all ${currentPage >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-slate-50'}`}
                        >
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}