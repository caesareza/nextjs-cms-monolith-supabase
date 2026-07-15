'use client';

import { EditFormState, LookupOptions } from '@/types/article';
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
    Loader2
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
}

export default function StrategyDetailView({
                                               form, setForm, isEditing, setIsEditing, isApproved, isActionDisabled, actionLoading,
                                               dbSnapshot, lookups, onBack, onSave, onApprove, onRejectClick
                                           }: StrategyDetailViewProps) {

    const cat = lookups.categories.find(c => c.id === Number(form.category_id))?.name || 'Unspecified';
    const sec = lookups.sections.find(s => s.id === Number(form.section_id))?.name || 'Unspecified';
    const prod = lookups.productTags.find(t => t.id === Number(form.product_id))?.name || 'Standard Product';
    const thm = lookups.themes.find(t => t.id === Number(form.theme_id))?.name || 'General Campaign Theme';
    const per = lookups.personas.find(p => p.id === Number(form.persona_id))?.name || 'All Target Profiles';
    const cmp = lookups.campaigns.find(c => c.id === Number(form.campaign_id))?.name || 'Organic Strategy';

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-12 text-slate-900">
            {/* 1. TOP BAR CONTROL ACTIONS */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer">
                    <ArrowLeft size={14} /> Back to Sandbox Matrix
                </button>

                {!isEditing ? (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(true)}
                            disabled={isActionDisabled}
                            className="text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition cursor-pointer disabled:opacity-50"
                        >
                            <Edit2 size={16} /> Edit Brief
                        </button>

                        {!isApproved && (
                            <>
                                <button
                                    disabled={isActionDisabled}
                                    onClick={onRejectClick}
                                    className="border border-brand-accent/20 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                                >
                                    <AlertTriangle size={16} /> Reject
                                </button>
                                <button
                                    disabled={isActionDisabled}
                                    onClick={onApprove}
                                    className="bg-brand-accent hover:bg-brand-navy text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition shadow-sm cursor-pointer disabled:opacity-70"
                                >
                                    <CheckCircle size={16} /> Approve Strategy
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
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs font-medium">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <span>This focus architecture is approved. Saving any edits below will instantly reset the gate to pending for Director re-review.</span>
                </div>
            )}

            {/* 3. PROPOSED HEADLINE */}
            <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proposed Strategy Headline</span>
                {isEditing ? (
                    <input
                        className="w-full text-xl font-bold text-slate-900 border-b-2 border-slate-950 focus:border-brand-accent outline-none pb-1 transition-all bg-slate-50/70 p-3 rounded-xl"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                        required
                    />
                ) : (
                    <h1 className="text-2xl font-black text-slate-900 leading-tight bg-transparent py-1 border-b border-slate-100">
                        {form.title}
                    </h1>
                )}
            </div>

            {/* 4. TAXONOMY MATRIX LAYOUT GROUP */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-l-4 border-brand-accent pl-3">
                    Taxonomy Cluster Allocations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 border border-slate-200 rounded-3xl shadow-xs">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><FolderKanban size={11}/> Category / Cluster</span>
                        {isEditing ? (
                            <select className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer w-full" value={form.category_id} onChange={(e) => setForm({...form, category_id: Number(e.target.value)})}>
                                {lookups.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        ) : (
                            <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">{cat}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><FolderKanban size={11}/> Section Taxonomy</span>
                        {isEditing ? (
                            <select className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer w-full" value={form.section_id} onChange={(e) => setForm({...form, section_id: Number(e.target.value)})}>
                                {lookups.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        ) : (
                            <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">{sec}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Tag size={11}/> Associated Product</span>
                        {isEditing ? (
                            <select className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer w-full" value={form.product_id} onChange={(e) => setForm({...form, product_id: Number(e.target.value)})}>
                                {lookups.productTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        ) : (
                            <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">{prod}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Strategy Type Intent</span>
                        {isEditing ? (
                            <select className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer w-full" value={form.content_type} onChange={(e) => setForm({...form, content_type: e.target.value})}>
                                <option value="new">New Article</option>
                                <option value="adjust">Optimization / Refresh</option>
                            </select>
                        ) : (
                            <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 uppercase tracking-wider">
                                ⚡ {form.content_type === 'new' ? 'New Asset Launch' : 'Optimization'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. AUDIENCE & STRATEGY MATRICES */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-l-4 border-brand-accent pl-3">
                    Marketing Strategy Matrix
                </h3>

                <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Sparkles size={11}/> Content Theme</span>
                            {isEditing ? (
                                <select className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none w-full" value={form.theme_id} onChange={(e) => setForm({...form, theme_id: e.target.value})}>
                                    <option value="">Select Theme...</option>
                                    {lookups.themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            ) : (
                                <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">{thm}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Target size={11}/> Target Persona</span>
                            {isEditing ? (
                                <select className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none w-full" value={form.persona_id} onChange={(e) => setForm({...form, persona_id: e.target.value})}>
                                    <option value="">Select Persona...</option>
                                    {lookups.personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            ) : (
                                <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">{per}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Calendar size={11}/> Target Month</span>
                            {isEditing ? (
                                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none" value={form.production_month} onChange={(e) => setForm({...form, production_month: e.target.value})} />
                            ) : (
                                <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                                    {form.production_month ? new Date(form.production_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '—'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Megaphone size={11}/> Campaign Context</span>
                        {isEditing ? (
                            <select className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none w-full" value={form.campaign_id} onChange={(e) => setForm({...form, campaign_id: e.target.value})}>
                                <option value="">Select Campaign...</option>
                                {lookups.campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        ) : (
                            <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">{cmp}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 6. METRICS PERFORMANCE DASHBOARD HUD */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 text-white p-6 rounded-[2rem] shadow-md">
                <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1"><Flame size={11} className="text-orange-400" /> Search Demand</span>
                    {isEditing ? (
                        <input type="number" className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none" value={form.demand} onChange={(e) => setForm({...form, demand: e.target.value})} />
                    ) : (
                        <p className="text-base font-black tracking-tight text-white tabular-nums">{Number(form.demand).toLocaleString('id-ID')}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Search Intent</span>
                    {isEditing ? (
                        <select className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none cursor-pointer" value={form.intent} onChange={(e) => setForm({...form, intent: e.target.value})}>
                            <option value="Informational">Informational</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Transactional">Transactional</option>
                            <option value="Navigational">Navigational</option>
                        </select>
                    ) : (
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-400">{form.intent}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Lifecycle Type</span>
                    {isEditing ? (
                        <select className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none cursor-pointer" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                            <option value="Evergreen">Evergreen</option>
                            <option value="Seasonal">Seasonal</option>
                        </select>
                    ) : (
                        <p className="text-xs font-black uppercase tracking-wider text-amber-400">{form.type}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1"><ShieldCheck size={11} className="text-red-400"/> Classification</span>
                    {isEditing ? (
                        <select className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none cursor-pointer" value={form.classification} onChange={(e) => setForm({...form, classification: e.target.value})}>
                            <option value="Artillery">Artillery</option>
                            <option value="Infantry">Infantry</option>
                            <option value="Hygiene">Hygiene</option>
                        </select>
                    ) : (
                        <p className="text-xs font-black uppercase tracking-wider text-red-400">{form.classification}</p>
                    )}
                </div>
            </div>

            {/* 7. TECHNICAL SEO PARAMETERS */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-l-4 border-brand-accent pl-3">
                    SEO Copy Suite Validation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5 md:col-span-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Focus Keyword</span>
                        {isEditing ? (
                            <textarea rows={3} className="w-full text-xs font-mono font-black text-slate-900 bg-white border border-slate-300 rounded-xl p-3 resize-none outline-none" value={form.target_keyword} onChange={(e) => setForm({...form, target_keyword: e.target.value})} required />
                        ) : (
                            <div className="w-full text-xs font-mono font-black text-slate-900 bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-20 leading-relaxed">{form.target_keyword || '—'}</div>
                        )}
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Meta Description Tag</span>
                        {isEditing ? (
                            <textarea rows={3} className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl p-3 resize-none outline-none" value={form.meta_description} onChange={(e) => setForm({...form, meta_description: e.target.value})} required />
                        ) : (
                            <div className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-20 leading-relaxed">{form.meta_description || '—'}</div>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Internal Reference Link Maps</span>
                    {isEditing ? (
                        <textarea rows={2} className="w-full text-xs font-mono text-slate-600 bg-white border border-slate-300 rounded-xl p-3 resize-none outline-none" value={form.cta_internal_link} onChange={(e) => setForm({...form, cta_internal_link: e.target.value})} />
                    ) : (
                        <div className="w-full text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-14 leading-relaxed break-all">
                            {form.cta_internal_link || 'No dynamic internal reference paths generated.'}
                        </div>
                    )}
                </div>
            </div>

            {/* 8. DIRECTOR REVISION HISTORIC FEEDBACK */}
            {dbSnapshot?.internal_notes && dbSnapshot.internal_notes.trim() !== '' && (
                <div className="pt-6 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-slate-800">
                        <MessageSquare size={14} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Director Revision Notes</h4>
                    </div>
                    <div className="w-full text-xs font-bold text-orange-750 bg-orange-50 border border-orange-200 rounded-2xl p-4 leading-relaxed">
                        {dbSnapshot.internal_notes}
                    </div>
                </div>
            )}
        </div>
    );
}