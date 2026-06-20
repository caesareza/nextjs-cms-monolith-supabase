'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleService } from '../article/service';
import { CategoryService } from '../category/service';
import { ProductTagService} from "@/app/(admin)/product-tag/service";
import { Search, Loader2, Filter, Plus, X } from 'lucide-react';
import Link from 'next/link';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getStrategyApprovalBadge(approval: string) {
    if (approval === 'pending') {
        return { label: 'Awaiting Review', color: 'text-amber-600 bg-amber-50/60 border-amber-100' };
    }
    if (approval === 'rejected') {
        return { label: 'Revision Needed', color: 'text-red-600 bg-red-50/60 border-red-100' };
    }
    return { label: 'Approved', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100' };
}

export default function UnifiedSeoKeywordPage() {
    const now = new Date();

    // --- Dashboard UI States ---
    const [activeTab, setActiveTab] = useState<'all_briefs' | 'pending' | 'rejected'>('pending');
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [showFilters, setShowFilters] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // --- Search & Meta Filters ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');

    // --- Core Data Collections ---
    const [articles, setArticles] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [productTags, setProductTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- NEW INLINE CREATE FORM STATE ---
    const [form, setForm] = useState({
        title: '',
        category_id: 0,
        product_id: 0,
        content_type: 'new',
        production_month: new Date().toISOString().split('T')[0],
        status: 'seo pending',
        target_keyword: '',
        meta_description: '',
        cta_internal_link: ''
    });

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const loadOptionsAndData = useCallback(async () => {
        try {
            const [c, p] = await Promise.all([
                CategoryService.getAllCategories(),
                ProductTagService.getProductTags()
            ]);
            setCategories(c);
            setProductTags(p);
        } catch (err) {
            console.error("Failed to load options", err);
        }
    }, []);

    useEffect(() => {
        loadOptionsAndData();
    }, [loadOptionsAndData]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { articles } = await ArticleService.getArticles({
                year: now.getFullYear(),
                month,
                page: 1,
                categoryId: categoryId || null,
                contentType: contentType || null,
                searchQuery: debouncedSearch || null,
                status: 'seo pending',
                approval: activeTab === 'all_briefs' ? null : activeTab
            });

            setArticles(articles);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [month, categoryId, contentType, debouncedSearch, activeTab]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- SUBMIT HANDLE FOR INLINE MODE ---
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.category_id || !form.product_id) {
            alert('Please select both a Category Cluster and a Product Tag.');
            return;
        }

        setSubmitLoading(true);
        try {
            await ArticleService.createArticle({
                title: form.title,
                content: '',
                category_id: form.category_id,
                product_id: form.product_id,
                status: form.status,
                production_month: form.production_month,
                content_type: form.content_type as 'new' | 'adjust',
                target_keyword: form.target_keyword,
                meta_description: form.meta_description,
                cta_internal_link: form.cta_internal_link
            });

            // Reset form and UI closing flags cleanly
            setForm({
                title: '',
                category_id: 0,
                product_id: 0,
                content_type: 'new',
                production_month: new Date().toISOString().split('T')[0],
                status: 'seo pending',
                target_keyword: '',
                meta_description: '',
                cta_internal_link: ''
            });
            setShowCreateForm(false);
            loadData(); // Re-trigger live table content update
        } catch (err) {
            console.error(err);
            alert('Failed to initialize strategy record brief.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 text-slate-900 relative">

            {/* 1. DASHBOARD ACTION HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">Keyword Strategy</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">SEO Gatekeeper Sandbox</p>
                </div>

                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-[#EE1C25] text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                    <Plus size={14} strokeWidth={3} /> Create Strategy
                </button>
            </div>

            {/* 2. DASHBOARD FILTERING ENGINE CONTROL ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl w-fit">
                    <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        ⏳ Review Queue
                    </button>
                    <button onClick={() => setActiveTab('rejected')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'rejected' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        ❌ Revisions
                    </button>
                    <button onClick={() => setActiveTab('all_briefs')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'all_briefs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        All Briefs
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Quick search keywords..."
                            className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-slate-300 w-48 transition-all"
                        />
                    </div>

                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200/60 text-xs font-black py-2 px-3 rounded-xl outline-none cursor-pointer text-slate-700"
                    >
                        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m} Production</option>)}
                    </select>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-xl border text-slate-500 transition-colors cursor-pointer ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                        <Filter size={14} />
                    </button>
                </div>
            </div>

            {/* COLLAPSIBLE FILTERS PANEL */}
            {showFilters && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 animate-in slide-in-from-top-2 duration-150">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Category Cluster</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none cursor-pointer">
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Content Intent Type</label>
                        <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none cursor-pointer">
                            <option value="">All Types</option>
                            <option value="new">New Article</option>
                            <option value="adjust">Optimization / Adjust</option>
                        </select>
                    </div>
                </div>
            )}

            {/* 3. TABLE GRID ARCHITECTURE */}
            <div className="border-t border-slate-100 pt-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b border-slate-100">
                        <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-1/2">Proposed Strategy / Headline</th>
                        <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-1/4">Focus Keyword</th>
                        <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-1/6">Audit</th>
                        <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Gate</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Loading structural records...</td>
                        </tr>
                    ) : articles.length > 0 ? (
                        articles.map((item) => {
                            const badge = getStrategyApprovalBadge((item as any).approval || 'pending');
                            return (
                                <tr key={item.id} className="group hover:bg-slate-50/40 transition-colors">
                                    <td className="py-5 pr-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 group-hover:text-[#EE1C25] transition-colors line-clamp-1">{item.title}</span>
                                            <span className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-tight">
                                                    {item.category} • 🛠️ {item.contentType === 'new' ? 'NEW' : 'ADJUST'}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 line-clamp-1 w-fit">
                                                {(item as any).target_keyword || '—'}
                                            </span>
                                    </td>
                                    <td className="py-5">
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                    </td>
                                    <td className="py-5 text-right">
                                        <Link href={`/seo-keyword/edit/${item.id}`} className="inline-flex items-center text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-950 hover:bg-slate-800 transition-all shadow-sm">
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={4} className="py-16 text-center text-slate-400 font-bold text-xs uppercase tracking-wider italic">No assets available.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* --- SLIDE-OVER DRAWER MODAL CONSOLE: INLINE CREATE SYSTEM --- */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateForm(false)} />

                    <div className="relative w-full max-w-xl bg-white h-full shadow-2xl p-8 overflow-y-auto flex flex-col space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-black text-slate-900">New Strategy Brief</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Initialize focus requirements</p>
                            </div>
                            <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col justify-between space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proposed Headline Title</label>
                                    <input
                                        className="w-full text-lg font-bold text-slate-900 border-b border-slate-200 focus:border-[#EE1C25] outline-none pb-2 transition-colors"
                                        placeholder="Enter content concept topic header..."
                                        value={form.title}
                                        onChange={(e) => setForm({...form, title: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none" value={form.category_id || ''} onChange={(e) => setForm({...form, category_id: Number(e.target.value)})} required>
                                            <option value="">Select Cluster...</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Product Tag</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none" value={form.product_id || ''} onChange={(e) => setForm({...form, product_id: Number(e.target.value)})} required>
                                            <option value="">Select Product...</option>
                                            {productTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Strategy Type</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none" value={form.content_type} onChange={(e) => setForm({...form, content_type: e.target.value})} required>
                                            <option value="new">New Article</option>
                                            <option value="adjust">Optimization / Adjust</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Campaign Target Month</label>
                                        <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none" value={form.production_month} onChange={(e) => setForm({...form, production_month: e.target.value})} required />
                                    </div>
                                </div>
                                Composition Suite
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Focus Keyword</label>
                                    <textarea rows={2} className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:bg-white focus:border-slate-300" placeholder="Primary deep intent search phrase..." value={form.target_keyword} onChange={(e) => setForm({...form, target_keyword: e.target.value})} required />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Meta Description Tag</label>
                                    <textarea rows={3} className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:bg-white focus:border-slate-300" placeholder="Google snippet parameter summary parameters..." value={form.meta_description} onChange={(e) => setForm({...form, meta_description: e.target.value})} required />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">CTA Destination Links</label>
                                    <textarea rows={2} className="w-full text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:bg-white focus:border-slate-300" placeholder="https://ocbc.id/..." value={form.cta_internal_link} onChange={(e) => setForm({...form, cta_internal_link: e.target.value})} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading || !form.title.trim() || !form.target_keyword.trim()}
                                className="w-full bg-[#EE1C25] text-white text-xs font-black uppercase tracking-wider py-4 rounded-xl hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                            >
                                {submitLoading ? <Loader2 size={14} className="animate-spin" /> : 'Commit Strategy Data'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}