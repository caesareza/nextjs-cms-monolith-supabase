'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle, CheckCircle2, ChevronLeft, Activity } from 'lucide-react';
import { ArticleService } from '../service';
import HtmlEditor from "@/components/editor/HtmlEditor";

export default function CreateArticleClient({ writers, categories }: { writers: any[], categories: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        content: '',
        writer_id: 0,
        category_id: 0,
        product_id: '',
        status: 'draft', // Default value
        production_month: new Date().toISOString().split('T')[0],

        // New Fields from Schema Matrix
        content_old: '',
        meta_description: '',
        target_keyword: '',
        cta_internal_link: '',
        seo_check: 'pending', // e.g., pending, pass, fail
        index_status: 'noindex', // e.g., noindex, indexed
        internal_notes: ''
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!form.title.trim()) return setError("Title is required");
        if (form.writer_id === 0) return setError("Please select a writer");
        if (form.category_id === 0) return setError("Please select a category");

        setLoading(true);
        try {
            await ArticleService.createArticle(form);
            setSuccess(true);
            setTimeout(() => router.push('/article'), 2000);
        } catch (err: any) {
            setError(err.message || "Failed to create article.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-xl mx-auto mt-32 p-12 bg-white rounded-[3rem] border border-slate-100 shadow-2xl text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Draft Initialized</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Returning to list...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-8">
            {/* ACTION BAR */}
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all cursor-pointer">
                    <ChevronLeft size={14} /> Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#EE1C25] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 flex items-center gap-3 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Article
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-3 text-red-600 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm space-y-12">
                {/* TITLE */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headline</label>
                    <input
                        autoFocus
                        className="w-full text-4xl font-black text-slate-900 border-b-2 border-slate-50 focus:border-[#EE1C25] outline-none pb-6 transition-all"
                        placeholder="New Article Title..."
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                    />
                </div>

                {/* METADATA GRID (Now 4 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Writer</label>
                        <select
                            className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 cursor-pointer"
                            value={form.writer_id}
                            onChange={(e) => setForm({...form, writer_id: parseInt(e.target.value)})}
                        >
                            <option value={0}>Assign Writer</option>
                            {writers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select
                            className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 cursor-pointer"
                            value={form.category_id}
                            onChange={(e) => setForm({...form, category_id: parseInt(e.target.value)})}
                        >
                            <option value={0}>Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* NEW STATUS DROPDOWN */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={12} className="text-[#EE1C25]" /> Status
                        </label>
                        <select
                            className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 cursor-pointer"
                            value={form.status}
                            onChange={(e) => setForm({...form, status: e.target.value})}
                        >
                            <option value="draft">Draft</option>
                            <option value="ready for review">Ready for Review</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    {/* NEW: Product ID Free Text */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Product Tag
                        </label>
                        <input
                            type="text"
                            placeholder="e.g: Nyala, OCBC"
                            className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 transition-all"
                            value={form.product_id}
                            onChange={(e) => setForm({...form, product_id: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4 max-w-xs">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Production Date</label>
                    <input
                        type="date"
                        className="w-full p-4 mt-2 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white"
                        value={form.production_month}
                        onChange={(e) => setForm({...form, production_month: e.target.value})}
                    />
                </div>

                {/* EDITOR */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Content Body (HTML Mode)
                    </label>
                    <HtmlEditor
                        value={form.content}
                        onChange={(htmlValue) => setForm({ ...form, content: htmlValue })}
                    />
                </div>


                {/* --- OPTIMIZATION & LEGACY AUDIT CONTROL PANEL --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 border-t border-slate-100">

                    {/* LEFT COLUMN: SEO & STRATEGY (Spans 7 out of 12 columns) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <h3 className="text-[11px] font-black text-slate-950 uppercase tracking-widest">
                                SEO & Metadata Strategy
                            </h3>
                        </div>

                        {/* Target Focus Keyword (Full Width of Left Column) */}
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

                        {/* Meta Description Tag */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description Tag</label>
                                <span className={`text-[9px] font-bold ${form.meta_description.length > 160 ? 'text-red-500' : 'text-slate-300'}`}>
          {form.meta_description.length}/160 chars
        </span>
                            </div>
                            <textarea
                                rows={5}
                                className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-medium border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 transition-all resize-none leading-relaxed"
                                placeholder="Brief summary matching Google's search result snippet parameters..."
                                value={form.meta_description}
                                onChange={(e) => setForm({...form, meta_description: e.target.value})}
                            />
                        </div>

                        {/* CTA Internal Destination Link (Bigger Textarea) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CTA Internal Destination Link</label>
                            <textarea
                                rows={4}
                                className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-mono border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 transition-all leading-relaxed"
                                placeholder="e.g., https://www.ocbc.id/id/individu/simpanan/nyala&#10;Paste destination anchors or deep-linking funnels here..."
                                value={form.cta_internal_link}
                                onChange={(e) => setForm({...form, cta_internal_link: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: REVIEWS, AUDITS & BACKUPS (Spans 5 out of 12 columns) */}
                    <div className="lg:col-span-5 space-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-[11px] font-black text-slate-950 uppercase tracking-widest pb-2 border-b border-slate-100">
                            Internal Controls & Backups
                        </h3>

                        {/* Dropdowns side by side for compact layout */}
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
                                placeholder="Notes for reviewers or team production context..."
                                value={form.internal_notes}
                                onChange={(e) => setForm({...form, internal_notes: e.target.value})}
                            />
                        </div>

                        {/* Legacy Backup Content (Content Old) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legacy Backup Content (Content Old)</label>
                            <textarea
                                rows={2}
                                className="w-full p-4 bg-white rounded-2xl text-xs font-mono border border-slate-100 outline-none focus:border-[#EE1C25]/20 transition-all leading-relaxed"
                                placeholder=""
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