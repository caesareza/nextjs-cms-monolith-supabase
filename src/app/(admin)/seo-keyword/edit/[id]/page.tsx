'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArticleService } from "@/app/(admin)/article/service";
import { CategoryService } from "@/app/(admin)/category/service";
import { SectionService } from "@/app/(admin)/section/service";
import { ProductTagService } from "@/app/(admin)/product-tag/service";
import { ThemeService } from "@/app/(admin)/theme/service";
import { PersonaService } from "@/app/(admin)/persona/service";
import { CampaignService } from "@/app/(admin)/campaign/service";
import { Loader2 } from 'lucide-react';
import StrategyDetailView from './StrategyDetailView';
import { EditFormState, LookupOptions } from '@/types/article';

export default function SeoDirectorReviewFormShell() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [internalNote, setInternalNote] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [dbSnapshot, setDbSnapshot] = useState<any>(null);
    const [lookups, setLookups] = useState<LookupOptions>({
        categories: [], sections: [], productTags: [], themes: [], personas: [], campaigns: []
    });

    const [form, setForm] = useState<EditFormState>({
        title: '', category_id: 0, section_id: 0, product_id: 0, content_type: 'new',
        production_month: '', demand: '', intent: 'Informational', type: 'Evergreen', classification: 'Infantry',
        theme_id: '', persona_id: '', campaign_id: '', target_keyword: '', meta_description: '', cta_internal_link: ''
    });

    const [articleMeta, setArticleMeta] = useState({ status: '', approval: '' });

    const loadBriefDetails = useCallback(async () => {
        setLoading(true);
        try {
            const [data, c, secData, p, t, per, cmp] = await Promise.all([
                ArticleService.getArticleById(Number(id)),
                CategoryService.getCategories(),
                SectionService.getSections({ page: 1, limit: 100, search: '' }).then(res => res.sections),
                ProductTagService.getProductTags({ page: 1, limit: 100, search: '' }).then(res => res.productTags),
                ThemeService.getThemes(),
                PersonaService.getPersonas(),
                CampaignService.getCampaigns()
            ]);

            setDbSnapshot(data);
            setLookups({ categories: c, sections: secData, productTags: p, themes: t, personas: per, campaigns: cmp });

            setForm({
                title: data.title || '',
                category_id: data.category_id || 0,
                section_id: data.section_id || 0,
                product_id: data.product_id || 0,
                content_type: data.content_type || 'new',
                production_month: data.production_month ? data.production_month.split('T')[0] : '',
                demand: String(data.demand || 0),
                intent: data.intent || 'Informational',
                type: data.type || 'Evergreen',
                classification: data.classification || 'Infantry',
                theme_id: data.theme_id ? String(data.theme_id) : '',
                persona_id: data.persona_id ? String(data.persona_id) : '',
                campaign_id: data.campaign_id ? String(data.campaign_id) : '',
                target_keyword: data.target_keyword || '',
                meta_description: data.meta_description || '',
                cta_internal_link: data.cta_internal_link || ''
            });

            setArticleMeta({ status: data.status || '', approval: data.approval || '' });
        } catch (err) {
            alert('Failed to query strategy specifications.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) loadBriefDetails();
    }, [id, loadBriefDetails]);

    const handleSaveUpdates = async () => {
        setActionLoading(true);
        try {
            await ArticleService.updateArticle(Number(id), {
                title: form.title,
                category_id: Number(form.category_id),
                section_id: Number(form.section_id),
                product_id: Number(form.product_id),
                content_type: form.content_type as any,
                production_month: form.production_month,
                demand: parseInt(form.demand, 10) || 0,
                intent: form.intent,
                type: form.type,
                classification: form.classification,
                theme_id: form.theme_id ? Number(form.theme_id) : null,
                persona_id: form.persona_id ? Number(form.persona_id) : null,
                campaign_id: form.campaign_id ? Number(form.campaign_id) : null,
                target_keyword: form.target_keyword,
                meta_description: form.meta_description,
                cta_internal_link: form.cta_internal_link,
                content: '', status: 'seo pending', approval: 'pending'
            });
            setIsEditing(false);
            await loadBriefDetails();
        } catch (err) {
            alert('Failed to save updates.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await ArticleService.updateWorkflow({
                id: String(id), status: 'writing', approval: 'approved',
                oldStatus: articleMeta.status, oldApproval: articleMeta.approval
            });
            router.push('/seo-keyword');
        } catch (err) {
            alert('Approval pipeline transaction fault.');
        } finally {
            setIsApproving(false);
        }
    };

    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRejecting(true);
        setShowRejectModal(false);
        try {
            await ArticleService.updateWorkflow({
                id: String(id), status: 'seo pending', approval: 'rejected',
                oldStatus: articleMeta.status, oldApproval: articleMeta.approval, internal_notes: internalNote
            });
            router.push('/seo-keyword');
        } catch (err) {
            alert('Rejection pipeline transaction fault.');
        } finally {
            setIsRejecting(false);
            setInternalNote('');
        }
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-brand-accent" size={28} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Strategy Metrics...</p>
            </div>
        );
    }

    return (
        <>
            <StrategyDetailView
                form={form} setForm={setForm} isEditing={isEditing} setIsEditing={setIsEditing}
                isApproved={articleMeta.status === 'writing' && articleMeta.approval === 'approved'}
                isActionDisabled={isApproving || isRejecting || actionLoading}
                actionLoading={actionLoading} dbSnapshot={dbSnapshot} lookups={lookups}
                onBack={() => router.back()} onSave={handleSaveUpdates} onApprove={handleApprove}
                onRejectClick={() => setShowRejectModal(true)}
            />

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-150">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Strategy</h3>
                        <p className="text-sm text-slate-500 mb-4">Provide internal revision notes explaining the update conditions required.</p>
                        <form onSubmit={handleRejectSubmit}>
                            <textarea
                                required rows={4}
                                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none resize-none focus:ring-2 focus:ring-brand-accent/40"
                                placeholder="Type internal feedback here..."
                                value={internalNote}
                                onChange={(e) => setInternalNote(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl" onClick={() => { setShowRejectModal(false); setInternalNote(''); }}>Cancel</button>
                                <button type="submit" disabled={!internalNote.trim() || isRejecting} className="bg-brand-accent hover:bg-brand-navy text-white px-4 py-2 text-sm font-medium rounded-xl disabled:opacity-40">Confirm Reject</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}