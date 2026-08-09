'use client';

import { useState, useEffect } from 'react';
import { ArticleService } from '@/app/(admin)/article/service';
import { EditFormState, LookupOptions } from '@/types/article';
import ArticleHistory from '@/app/(admin)/article/[id]/ArticleHistory';
import {
    Edit2,
    Save,
    X,
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    FolderKanban,
    Tag,
    Sparkles,
    Target,
    Calendar,
    Flame,
    ShieldCheck,
    Megaphone,
    Loader2,
    Link2,
    Package,
    User,
    FileText,
    History
} from 'lucide-react';

interface StrategyDetailViewProps {
    form: EditFormState;
    setForm: React.Dispatch<React.SetStateAction<EditFormState>>;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    isApproved: boolean;
    isActionDisabled: boolean;
    actionLoading: boolean;
    dbSnapshot: any;
    lookups: LookupOptions;
    onBack: () => void;
    onSave: () => Promise<void>;
    onApprove: () => Promise<void>;
    onRejectClick: () => void;
    logs?: any[];
}

export default function StrategyDetailView({
    form, setForm, isEditing, setIsEditing, isApproved, isActionDisabled, actionLoading,
    dbSnapshot, lookups, onBack, onSave, onApprove, onRejectClick, logs = []
}: StrategyDetailViewProps) {

    // Marketing assets states
    const [marketingAssets, setMarketingAssets] = useState<any[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [newAssetType, setNewAssetType] = useState<'cta' | 'product'>('cta');
    const [newAssetValue, setNewAssetValue] = useState('');
    const [submittingAsset, setSubmittingAsset] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'seo_suite' | 'assets' | 'history'>('overview');

    useEffect(() => {
        if (!dbSnapshot?.id) return;
        const fetchAssets = async () => {
            setLoadingAssets(true);
            try {
                const data = await ArticleService.getMarketingAssets(Number(dbSnapshot.id));
                setMarketingAssets(data || []);
            } catch (err) {
                console.error("Failed loading marketing assets:", err);
            } finally {
                setLoadingAssets(false);
            }
        };
        fetchAssets();
    }, [dbSnapshot?.id]);

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAssetValue.trim() || !dbSnapshot?.id) return;

        setSubmittingAsset(true);
        try {
            const newAsset = await ArticleService.createMarketingAsset({
                article_id: Number(dbSnapshot.id),
                asset_type: newAssetType,
                asset_value: newAssetValue.trim()
            });
            setMarketingAssets(prev => [...prev, newAsset]);
            setNewAssetValue('');
        } catch (err) {
            console.error("Failed adding marketing asset:", err);
            alert("Failed to save marketing asset.");
        } finally {
            setSubmittingAsset(false);
        }
    };

    const cat = lookups.categories.find(c => c.id === Number(form.category_id))?.name || 'Unspecified';
    const sec = lookups.sections.find(s => s.id === Number(form.section_id))?.name || 'Unspecified';
    const prod = lookups.productTags.find(t => t.id === Number(form.product_id))?.name || 'Standard Product';
    const thm = lookups.themes.find(t => t.id === Number(form.theme_id))?.name || 'General Campaign Theme';
    const per = lookups.personas.find(p => p.id === Number(form.persona_id))?.name || 'All Target Profiles';
    const cmp = lookups.campaigns.find(c => c.id === Number(form.campaign_id))?.name || 'Organic Strategy';

    return (
        <div className="space-y-8 text-slate-900">
            {/* 1. TOP BAR CONTROL ACTIONS */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer">
                    <ArrowLeft size={14} /> Back to Sandbox Matrix
                </button>

                {!isEditing ? (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(true)}
                            disabled={isActionDisabled}
                            className="text-slate-600 hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                            <Edit2 size={15} /> Edit Brief
                        </button>

                        {!isApproved && (
                            <>
                                <button
                                    disabled={isActionDisabled}
                                    onClick={onRejectClick}
                                    className="border border-brand-accent/20 bg-brand-accent/5 text-brand-accent hover:bg-brand-accent/15 px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                                >
                                    <AlertTriangle size={15} /> Reject
                                </button>
                                <button
                                    disabled={isActionDisabled}
                                    onClick={onApprove}
                                    className="bg-brand-accent hover:bg-brand-navy text-white px-6 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition shadow-sm cursor-pointer disabled:bg-slate-105 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                    <CheckCircle size={15} /> Approve Strategy
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1"
                        >
                            <X size={13} /> Cancel
                        </button>
                        <button
                            disabled={actionLoading}
                            onClick={onSave}
                            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                            {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <><Save size={13} /> Save Changes</>}
                        </button>
                    </div>
                )}
            </div>

            {/* 2. LIVE ROADMAP NOTIFICATION */}
            {isApproved && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-250/70 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold shadow-3xs">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <span>This focus architecture is approved. Saving any edits below will instantly reset the gate to pending for Director re-review.</span>
                </div>
            )}

            {/* 3. PROPOSED HEADLINE & UNBOXED META ROW */}
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proposed Strategy Headline</span>
                    {isEditing ? (
                        <input
                            className="w-full text-xl font-bold text-slate-900 border-b-2 border-slate-950 focus:border-brand-accent outline-none pb-1 transition-all bg-slate-50/70 p-3 rounded-xl"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    ) : (
                        <h1 className="text-2xl font-black text-slate-900 leading-tight">
                            {form.title}
                        </h1>
                    )}
                </div>

                {/* CRM Metadata attributes row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Assigned owner:</span>
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            <User size={10} /> SEO Editor
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Status:</span>
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                            <span className={`w-2 h-2 rounded-full inline-block ${isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[11px] font-semibold">{isApproved ? 'Active Strategy' : 'Pending Review'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Type:</span>
                        <span className="text-[11px] font-bold text-slate-800">
                            {form.content_type === 'new' ? 'New Asset' : 'Optimization / Refresh'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-slate-400 font-medium">Job Code:</span>
                        <span className="text-[10px] font-mono font-bold text-slate-750 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md tracking-wider select-all shadow-3xs">
                            {isEditing ? (
                                (() => {
                                    const prefix = 'OID';
                                    let yearMonth = '??????';
                                    if (form.production_month) {
                                        const parts = form.production_month.split('-');
                                        if (parts.length >= 2) {
                                            yearMonth = `${parts[0]}${parts[1]}`;
                                        }
                                    }
                                    let taxonomyCode = '???';
                                    if (form.section_id) {
                                        const section = lookups.sections.find(s => String(s.id) === String(form.section_id));
                                        if (section && section.name) {
                                            taxonomyCode = section.name.trim().substring(0, 3).toUpperCase();
                                        }
                                    }
                                    const typeCode = form.content_type === 'new' ? 'NC' : 'UC';
                                    let keywordCode = '???';
                                    if (form.target_keyword) {
                                        keywordCode = form.target_keyword
                                            .trim()
                                            .split(/\s+/)
                                            .map(word => word.charAt(0))
                                            .join('')
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, '');
                                        if (!keywordCode) keywordCode = '???';
                                    }
                                    return `${prefix}-${yearMonth}-${taxonomyCode}-${typeCode}-${keywordCode}`;
                                })()
                            ) : (
                                dbSnapshot?.job_code || '—'
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* 4. CRM TAB NAVIGATION BAR */}
            <div className="border-b border-slate-200 pt-4">
                <div className="flex gap-6 -mb-px">
                    {[
                        { id: 'overview', name: 'Overview', count: null },
                        { id: 'assets', name: 'Marketing Assets', count: marketingAssets.length || null },
                        { id: 'history', name: 'Feedback & History', count: logs.length || null }
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${isActive
                                    ? 'border-brand-accent text-brand-accent'
                                    : 'border-transparent text-slate-400 hover:text-slate-650'
                                    }`}
                            >
                                {tab.name}
                                {tab.count !== null && (
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-brand-accent/10 text-brand-accent' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 5. TAB CONTENTS */}
            <div className="space-y-8 pt-2">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-200">
                        {/* Basic Information Card */}
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-3xs space-y-8">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                                <FileText size={13} className="text-slate-400" /> Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                {/* Category */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <FolderKanban size={11} className="text-slate-350" /> Category / Cluster
                                    </label>
                                    {isEditing ? (
                                        <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-slate-450 transition-all mt-1" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
                                            {lookups.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800 mt-1 pl-[17px]">{cat}</p>
                                    )}
                                </div>

                                {/* Section */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <FolderKanban size={11} className="text-slate-350" /> Section Taxonomy
                                    </label>
                                    {isEditing ? (
                                        <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-slate-450 transition-all mt-1" value={form.section_id} onChange={(e) => setForm({ ...form, section_id: Number(e.target.value) })}>
                                            {lookups.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800 mt-1 pl-[17px]">{sec}</p>
                                    )}
                                </div>

                                {/* Associated Product */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <Tag size={11} className="text-slate-350" /> Associated Product
                                    </label>
                                    {isEditing ? (
                                        <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-slate-450 transition-all mt-1" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}>
                                            {lookups.productTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800 mt-1 pl-[17px]">{prod}</p>
                                    )}
                                </div>

                                {/* Content Theme */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <Sparkles size={11} className="text-slate-350" /> Content Theme
                                    </label>
                                    {isEditing ? (
                                        <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-450 transition-all mt-1" value={form.theme_id} onChange={(e) => setForm({ ...form, theme_id: e.target.value })}>
                                            <option value="">Select Theme...</option>
                                            {lookups.themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800 mt-1 pl-[17px]">{thm}</p>
                                    )}
                                </div>

                                {/* Target Persona */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <Target size={11} className="text-slate-350" /> Target Persona
                                    </label>
                                    {isEditing ? (
                                        <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-450 transition-all mt-1" value={form.persona_id} onChange={(e) => setForm({ ...form, persona_id: e.target.value })}>
                                            <option value="">Select Persona...</option>
                                            {lookups.personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800 mt-1 pl-[17px]">{per}</p>
                                    )}
                                </div>

                                {/* Target Month */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <Calendar size={11} className="text-slate-350" /> Target Month
                                    </label>
                                    {isEditing ? (
                                        <input type="date" className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-450 transition-all mt-1 cursor-pointer" value={form.production_month} onChange={(e) => setForm({ ...form, production_month: e.target.value })} />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800 mt-1 pl-[17px]">
                                            {form.production_month ? new Date(form.production_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '—'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Campaign Attribution Context */}
                            <div className="space-y-1 pt-4 border-t border-slate-100/60">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                    <Megaphone size={11} className="text-slate-350" /> Campaign Context
                                </label>
                                {isEditing ? (
                                    <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-450 transition-all mt-1" value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}>
                                        <option value="">Select Campaign...</option>
                                        {lookups.campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                ) : (
                                    <p className="text-sm font-bold text-slate-800 mt-1 pl-[17px]">{cmp}</p>
                                )}
                            </div>
                        </div>

                        {/* CRM metrics widgets grid (Lead score style) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Search Demand */}
                            <div className="bg-white border border-slate-200/65 rounded-xl p-4 flex items-center gap-4 shadow-3xs">
                                <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Flame size={18} className="text-orange-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Demand</span>
                                            <input type="number" className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none" value={form.demand} onChange={(e) => setForm({ ...form, demand: e.target.value })} />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-base font-black text-slate-900 tracking-tight leading-none tabular-nums truncate">
                                                {Number(form.demand).toLocaleString('id-ID')}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">Search Demand</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Search Intent */}
                            <div className="bg-white border border-slate-200/65 rounded-xl p-4 flex items-center gap-4 shadow-3xs">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Target size={18} className="text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Intent</span>
                                            <select className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 outline-none cursor-pointer" value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })}>
                                                <option value="Informational">Info</option>
                                                <option value="Commercial">Comm</option>
                                                <option value="Transactional">Trans</option>
                                                <option value="Navigational">Nav</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md w-fit truncate">
                                                {form.intent}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 truncate">Search Intent</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Lifecycle Type */}
                            <div className="bg-white border border-slate-200/65 rounded-xl p-4 flex items-center gap-4 shadow-3xs">
                                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Calendar size={18} className="text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Lifecycle</span>
                                            <select className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 outline-none cursor-pointer" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                                <option value="Evergreen">Evergreen</option>
                                                <option value="Seasonal">Seasonal</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md w-fit truncate">
                                                {form.type}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 truncate">Lifecycle Type</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="bg-white border border-slate-200/65 rounded-xl p-4 flex items-center gap-4 shadow-3xs">
                                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center shrink-0">
                                    <ShieldCheck size={18} className="text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Class</span>
                                            <select className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 outline-none cursor-pointer" value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })}>
                                                <option value="Artillery">Artillery</option>
                                                <option value="Infantry">Infantry</option>
                                                <option value="Hygiene">Hygiene</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-[11px] font-black text-red-600 bg-red-50/60 border border-red-100 px-2 py-0.5 rounded-md w-fit truncate">
                                                {form.classification}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 truncate">Classification</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SEO Copy Suite Card */}
                        <div className="bg-white p-8 border border-slate-200/60 rounded-2xl shadow-3xs space-y-6">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                                <FileText size={13} className="text-slate-400" /> SEO Copy Suite Validation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2 md:col-span-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <FileText size={11} className="text-slate-350" /> Target Focus Keyword
                                    </span>
                                    {isEditing ? (
                                        <textarea rows={3} className="w-full text-xs font-mono font-black text-slate-900 bg-slate-50/50 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:bg-white focus:border-slate-400 transition-all" value={form.target_keyword} onChange={(e) => setForm({ ...form, target_keyword: e.target.value })} required />
                                    ) : (
                                        <div className="w-full text-xs font-mono font-bold text-slate-700 bg-slate-50/70 border border-slate-200/60 rounded-xl p-4 min-h-20 leading-relaxed select-all">
                                            {form.target_keyword || '—'}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 md:grid-cols-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <FileText size={11} className="text-slate-350" /> Meta Description Tag
                                    </span>
                                    {isEditing ? (
                                        <textarea rows={3} className="w-full text-xs font-bold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:bg-white focus:border-slate-400 transition-all" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} required />
                                    ) : (
                                        <div className="w-full text-xs font-semibold text-slate-700 bg-slate-50/70 border border-slate-200/60 rounded-xl p-4 min-h-20 leading-relaxed">
                                            {form.meta_description || '—'}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-3 pt-4 border-t border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                        <Link2 size={11} className="text-slate-350" /> Internal Reference Link Maps
                                    </span>
                                    {isEditing ? (
                                        <textarea rows={2} className="w-full text-xs font-mono text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:bg-white focus:border-slate-400 transition-all" value={form.cta_internal_link} onChange={(e) => setForm({ ...form, cta_internal_link: e.target.value })} />
                                    ) : (
                                        <div className="w-full text-xs font-mono font-semibold text-slate-650 bg-slate-50/70 border border-slate-200/60 rounded-xl p-4 min-h-14 leading-relaxed break-all select-all">
                                            {form.cta_internal_link || 'No dynamic internal reference paths generated.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Marketing Assets Grid */}
                        <div className="bg-white p-8 border border-slate-200/60 rounded-2xl shadow-3xs space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* LEFT COLUMN: CTAs */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                                        <Link2 size={13} className="text-slate-400" /> Call To Actions (CTAs)
                                    </h4>
                                    <div className="space-y-2.5">
                                        {loadingAssets ? (
                                            <div className="flex items-center gap-1.5 py-4 text-slate-400">
                                                <Loader2 size={12} className="animate-spin" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Fetching...</span>
                                            </div>
                                        ) : marketingAssets.filter(a => a.asset_type === 'cta').length > 0 ? (
                                            marketingAssets.filter(a => a.asset_type === 'cta').map((a, i) => (
                                                <div key={a.id} className="text-xs bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-2xs hover:border-slate-200 transition-colors">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CTA {i + 1}</div>
                                                    <a
                                                        href={a.asset_value}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-mono text-brand-accent hover:text-brand-navy underline break-all font-semibold leading-relaxed transition-colors cursor-pointer"
                                                    >
                                                        {a.asset_value}
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 font-bold italic py-4">No Call to Actions allocated.</p>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: PRODUCTS */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                                        <Package size={13} className="text-slate-400" /> Recommended Products
                                    </h4>
                                    <div className="space-y-2.5">
                                        {loadingAssets ? (
                                            <div className="flex items-center gap-1.5 py-4 text-slate-400">
                                                <Loader2 size={12} className="animate-spin" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Fetching...</span>
                                            </div>
                                        ) : marketingAssets.filter(a => a.asset_type === 'product').length > 0 ? (
                                            marketingAssets.filter(a => a.asset_type === 'product').map((a, i) => (
                                                <div key={a.id} className="text-xs bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-2xs hover:border-slate-200 transition-colors">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Product {i + 1}</div>
                                                    <div className="font-mono text-slate-700 font-bold leading-relaxed">
                                                        {a.asset_value}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 font-bold italic py-4">No recommended products.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* INTERACTIVE ASSET APPEND BAR */}
                            <div className="border-t border-slate-100/80 pt-6">
                                <form onSubmit={handleAddAsset} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-3xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Add Strategy Asset</span>
                                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Quick-log a CTA url or a Product recommendation card</p>
                                        </div>

                                        {/* TOGGLE BUTTONS */}
                                        <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit">
                                            <button
                                                type="button"
                                                onClick={() => setNewAssetType('cta')}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${newAssetType === 'cta' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-750'}`}
                                            >
                                                🔗 CTA
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewAssetType('product')}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${newAssetType === 'product' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-750'}`}
                                            >
                                                📦 Product Tag
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            required
                                            value={newAssetValue}
                                            onChange={(e) => setNewAssetValue(e.target.value)}
                                            placeholder={newAssetType === 'cta' ? "Enter asset URL destination link (e.g. https://www.ocbc.id/...)" : "Enter product slug or recommendation tag (e.g. tabungan)"}
                                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-slate-450 placeholder:text-slate-400/80 transition-all shadow-3xs"
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingAsset || !newAssetValue.trim()}
                                            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                                        >
                                            {submittingAsset ? <Loader2 size={13} className="animate-spin" /> : 'Add Asset'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {dbSnapshot?.internal_notes && dbSnapshot.internal_notes.trim() !== '' && (
                            <div className="bg-white p-8 border border-slate-200/60 rounded-2xl shadow-3xs space-y-3">
                                <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
                                    <MessageSquare size={14} className="text-slate-400" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Director Revision Notes</h4>
                                </div>
                                <div className="w-full text-xs font-bold text-orange-750 bg-orange-50 border border-orange-200/60 rounded-xl p-4 leading-relaxed">
                                    {dbSnapshot.internal_notes}
                                </div>
                            </div>
                        )}

                        <ArticleHistory logs={logs} />
                    </div>
                )}
            </div>
        </div>
    );
}