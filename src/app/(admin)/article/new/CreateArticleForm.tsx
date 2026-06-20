'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { ArticleService} from "@/app/(admin)/article/service";

interface CreateProps {
    writers: any[];
    categories: any[];
    productTags: any[];
}

export default function CreateArticleClient({ writers, categories, productTags }: CreateProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        content: '',
        category_id: 0,
        product_id: 0,
        content_type: 'new',
        production_month: new Date().toISOString().split('T')[0],
        status: 'seo pending',
        approval: 'pending',
        target_keyword: '',
        meta_description: '',
        cta_internal_link: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Guard clause against unselected relation IDs
        if (!form.category_id || !form.product_id) {
            alert('Please select both a Category Cluster and a Product Tag.');
            return;
        }

        setLoading(true);
        try {
            await ArticleService.createArticle({
                title: form.title,
                content: '', // Explicitly pass an empty string since there is no editor on this form!
                category_id: form.category_id,
                product_id: form.product_id,
                status: form.status, // Defaults to 'seo pending'
                production_month: form.production_month,
                content_type: form.content_type as 'new' | 'adjust',
                target_keyword: form.target_keyword,
                meta_description: form.meta_description,
                cta_internal_link: form.cta_internal_link
            });

            router.push('/article');
            router.refresh();
        } catch (err) {
            console.error('Database Insertion Error:', err);
            alert('Failed to initialize strategy record brief in Supabase.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10 text-slate-900 animate-in fade-in duration-200">

            {/* 1. TOP CONTROL ROW */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        ← Back to Production Sheet
                    </button>
                </div>

                <button
                    disabled={loading || !form.target_keyword.trim() || !form.title.trim()}
                    type="submit"
                    className="bg-[#EE1C25] text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 disabled:opacity-30 transition-all shadow-md cursor-pointer"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Submit Strategy'}
                </button>
            </div>

            {/* MAIN WHITE CARD CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-10 shadow-sm">

                {/* 2. THE EDITORIAL HEADLINE */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proposed Headline Title</label>
                    <input
                        className="w-full text-3xl font-black text-slate-900 placeholder:text-slate-200 outline-none bg-transparent pb-4 border-b border-slate-100 focus:border-[#EE1C25]/30 transition-all"
                        placeholder="Enter article production title..."
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                        required
                    />
                </div>

                {/* 3. METADATA ROW PANEL - Optimally scaled to 3 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#EE1C25]/40 transition-all cursor-pointer"
                            value={form.category_id || ''}
                            onChange={(e) => setForm({...form, category_id: Number(e.target.value)})}
                            required
                        >
                            <option value="">Select Category...</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Product Tag</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#EE1C25]/40 transition-all cursor-pointer"
                            value={form.product_id || ''}
                            onChange={(e) => setForm({...form, product_id: Number(e.target.value)})}
                            required
                        >
                            <option value="">Select Product...</option>
                            {productTags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Campaign Month</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#EE1C25]/40 transition-all cursor-pointer"
                            value={form.production_month}
                            onChange={(e) => setForm({...form, production_month: e.target.value})}
                            required
                        />
                    </div>
                </div>

                {/* 4. SEO STRATEGY PIPELINE SECTION */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-l-4 border-[#EE1C25] pl-3">
                            SEO Requirements Strategy
                        </h3>

                        {/* CONTENT TYPE DROPDOWN MAPPED TO YOUR DB ENUM */}
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type:</label>
                            <select
                                className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-800 outline-none cursor-pointer focus:bg-white focus:border-[#EE1C25]/40 transition-all"
                                value={form.content_type}
                                onChange={(e) => setForm({...form, content_type: e.target.value})}
                                required
                            >
                                <option value="new">New Article</option>
                                <option value="adjust">Optimization / Adjust</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 md:col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Target Keyword</label>
                            <textarea
                                rows={4}
                                className="w-full text-xs font-bold text-slate-900 placeholder:text-slate-300 outline-none bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:border-[#EE1C25]/30 focus:bg-white resize-none transition-all leading-relaxed"
                                placeholder="Primary search phrases..."
                                value={form.target_keyword}
                                onChange={(e) => setForm({...form, target_keyword: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Meta Description Tag</label>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{form.meta_description.length} / 160</span>
                            </div>
                            <textarea
                                rows={4}
                                className="w-full text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:border-[#EE1C25]/30 focus:bg-white resize-none transition-all leading-relaxed"
                                placeholder="Write a clear Google search engine snippet summary parameters..."
                                value={form.meta_description}
                                onChange={(e) => setForm({...form, meta_description: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">CTA Internal Destination Links</label>
                        <textarea
                            rows={3}
                            className="w-full text-xs font-mono font-bold text-slate-700 placeholder:text-slate-300 outline-none bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:border-[#EE1C25]/30 focus:bg-white transition-all leading-relaxed"
                            placeholder="https://www.ocbc.id/en/article/..."
                            value={form.cta_internal_link}
                            onChange={(e) => setForm({...form, cta_internal_link: e.target.value})}
                        />
                    </div>
                </div>

                {/* 5. WRITER CANVAS SHIELD */}
                <div className="pt-6 border-t border-slate-100 relative">
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[0.5px] z-50 flex items-center justify-center rounded-2xl">
                        <div className="flex items-center gap-3 text-slate-500 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-sm">
                            <Lock size={14} className="text-slate-900" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Canvas Unlocks Post-SEO Approval</span>
                        </div>
                    </div>

                    <div className="opacity-10 pointer-events-none space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Article Content Body</label>
                        <div className="w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl" />
                    </div>
                </div>

            </div>
        </form>
    );
}