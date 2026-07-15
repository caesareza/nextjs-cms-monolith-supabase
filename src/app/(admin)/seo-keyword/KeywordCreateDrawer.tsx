// app/(admin)/seo-keyword/KeywordCreateDrawer.tsx
'use client';

import { useState } from 'react';
import { X, Loader2, FolderKanban, Tag, Sparkles, Target, Calendar, Flame, ShieldCheck, Megaphone } from 'lucide-react';
import { LookupOptions } from '@/types/article';

interface KeywordCreateDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: any) => Promise<void>;
    options: LookupOptions;
}

export default function KeywordCreateDrawer({ isOpen, onClose, onSubmit, options }: KeywordCreateDrawerProps) {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        category_id: '',
        section_id: '',
        product_id: '',
        content_type: 'new',
        production_month: new Date().toISOString().split('T')[0],
        status: 'seo pending',
        demand: '',
        intent: 'Informational',
        type: 'Evergreen',
        classification: 'Infantry',
        theme_id: '',
        persona_id: '',
        campaign_id: '',
        target_keyword: '',
        meta_description: '',
        cta_internal_link: ''
    });

    if (!isOpen) return null;

    const handleSubmitInternal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await onSubmit(form);
            setForm({
                title: '',
                category_id: '',
                section_id: '',
                product_id: '',
                content_type: 'new',
                production_month: new Date().toISOString().split('T')[0],
                status: 'seo pending',
                demand: '',
                intent: 'Informational',
                type: 'Evergreen',
                classification: 'Infantry',
                theme_id: '',
                persona_id: '',
                campaign_id: '',
                target_keyword: '',
                meta_description: '',
                cta_internal_link: ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-slate-50 h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">

                {/* DRAW HEADER PANEL */}
                <div className="flex items-center justify-between border-b border-slate-200/60 bg-white px-8 py-5 shrink-0">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">New Strategy Brief</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Initialize core focus requirements</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* SCROLLABLE COMPONENT CORE FORM BODY */}
                <form onSubmit={handleSubmitInternal} className="flex-1 overflow-y-auto p-8 space-y-8 pb-24">

                    {/* SECTION 1: IDENTITY SUITE */}
                    <div className="bg-white p-6 border border-slate-200/70 rounded-3xl space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-brand-accent rounded-xs" /> Content Taxonomy Cluster
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Step 1 of 3</span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proposed Headline Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all placeholder:text-slate-300"
                                placeholder="Enter content concept topic header..."
                                value={form.title}
                                onChange={(e) => setForm({...form, title: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><FolderKanban size={11}/> Category Cluster</label>
                                <select className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})} required>
                                    <option value="">Select Cluster...</option>
                                    {options.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><FolderKanban size={11}/> Section Taxonomy</label>
                                <select className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.section_id} onChange={(e) => setForm({...form, section_id: e.target.value})} required>
                                    <option value="">Select Section...</option>
                                    {options.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Tag size={11}/> Core Product Tag</label>
                            <select className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.product_id} onChange={(e) => setForm({...form, product_id: e.target.value})} required>
                                <option value="">Select Related Product Matrix...</option>
                                {options.productTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* SECTION 2: MARKETING STRATEGY TARGETS */}
                    <div className="bg-white p-6 border border-slate-200/70 rounded-3xl space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-brand-accent rounded-xs" /> Market Alignment Matrix
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Step 2 of 3</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Sparkles size={11}/> Strategy Theme</label>
                                <select className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.theme_id} onChange={(e) => setForm({...form, theme_id: e.target.value})}>
                                    <option value="">Select Campaign Theme...</option>
                                    {options.themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Target size={11}/> Target Persona</label>
                                <select className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.persona_id} onChange={(e) => setForm({...form, persona_id: e.target.value})}>
                                    <option value="">Select Target Audience...</option>
                                    {options.personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Strategy Execution Type</label>
                                <select className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.content_type} onChange={(e) => setForm({...form, content_type: e.target.value})} required>
                                    <option value="new">New Article</option>
                                    <option value="adjust">Optimization / Refresh</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Calendar size={11}/> Target Month</label>
                                <input type="date" className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.production_month} onChange={(e) => setForm({...form, production_month: e.target.value})} required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Megaphone size={11}/> Campaign Context</label>
                            <select className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.campaign_id} onChange={(e) => setForm({...form, campaign_id: e.target.value})}>
                                <option value="">Select Related Campaign Attribution...</option>
                                {options.campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* SECTION 3: SEO SUITE METRICS & DATA CORES */}
                    <div className="bg-white p-6 border border-slate-200/70 rounded-3xl space-y-5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-brand-accent rounded-xs" /> Performance Analytics & Suite
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Step 3 of 3</span>
                        </div>

                        {/* Operational Classification dropdown select parameter */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                                <ShieldCheck size={11} className="text-brand-accent" /> Content Operational Classification
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                                value={form.classification}
                                onChange={(e) => setForm({...form, classification: e.target.value})}
                                required
                            >
                                <option value="Artillery">Artillery</option>
                                <option value="Infantry">Infantry</option>
                                <option value="Hygiene">Hygiene</option>
                            </select>
                        </div>

                        {/* Search Metrics Tri-Grid Panel */}
                        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1"><Flame size={10} className="text-orange-500"/> Search Vol</label>
                                <input type="number" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-light-blue/30" placeholder="E.g. 1000" value={form.demand} onChange={(e) => setForm({...form, demand: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Search Intent</label>
                                <select className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.intent} onChange={(e) => setForm({...form, intent: e.target.value})}>
                                    <option value="Informational">Informational</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Transactional">Transactional</option>
                                    <option value="Navigational">Navigational</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Lifecycle Type</label>
                                <select className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                                    <option value="Evergreen">Evergreen</option>
                                    <option value="Seasonal">Seasonal</option>
                                </select>
                            </div>
                        </div>

                        {/* Composition Technical Parameters Sector */}
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Focus Keyword</label>
                                <textarea rows={2} className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white resize-none transition-all placeholder:text-slate-300" placeholder="Primary deep intent search phrase..." value={form.target_keyword} onChange={(e) => setForm({...form, target_keyword: e.target.value})} required />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Meta Description Tag</label>
                                <textarea rows={2} className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:bg-white resize-none transition-all placeholder:text-slate-300" placeholder="Google snippet summary parameter descriptions..." value={form.meta_description} onChange={(e) => setForm({...form, meta_description: e.target.value})} required />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">CTA Destination Links</label>
                                <input type="url" className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all placeholder:text-slate-300" placeholder="https://ocbc.id/..." value={form.cta_internal_link} onChange={(e) => setForm({...form, cta_internal_link: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </form>

                {/* IMMUTABLE FLOATING DRAWER FOOTER SUBMIT ACTIONS SWITCH */}
                <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200/80 p-5 flex gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] shrink-0 z-10">
                    <button type="button" onClick={onClose} className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-wider rounded-xl transition-all">
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={submitLoading || !form.title.trim() || !form.target_keyword.trim()}
                        onClick={handleSubmitInternal}
                        className="flex-1 py-3.5 bg-brand-accent hover:bg-brand-navy disabled:opacity-40 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl transition-all shadow-md shadow-brand-accent/20 flex items-center justify-center gap-2"
                    >
                        {submitLoading ? <Loader2 size={14} className="animate-spin" /> : 'Commit Strategy Data'}
                    </button>
                </div>

            </div>
        </div>
    );
}