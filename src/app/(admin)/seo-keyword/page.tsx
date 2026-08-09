'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleService } from '../article/service';
import { CategoryService } from '../category/service';
import { SectionService } from '../section/service';
import { ProductTagService } from '../product-tag/service';
import { ProductPriorityService } from '../product-priority/service';
import { ThemeService } from '../theme/service';
import { PersonaService } from '../persona/service';
import { CampaignService } from '../campaign/service';
import { Search, Loader2, Filter, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import KeywordCreateDrawer from './KeywordCreateDrawer';
import { LookupOptions } from '@/types/article';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getStrategyApprovalBadge(approval: string) {
    if (approval === 'pending') return { label: 'Awaiting Review', color: 'text-amber-600 bg-amber-50/60 border-amber-100' };
    if (approval === 'rejected') return { label: 'Revision Needed', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Approved', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100' };
}

const getIntentBadgeStyle = (intent: string) => {
    switch (intent) {
        case 'Informational': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'Commercial': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Transactional': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'Navigational': return 'bg-blue-50 text-blue-700 border-blue-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
};

export default function UnifiedSeoKeywordPage() {
    const now = new Date();

    const [activeTab, setActiveTab] = useState<'all_briefs' | 'pending' | 'rejected'>('pending');
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [showFilters, setShowFilters] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const [inputValue, setInputValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');

    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [options, setOptions] = useState<LookupOptions>({
        categories: [], sections: [], productTags: [], themes: [], personas: [], campaigns: [], productPriorities: []
    });

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(inputValue), 300);
        return () => clearTimeout(handler);
    }, [inputValue]);

    useEffect(() => {
        document.title = "SEO Keyword Sandbox Matrix | PT CMS";
    }, []);

    const loadOptionsData = useCallback(async () => {
        try {
            const [c, secData, p, t, per, cmp, pr] = await Promise.all([
                CategoryService.getCategories(),
                SectionService.getSections({ page: 1, limit: 100, search: '' }).then(res => res.sections),
                ProductTagService.getProductTags({ page: 1, limit: 100, search: '' }).then(res => res.productTags),
                ThemeService.getThemes(),
                PersonaService.getPersonas(),
                CampaignService.getCampaigns(),
                ProductPriorityService.getAllActiveProductPriorities()
            ]);
            setOptions({ categories: c, sections: secData, productTags: p, themes: t, personas: per, campaigns: cmp, productPriorities: pr });
        } catch (err) {
            console.error("Failed executing parallel lookup fetches:", err);
        }
    }, []);

    useEffect(() => {
        loadOptionsData();
    }, [loadOptionsData]);

    const loadTableData = useCallback(async () => {
        setLoading(true);
        try {
            const { articles: dataRows } = await ArticleService.getArticles({
                year: now.getFullYear(),
                month,
                page: 1,
                categoryId: categoryId || null,
                contentType: contentType || null,
                searchQuery: debouncedSearch || null,
                status: 'seo pending',
                approval: activeTab === 'all_briefs' ? null : activeTab
            });
            setArticles(dataRows);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [month, categoryId, contentType, debouncedSearch, activeTab]);

    useEffect(() => {
        loadTableData();
    }, [loadTableData]);

    const handleCreateBrief = async (formData: any) => {
        try {
            // Fallback job_code calculation if drawer bundle is cached/stale
            let finalJobCode = formData.job_code;
            if (!finalJobCode) {
                const prefix = 'OID';
                let yearMonth = '??????';
                if (formData.production_month) {
                    const parts = formData.production_month.split('-');
                    if (parts.length >= 2) {
                        yearMonth = `${parts[0]}${parts[1]}`;
                    }
                }
                let taxonomyCode = '???';
                if (formData.section_id) {
                    const section = options.sections.find(s => String(s.id) === String(formData.section_id));
                    if (section && section.name) {
                        taxonomyCode = section.name.trim().substring(0, 3).toUpperCase();
                    }
                }
                const typeCode = formData.content_type === 'new' ? 'NC' : 'UC';
                let keywordCode = '???';
                if (formData.target_keyword) {
                    keywordCode = formData.target_keyword
                        .trim()
                        .split(/\s+/)
                        .map((word: string) => word.charAt(0))
                        .join('')
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '');
                    if (!keywordCode) keywordCode = '???';
                }
                finalJobCode = `${prefix}-${yearMonth}-${taxonomyCode}-${typeCode}-${keywordCode}`;
            }

            await ArticleService.createArticle({
                title: formData.title,
                job_code: finalJobCode,
                content: '',
                category_id: Number(formData.category_id),
                section_id: Number(formData.section_id),
                product_id: Number(formData.product_id),
                product_priority_id: formData.product_priority_id ? Number(formData.product_priority_id) : null,
                status: formData.status,
                production_month: formData.production_month,
                content_type: formData.content_type as 'new' | 'adjust',
                demand: parseInt(formData.demand, 10) || 0,
                intent: formData.intent,
                type: formData.type,
                classification: formData.classification,
                theme_id: formData.theme_id ? Number(formData.theme_id) : null,
                persona_id: formData.persona_id ? Number(formData.persona_id) : null,
                campaign_id: formData.campaign_id ? Number(formData.campaign_id) : null,
                target_keyword: formData.target_keyword,
                related_keyword: formData.related_keyword,
                meta_description: formData.meta_description,
                cta_internal_link: formData.cta_internal_link
            });
            setShowCreateForm(false);
            loadTableData();
        } catch (err) {
            alert('Failed to initialize strategy record brief.');
            throw err;
        }
    };

    return (
        <div className="space-y-8">
            {/* ACTION HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Keyword Strategy</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">SEO Gatekeeper Sandbox</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-brand-accent text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-navy transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                    <Plus size={14} /> Create Strategy
                </button>
            </div>

            {/* FILTERING Rowan CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl w-fit">
                    {['pending', 'rejected', 'all_briefs'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer capitalize ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-650'
                                }`}
                        >
                            {tab === 'pending' ? '⏳ Review Queue' : tab === 'rejected' ? '❌ Revisions' : 'All Briefs'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Quick search keywords..."
                            className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-slate-300 w-48 transition-all"
                        />
                    </div>

                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200/60 text-xs font-black py-2 px-3 rounded-xl outline-none cursor-pointer text-slate-705"
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

            {/* COLLAPSIBLE ANCHOR PANEL */}
            {showFilters && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 animate-in slide-in-from-top-2 duration-150">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Category Cluster</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none cursor-pointer">
                            <option value="">All Categories</option>
                            {options.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

            {/* DATATABLE LIST BOARD */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                            <th className="px-6 py-4.5">JOB_CODE</th>
                            <th className="px-6 py-4.5 w-1/3">Proposed Strategy / Headline</th>
                            <th className="px-6 py-4.5">Metrics / Ops</th>
                            <th className="px-6 py-4.5">Focus Keyword</th>
                            <th className="px-6 py-4.5">Audit Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="animate-spin text-slate-300" size={24} />
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Loading structural records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : articles.length > 0 ? (
                            articles.map((item) => {
                                const badge = getStrategyApprovalBadge(item.approval || 'pending');

                                // Calculate days pending to highlight overdue review items
                                const createdDate = new Date(item.created_at);
                                const now = new Date();
                                const diffTime = Math.abs(now.getTime() - createdDate.getTime());
                                const daysPending = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                const isOverdue = daysPending >= 3 && item.approval === 'pending';

                                return (
                                    <tr key={item.id} className={`group transition-colors ${isOverdue ? 'bg-rose-50/20 hover:bg-rose-50/30' : 'hover:bg-slate-50/40'}`}>
                                        <td className="px-6 py-5 whitespace-nowrap align-middle">
                                            <Link href={`/seo-keyword/edit/${item.id}`} className="inline-block">
                                                <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 hover:border-brand-accent/40 hover:text-brand-accent px-2.5 py-1 rounded-md tracking-wider whitespace-nowrap select-all shadow-xs transition-all cursor-pointer">
                                                    {item.job_code || '—'}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5 align-middle">
                                            <div className="flex flex-col min-w-[200px]">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-brand-accent transition-colors line-clamp-1">{item.title}</span>
                                                    {isOverdue && (
                                                        <span className="shrink-0 inline-flex items-center gap-1 text-[8px] font-black text-rose-650 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md tracking-wider uppercase animate-pulse">
                                                            <AlertTriangle size={10} className="text-rose-500" /> Overdue ({daysPending}d)
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-black mt-1.5 uppercase tracking-wider block">
                                                    {item.section || item.category} • 🛠️ {item.contentType === 'new' ? 'NEW' : 'ADJUST'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap align-middle">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-1.5 items-center">
                                                    <span className={`px-2 py-0.5 border text-[9px] font-black uppercase tracking-wider rounded-md whitespace-nowrap ${getIntentBadgeStyle(item.intent)}`}>
                                                        {item.intent || 'Info'}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-black uppercase rounded-md tracking-wider whitespace-nowrap">
                                                        {item.classification}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                    🔥 {(item.demand || 0).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap align-middle">
                                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 whitespace-nowrap">
                                                {item.target_keyword || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap align-middle">
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border whitespace-nowrap ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-16 text-center text-slate-400 font-bold text-xs uppercase tracking-wider italic">No assets available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* SEPARATED DRAWER VIEW */}
            <KeywordCreateDrawer
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSubmit={handleCreateBrief}
                options={options}
            />
        </div>
    );
}