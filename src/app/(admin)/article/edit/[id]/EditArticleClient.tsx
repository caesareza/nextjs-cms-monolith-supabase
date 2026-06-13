'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ChevronLeft, CheckCircle2 } from 'lucide-react';
import {ArticleService} from "@/app/(admin)/article/service";
import HtmlEditor from '@/components/editor/HtmlEditor';

interface EditProps {
    initialData: any;
    writers: any[];
    categories: any[];
}

export default function EditArticleClient({ initialData, writers, categories }: EditProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // 1. Expanded initial state parsing to pull all new metadata fields safely
    const [form, setForm] = useState({
        title: initialData.title || '',
        content: initialData.content || '',
        writer_id: initialData.writer_id || 0,
        category_id: initialData.category_id || 0,
        product_id: initialData.product_id || '',
        status: initialData.status || 'draft',
        production_month: initialData.production_month || new Date().toISOString().split('T')[0],

        // Schema Matching Inputs
        content_old: initialData.content_old || '',
        meta_description: initialData.meta_description || '',
        target_keyword: initialData.target_keyword || '',
        cta_internal_link: initialData.cta_internal_link || '',
        seo_check: initialData.seo_check || 'pending',
        index_status: initialData.index_status || 'noindex',
        internal_notes: initialData.internal_notes || ''
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // const supabase = createClient();
            // const { data: { user } } = await supabase.auth.getUser();
            // const userEmail = user?.email || "system@ibox.co.id";

            // Passes updated dataset along with user logging context
            await ArticleService.updateArticle(initialData.id, form);

            setSuccess(true);
            setTimeout(() => {
                router.push('/article');
                router.refresh();
            }, 1500);
        } catch (err) {
            console.error("Update error:", err);
            alert("System failed to update record parameters.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-xl mx-auto mt-32 p-12 bg-white rounded-[3rem] text-center shadow-2xl animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Changes Synchronized</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Updating workflows...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleUpdate} className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-300">

            {/* ACTION BAR */}
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all cursor-pointer">
                    <ChevronLeft size={14} /> Discard Changes
                </button>

                <button
                    disabled={loading}
                    type="submit"
                    className="bg-[#EE1C25] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 flex items-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Push Updates
                </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm space-y-12">

                {/* HEADLINE */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Headline</label>
                    <input
                        className="w-full text-4xl font-black text-slate-900 border-b-2 border-slate-50 focus:border-[#EE1C25] outline-none pb-6 transition-all"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                    />
                </div>

                {/* CORE METADATA GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Writer</label>
                        <select
                            className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20"
                            value={form.writer_id}
                            onChange={(e) => setForm({...form, writer_id: parseInt(e.target.value)})}
                        >
                            {writers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select
                            className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20"
                            value={form.category_id}
                            onChange={(e) => setForm({...form, category_id: parseInt(e.target.value)})}
                        >
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                        <select
                            className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20"
                            value={form.status}
                            onChange={(e) => setForm({...form, status: e.target.value})}
                        >
                            <option value="draft">Draft</option>
                            <option value="ready for review">Ready for Review</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Tag</label>
                        <input
                            className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20"
                            value={form.product_id}
                            onChange={(e) => setForm({...form, product_id: e.target.value})}
                        />
                    </div>
                </div>

                {/* TIPTAP EDITING CANVAS */}
                <div className="pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Content Body (HTML Mode)</label>
                    <HtmlEditor
                        value={form.content}
                        onChange={(html: string) => setForm({...form, content: html})}
                    />
                </div>

                {/* --- OPTIMIZATION & LEGACY AUDIT CONTROL PANEL (GROUPED VIEW) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 border-t border-slate-100">

                    {/* LEFT: SEO STRATEGY (7 Columns wide) */}
                    <div className="lg:col-span-7 space-y-6">
                        <h3 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-50 pb-2">
                            SEO & Metadata Strategy
                        </h3>

                        {/* Target Focus Keyword */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Focus Keyword</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 transition-all"
                                placeholder="e.g., cara buka rekening online"
                                value={form.target_keyword}
                                onChange={(e) => setForm({...form, target_keyword: e.target.value})}
                            />
                        </div>

                        {/* Meta Description */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description Tag</label>
                                <span className={`text-[9px] font-bold ${form.meta_description.length > 160 ? 'text-red-500' : 'text-slate-300'}`}>
                  {form.meta_description.length}/160 chars
                </span>
                            </div>
                            <textarea
                                rows={3}
                                className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-medium border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 transition-all resize-none leading-relaxed"
                                placeholder="Brief summary matching Google search requirements..."
                                value={form.meta_description}
                                onChange={(e) => setForm({...form, meta_description: e.target.value})}
                            />
                        </div>

                        {/* CTA Internal Destination Link (Bigger Box) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CTA Internal Destination Link</label>
                            <textarea
                                rows={4}
                                className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-mono border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 transition-all leading-relaxed"
                                placeholder="Paste destination anchors or deep-linking tracking URLs here..."
                                value={form.cta_internal_link}
                                onChange={(e) => setForm({...form, cta_internal_link: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* RIGHT: INTERNAL CONTROLS & BACKUPS (5 Columns wide) */}
                    <div className="lg:col-span-5 space-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-[11px] font-black text-slate-950 uppercase tracking-widest pb-2 border-b border-slate-100">
                            Internal Controls & Backups
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Check</label>
                                <select
                                    className="w-full p-4 bg-white rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:border-[#EE1C25]/20"
                                    value={form.seo_check}
                                    onChange={(e) => setForm({...form, seo_check: e.target.value})}
                                >
                                    <option value="pending">⏳ Pending</option>
                                    <option value="pass">✅ Pass</option>
                                    <option value="fail">❌ Fail</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Index Status</label>
                                <select
                                    className="w-full p-4 bg-white rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:border-[#EE1C25]/20"
                                    value={form.index_status}
                                    onChange={(e) => setForm({...form, index_status: e.target.value})}
                                >
                                    <option value="noindex">🚫 Noindex</option>
                                    <option value="index">🌐 Index</option>
                                </select>
                            </div>
                        </div>

                        {/* Internal Editorial Notes */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Editorial Notes</label>
                            <textarea
                                rows={3}
                                className="w-full p-4 bg-white rounded-2xl text-xs font-medium border border-slate-100 outline-none focus:border-[#EE1C25]/20 transition-all resize-none leading-relaxed"
                                placeholder="Reviewer logs or audit context notes..."
                                value={form.internal_notes}
                                onChange={(e) => setForm({...form, internal_notes: e.target.value})}
                            />
                        </div>

                        {/* Legacy Backup Content */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legacy Backup Content (Content Old)</label>
                            <textarea
                                rows={6}
                                className="w-full p-4 bg-white rounded-2xl text-xs font-mono border border-slate-100 outline-none focus:border-[#EE1C25]/20 transition-all leading-relaxed"
                                placeholder="Raw source records fallback..."
                                value={form.content_old}
                                onChange={(e) => setForm({...form, content_old: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </form>
    );
}