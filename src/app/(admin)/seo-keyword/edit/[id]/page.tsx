'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArticleService } from "@/app/(admin)/article/service";
import { CategoryService } from "@/app/(admin)/category/service";
import { ProductTagService } from "@/app/(admin)/product-tag/service";
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, Edit2, Save, X, MessageSquare } from 'lucide-react';

export default function SeoDirectorReviewForm() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Action Button & Modal States ---
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [internalNote, setInternalNote] = useState('');

    // --- New Mode Switch States ---
    const [isEditing, setIsEditing] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [productTags, setProductTags] = useState<any[]>([]);

    // --- Raw API Snapshot Tracking ---
    const [dbSnapshot, setDbSnapshot] = useState<any>(null);

    // --- Core Form State ---
    const [form, setForm] = useState({
        title: '',
        category_id: 0,
        product_id: 0,
        content_type: 'new',
        target_keyword: '',
        meta_description: '',
        cta_internal_link: '',
        production_month: ''
    });

    // --- Meta Tracking for Workflow Logs ---
    const [articleMeta, setArticleMeta] = useState({
        status: '',
        approval: ''
    });

    const loadBriefDetails = useCallback(async () => {
        setLoading(true);
        try {
            const [data, c, p] = await Promise.all([
                ArticleService.getArticleById(Number(id)),
                CategoryService.getAllCategories(),
                ProductTagService.getProductTags()
            ]);

            setDbSnapshot(data);
            setCategories(c);
            setProductTags(p);

            // Hydrate local editable form state from database response
            setForm({
                title: data.title || '',
                category_id: data.category_id || 0,
                product_id: data.product_id || 0,
                content_type: data.content_type || 'new',
                target_keyword: data.target_keyword || '',
                meta_description: data.meta_description || '',
                cta_internal_link: data.cta_internal_link || '',
                production_month: data.production_month || ''
            });

            // Store original statuses for the workflow log transition
            setArticleMeta({
                status: data.status || '',
                approval: data.approval || ''
            });
        } catch (err) {
            console.error(err);
            alert('Failed to query core strategy document specifications.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) loadBriefDetails();
    }, [id, loadBriefDetails]);

    // --- CRITICAL DATA SAVE DISPATCH ---
    const handleSaveUpdates = async () => {
        setActionLoading(true);
        try {
            // Push parameters down and force 'seo pending' / 'pending' execution to trigger re-review
            await ArticleService.updateArticle(Number(id), {
                title: form.title,
                category_id: form.category_id,
                product_id: form.product_id,
                content_type: form.content_type as 'new' | 'adjust',
                target_keyword: form.target_keyword,
                meta_description: form.meta_description,
                cta_internal_link: form.cta_internal_link,
                content: '',
                production_month: form.production_month,
                status: 'seo pending',
                approval: 'pending'
            });
            setIsEditing(false);
            await loadBriefDetails(); // Refresh meta tags so review buttons pop back alive
        } catch (err) {
            console.error(err);
            alert('Failed to persist core updates.');
        } finally {
            setActionLoading(false);
        }
    };

    // --- GATEKEEPER PIPELINE STATE MOTIONS ---

    // 1. Approve Logic
    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await ArticleService.updateWorkflow({
                id: String(id),
                status: 'writing',
                approval: 'approved',
                oldStatus: articleMeta.status,
                oldApproval: articleMeta.approval
            });
            router.push('/seo-keyword');
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Transaction processing fault encountered during approval.');
        } finally {
            setIsApproving(false);
        }
    };

    // 2. Reject Logic (Submit from Modal)
    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!internalNote.trim()) return;

        setIsRejecting(true);
        setShowRejectModal(false);
        try {
            await ArticleService.updateWorkflow({
                id: String(id),
                status: 'seo pending',
                approval: 'rejected',
                oldStatus: articleMeta.status,
                oldApproval: articleMeta.approval,
                internal_notes: internalNote
            });
            router.push('/seo-keyword');
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Transaction processing fault encountered during rejection.');
        } finally {
            setIsRejecting(false);
            setInternalNote('');
        }
    };

    const isActionDisabled = isApproving || isRejecting || actionLoading;
    const isApproved = articleMeta.status === 'writing' && articleMeta.approval === 'approved';

    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#EE1C25]" size={28} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Strategy Metrics...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-12 text-slate-900 animate-in fade-in duration-200">

            {/* 1. TOP BAR CONTROL ACTIONS CONSOLE */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <button onClick={() => router.back()} className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer">
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

                        {/* HIDE ACTION BUTTONS ENTIRELY ONCE STRATEGY IS APPROVED */}
                        {!isApproved && (
                            <>
                                <button
                                    disabled={isActionDisabled}
                                    onClick={() => setShowRejectModal(true)}
                                    className="border border-red-200 bg-red-50/50 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                                >
                                    <AlertTriangle size={16} /> Reject
                                </button>

                                <button
                                    disabled={isActionDisabled}
                                    onClick={handleApprove}
                                    className="bg-[#EE1D23] hover:bg-red-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isApproving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            Approve Strategy
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setIsEditing(false); loadBriefDetails(); }}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1"
                        >
                            <X size={13} /> Cancel
                        </button>
                        <button
                            disabled={actionLoading}
                            onClick={handleSaveUpdates}
                            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                            {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <><Save size={13} /> Save Changes</>}
                        </button>
                    </div>
                )}
            </div>

            {/* 2. LIVE ROADMAP NOTIFICATION PANEL */}
            {isApproved && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs font-medium animate-in fade-in">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <span>This focus architecture is approved. Saving any edits below will instantly reset the gate to pending for Director re-review.</span>
                </div>
            )}

            {/* 3. PROPOSED STRATEGY HEADLINE COMPONENT */}
            <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proposed Strategy Headline</span>
                {isEditing ? (
                    <input
                        className="w-full text-2xl font-black text-slate-900 border-b-2 border-slate-900 focus:border-[#EE1C25] outline-none pb-1 transition-all bg-slate-50/50 p-2 rounded-lg"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                    />
                ) : (
                    <h1 className="text-2xl font-black text-slate-900 leading-tight bg-transparent py-1 border-b border-slate-100">
                        {form.title}
                    </h1>
                )}
            </div>

            {/* 4. META PARAMETERS SELECTION STRIP ROW */}
            <div className="grid grid-cols-3 gap-6 border-b border-slate-100 pb-6">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category Cluster</span>
                    {isEditing ? (
                        <select className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none cursor-pointer w-full" value={form.category_id} onChange={(e) => setForm({...form, category_id: Number(e.target.value)})}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    ) : (
                        <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 w-fit uppercase tracking-wider">
                            {categories.find(c => c.id === form.category_id)?.name || 'Unspecified Cluster'}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Associated Product</span>
                    {isEditing ? (
                        <select className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none cursor-pointer w-full" value={form.product_id} onChange={(e) => setForm({...form, product_id: Number(e.target.value)})}>
                            {productTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    ) : (
                        <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 w-fit">
                            {productTags.find(t => t.id === form.product_id)?.name || 'Standard Financial Product'}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Campaign Intent Context</span>
                    {isEditing ? (
                        <select className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none cursor-pointer w-full" value={form.content_type} onChange={(e) => setForm({...form, content_type: e.target.value})}>
                            <option value="new">New Article</option>
                            <option value="adjust">Optimization / Adjust</option>
                        </select>
                    ) : (
                        <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 w-fit uppercase tracking-tight">
                            ⚡ {form.content_type === 'new' ? 'New Asset Launch' : 'Optimization / Upgrade'}
                        </p>
                    )}
                </div>
            </div>

            {/* 5. KEYWORD ASSETS TEXTAREAS CORE DISPLAY/EDIT CONSOLE */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-l-4 border-[#EE1C25] pl-3">
                    SEO Parameters Validation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5 md:col-span-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Focus Keyword</span>
                        {isEditing ? (
                            <textarea rows={3} className="w-full text-xs font-mono font-black text-slate-900 bg-white border border-slate-300 rounded-xl p-3 resize-none outline-none focus:border-slate-400" value={form.target_keyword} onChange={(e) => setForm({...form, target_keyword: e.target.value})} />
                        ) : (
                            <div className="w-full text-xs font-mono font-black text-slate-900 bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-20 leading-relaxed">
                                {form.target_keyword || '—'}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Validated Meta Description Tag</span>
                        {isEditing ? (
                            <textarea rows={3} className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl p-3 resize-none outline-none focus:border-slate-400" value={form.meta_description} onChange={(e) => setForm({...form, meta_description: e.target.value})} />
                        ) : (
                            <div className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-20 leading-relaxed">
                                {form.meta_description || '—'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Internal Reference Linking Anchor Maps</span>
                    {isEditing ? (
                        <textarea rows={2} className="w-full text-xs font-mono text-slate-600 bg-white border border-slate-300 rounded-xl p-3 resize-none outline-none focus:border-slate-400" value={form.cta_internal_link} onChange={(e) => setForm({...form, cta_internal_link: e.target.value})} />
                    ) : (
                        <div className="w-full text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-14 leading-relaxed break-all">
                            {form.cta_internal_link || 'No customized internal structural links requested.'}
                        </div>
                    )}
                </div>
            </div>

            {/* 6. IMMUTABLE HISTORIC REJECTION NOTES BLOCK */}
            {dbSnapshot?.internal_notes && dbSnapshot.internal_notes.trim() !== '' && (
                <div className="pt-6 border-t border-slate-100 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-slate-800">
                        <MessageSquare size={14} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Director Revision Notes</h4>
                    </div>
                    <div className="w-full text-xs font-bold text-red-700 bg-red-50/60 border border-red-100 rounded-2xl p-4 leading-relaxed select-none">
                        {dbSnapshot.internal_notes}
                    </div>
                </div>
            )}

            {/* 7. INLINE MODAL OVERLAY FOR REJECTIONS */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Strategy</h3>
                        <p className="text-sm text-slate-500 mb-4">Please provide an internal note explaining the rejection reasons for the team.</p>

                        <form onSubmit={handleRejectSubmit}>
                            <textarea
                                required
                                rows={4}
                                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                placeholder="Type internal feedback here..."
                                value={internalNote}
                                onChange={(e) => setInternalNote(e.target.value)}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
                                    onClick={() => { setShowRejectModal(false); setInternalNote(''); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!internalNote.trim() || isRejecting}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-xl disabled:opacity-50 transition"
                                >
                                    {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}