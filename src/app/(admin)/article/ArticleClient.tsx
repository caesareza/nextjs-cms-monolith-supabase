'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleService, type ArticleDisplay } from './service';
import { WriterService } from '../writer/service';
import { CategoryService } from '../category/service';
import {
    Eye, Edit3, Trash2,
    ChevronLeft, ChevronRight, Filter, X,
    Search, Loader2
} from 'lucide-react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import DeleteModal from "@/app/(admin)/article/DeleteModal";
import {createClient} from "@/utils/supabase/client";

const YEARS = [2025, 2026, 2027];
const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function ArticleClient() {
    const route = useRouter();
    const now = new Date();
    const currentYear = now.getFullYear(); // 2026
    const currentMonth = now.getMonth() + 1;

    // --- State: Filters ---
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth); // Default to March
    const [writerId, setWriterId] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');
    const [page, setPage] = useState(1);

    // --- State: Data & UI ---
    const [articles, setArticles] = useState<ArticleDisplay[]>([]);
    const [writers, setWriters] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [deleteState, setDeleteState] = useState({ isOpen: false, loading: false, success: false, article: null as any });

    const handleSoftDelete = async () => {
        setDeleteState(prev => ({ ...prev, loading: true }));
        try {
            // Replace with actual session email
            const supabase = createClient(); // Your client-side supabase instance

            // 1. Get the current authenticated user
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user?.email) {
                throw new Error("User session not found");
            }

            await ArticleService.softDeleteArticle(
                deleteState.article.id,
                deleteState.article.status,
                user.email
            );

            setDeleteState(prev => ({ ...prev, success: true, loading: false }));

            // Auto-close and refresh UI after 1.5s
            setTimeout(() => {
                setDeleteState({ isOpen: false, loading: false, success: false, article: null });
                route.refresh();
            }, 1500);

        } catch (err) {
            setDeleteState(prev => ({ ...prev, loading: false }));
            alert("Delete failed.");
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to page 1 when searching
        }, 500); // 500ms delay

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // 1. Initial Load: Fetch Dropdown Options (Writers & Categories)
    useEffect(() => {
        async function loadOptions() {
            try {
                const [w, c] = await Promise.all([
                    WriterService.getAllWriters(),
                    CategoryService.getAllCategories()
                ]);
                setWriters(w);
                setCategories(c);
            } catch (err) {
                console.error("Failed to load filter options", err);
            }
        }
        loadOptions();
    }, []);

    // 2. Core Logic: Fetch Articles based on all active filters
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { articles, total } = await ArticleService.getArticles({
                year,
                month,
                page,
                writerId: writerId || null,
                categoryId: categoryId || null,
                contentType: contentType || null,
                searchQuery: debouncedSearch || null // Pass the debounced value
            });
            setArticles(articles as ArticleDisplay[]);
            setTotal(total);
        } catch (err) {
            console.error("Error loading articles:", err);
        } finally {
            setLoading(false);
        }
    }, [year, month, page, writerId, categoryId, contentType, debouncedSearch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Reset page to 1 whenever a filter changes
    const handleFilterChange = (setter: Function, value: any) => {
        setter(value);
        setPage(1);
    };

    const clearFilters = () => {
        setWriterId('');
        setCategoryId('');
        setContentType('');
        setPage(1);
    };

    return (
        <div className="space-y-6">
            {/* SECTION 1: TOP NAVIGATION (Year & Month) */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-4xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <select
                        value={year}
                        onChange={(e) => handleFilterChange(setYear, Number(e.target.value))}
                        className="appearance-none bg-slate-50 border-none text-sm font-black px-6 py-2.5 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#EE1C25]/20 transition-all cursor-pointer pr-10"
                    >
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                    {MONTHS.map((m, idx) => {
                        const isActive = month === idx + 1;
                        return (
                            <button
                                key={m}
                                onClick={() => handleFilterChange(setMonth, idx + 1)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white text-[#EE1C25] shadow-md scale-105'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {m}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 2: ADVANCED FILTERS */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mr-2 px-2">
                    <Filter size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Advanced Filters</span>
                </div>

                {/* NEW SEARCH INPUT */}
                <div className="relative flex-1 min-w-75">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search article titles..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-red-50 focus:border-[#EE1C25]/20 outline-none transition-all placeholder:text-slate-300"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <select
                    value={writerId}
                    onChange={(e) => handleFilterChange(setWriterId, e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none focus:ring-4 focus:ring-red-50 transition-all"
                >
                    <option value="">All Writers</option>
                    {writers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>

                <select
                    value={categoryId}
                    onChange={(e) => handleFilterChange(setCategoryId, e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none focus:ring-4 focus:ring-red-50 transition-all"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select
                    value={contentType}
                    onChange={(e) => handleFilterChange(setContentType, e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none focus:ring-4 focus:ring-red-50 transition-all"
                >
                    <option value="">All Types</option>
                    <option value="new">New Konten</option>
                    <option value="update">Update Konten</option>
                </select>

                {(writerId || categoryId || contentType) && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#EE1C25] hover:bg-red-50 px-3 py-2 rounded-lg transition-all ml-auto"
                    >
                        <X size={12} /> Reset Filters
                    </button>
                )}
            </div>

            {/* SECTION 3: DATA TABLE */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="overflow-x-auto max-h-175">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md">
                        <tr className="border-b border-slate-100">
                            <th className="sticky left-0 bg-slate-50/80 z-30 px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Article Title</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Category / Product</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-32 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="animate-spin text-[#EE1C25]" size={32} />
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Refreshing Nexus Data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : articles.length > 0 ? (
                            articles.map((item) => (
                                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                    {/* Sticky Title Column */}
                                    <td className="sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 px-8 py-6 border-r border-slate-50 shadow-[4px_0_15px_rgb(0,0,0,0.01)]">
                                        <div className="flex flex-col max-w-sm">
                                            <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-[#EE1C25] transition-colors">{item.title}</span>
                                            <span className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">{item.writer}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2">
                        <span className="w-fit px-3 py-1 bg-red-50 text-[#EE1C25] text-[9px] font-black rounded-full border border-red-100 uppercase tracking-tighter">
                          {item.category}
                        </span>
                                            <span className="text-xs font-bold text-slate-600 italic">
                          {item.product || 'Standard Product'}
                        </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${item.isApproved ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                                            <span className="text-xs font-bold text-slate-700 capitalize">{item.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <Link
                                                href={`/article/${item.id}`}
                                                className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-300 hover:text-slate-900 hover:border-[#EE1C25] transition-all flex items-center justify-center"
                                            >
                                                <Eye size={18}/>
                                            </Link>
                                            <Link
                                                href={`/article/edit/${item.id}`}
                                                className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-300 hover:text-slate-900 hover:border-[#EE1C25] transition-all flex items-center justify-center"
                                            >
                                                <Edit3 size={18}/>
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setDeleteState({
                                                        isOpen: true,
                                                        loading: false,
                                                        success: false,
                                                        article: item
                                                    });
                                                }}
                                                className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-[#EE1C25] hover:bg-red-50 hover:border-red-100 transition-all cursor-pointer group"
                                                title="Move to Trash"
                                            >
                                                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-32 text-center text-slate-400 font-medium italic">
                                    No articles found for the selected filters.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* SECTION 4: PAGINATION FOOTER */}
                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</span>
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-900">{total}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-white hover:border-[#EE1C25] hover:text-[#EE1C25] transition-all shadow-sm"
                        >
                            <ChevronLeft size={18}/>
                        </button>

                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Page</span>
                            <span className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#EE1C25] rounded-xl text-xs font-black text-slate-900 shadow-sm shadow-red-50">
                {page}
               </span>
                        </div>

                        <button
                            disabled={articles.length < 10 || loading}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-white hover:border-[#EE1C25] hover:text-[#EE1C25] transition-all shadow-sm"
                        >
                            <ChevronRight size={18}/>
                        </button>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={deleteState.isOpen}
                loading={deleteState.loading}
                success={deleteState.success}
                articleTitle={deleteState.article?.title || ""}
                onClose={() => setDeleteState({ ...deleteState, isOpen: false })}
                onConfirm={handleSoftDelete}
            />
        </div>
    );
}