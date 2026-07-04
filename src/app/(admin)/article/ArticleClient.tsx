'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleService, type ArticleDisplay } from './service';
import { WriterService } from '../writer/service';
import { CategoryService } from '../category/service';
import {
    Search
} from 'lucide-react';
import Link from "next/link";

const YEARS = [2025, 2026, 2027];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getArticleWorkflowBadge(status: string, content: string) {
    if (status === 'writing') {
        const isCleanSlate = !content || content.trim() === '' || content.trim() === '<p></p>';
        if (isCleanSlate) {
            return { label: 'Ready to Write', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
        }
        return { label: 'In Progress', color: 'bg-blue-50 text-blue-600 border-blue-200' };
    }
    if (status === 'ready for review') {
        return { label: 'Ready for Review', color: 'bg-purple-50 text-purple-600 border-purple-200' };
    }
    if (status === 'published') {
        return { label: 'Published', color: 'bg-green-50 text-green-600 border-green-200' };
    }
    return { label: 'Draft', color: 'bg-slate-50 text-slate-400 border-slate-200' };
}

export default function ArticleProductionPage() {
    const now = new Date();

    // --- State: Filters ---
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [writerId, setWriterId] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');
    const [page, setPage] = useState(1);

    // --- State: Data ---
    const [articles, setArticles] = useState<ArticleDisplay[]>([]);
    const [writers, setWriters] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        async function loadOptions() {
            try {
                const [w, c] = await Promise.all([
                    WriterService.getAllWriters(),
                    CategoryService.getCategories()
                ]);
                setWriters(w);
                setCategories(c);
            } catch (err) {
                console.error("Failed to load filter options", err);
            }
        }
        loadOptions();
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { articles: rawArticles } = await ArticleService.getArticles({
                year,
                month,
                page,
                writerId: writerId || null,
                categoryId: categoryId || null,
                contentType: contentType || null,
                searchQuery: debouncedSearch || null
            });

            // Map the raw data structural shapes to explicitly fulfill ArticleDisplay expectations
            const formattedArticles: ArticleDisplay[] = (rawArticles || []).map((item: any) => ({
                id: item.id,
                title: item.title || 'Untitled Document',
                category: item.category || 'General',
                writer: item.writer || 'Unassigned',
                product: item.product || 'Standard Tag',
                status: item.status || 'draft',
                type: item.type || 'new',
                approval: item.approval || 'pending',
                target_keyword: item.target_keyword || '',
                meta_description: item.meta_description || '',

                // Explicitly map or default the missing properties TypeScript is asking for:
                productionMonth: item.production_month || '',
                meta: item.meta_description || '',
                isApproved: item.approval === 'approved' || false,
                product_name: item.product_name
            }));

            setArticles(formattedArticles);
        } catch (err) {
            console.error("Error loading articles:", err);
        } finally {
            setLoading(false);
        }
    }, [year, month, page, writerId, categoryId, contentType, debouncedSearch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleFilterChange = (setter: Function, value: any) => {
        setter(value);
        setPage(1);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* YEAR & MONTH SELECTOR BAR */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-4xl border border-slate-200 shadow-sm">
                <select
                    value={year}
                    onChange={(e) => handleFilterChange(setYear, Number(e.target.value))}
                    className="bg-slate-50 border-none text-sm font-black px-6 py-2.5 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#EE1C25]/20 transition-all cursor-pointer"
                >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                    {MONTHS.map((m, idx) => (
                        <button
                            key={m}
                            onClick={() => handleFilterChange(setMonth, idx + 1)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                month === idx + 1 ? 'bg-white text-[#EE1C25] shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* FILTERS RIBBON */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-3xl border border-slate-200/60">
                <div className="relative flex-1 min-w-75">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search workspace title headers..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none placeholder:text-slate-300 focus:border-[#EE1C25]/20"
                    />
                </div>

                <select value={writerId} onChange={(e) => handleFilterChange(setWriterId, e.target.value)} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer">
                    <option value="">All Writers</option>
                    {writers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>

                <select value={categoryId} onChange={(e) => handleFilterChange(setCategoryId, e.target.value)} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select value={contentType} onChange={(e) => handleFilterChange(setContentType, e.target.value)} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer">
                    <option value="">All Types</option>
                    <option value="new">New Article</option>
                    <option value="adjust">Optimization / Adjust</option>
                </select>
            </div>

            {/* CONTENT SHEET TABLE */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="bg-slate-50/80 backdrop-blur-md">
                    <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Article Production Copy</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Cluster Parameters</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Production State</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="p-24 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Content Engine Rows...</td>
                        </tr>
                    ) : articles.length > 0 ? (
                        articles.map((item) => {
                            const badge = getArticleWorkflowBadge(item.status, (item as any).content || '');
                            return (
                                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col max-w-sm">
                                            <Link href={`/article/${item.id}`}>
                                                <span className="text-sm font-black text-slate-900 group-hover:text-[#EE1C25] transition-colors">{item.title}</span>
                                            </Link>
                                            <span className="text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-wider">👤 Author: {item.writer || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span
                                                className="w-fit px-2 py-0.5 bg-red-50 text-[#EE1C25] text-[9px] font-black rounded border border-red-100 uppercase">
                                                {item.category}
                                            </span>
                                            <span className="text-xs font-bold text-slate-700 pl-0.5">
                                                {item.product_name || item.product || 'Umum'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-xl border ${badge.color}`}>• {badge.label}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <Link href={`/article/edit/${item.id}`} className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border border-slate-950 hover:bg-slate-800 transition-all shadow-sm">
                                                Open Workspace
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={4} className="py-24 text-center text-slate-400 font-bold text-xs uppercase tracking-wider italic">No production documents found inside this specific column state.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}