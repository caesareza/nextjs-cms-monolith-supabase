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

    const [form, setForm] = useState({
        title: initialData.title || '',
        content: initialData.content || '',
        writer_id: initialData.writer_id || 0,
        category_id: initialData.category_id || 0,
        product_id: initialData.product_id || '',
        status: initialData.status || 'draft',
        production_month: initialData.production_month || new Date().toISOString().split('T')[0],
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await ArticleService.updateArticle(initialData.id, form);
            setSuccess(true);
            setTimeout(() => {
                router.push('/article');
                router.refresh();
            }, 2000);
        } catch (err) {
            console.error("Update error:", err);
            alert("System failed to update. Check your connection.");
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
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Data Synchronized</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Redirecting to article list...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleUpdate} className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* ACTION BAR */}
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all cursor-pointer">
                    <ChevronLeft size={14} /> Discard
                </button>

                <div className="flex gap-3">
                    <button
                        disabled={loading}
                        type="submit"
                        className="bg-[#EE1C25] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 flex items-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Push Changes
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm space-y-12">
                {/* TITLE SECTION */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Article Headline</label>
                    <input
                        className="w-full text-4xl font-black text-slate-900 border-b-2 border-slate-50 focus:border-[#EE1C25] outline-none pb-6 transition-all"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                    />
                </div>

                {/* METADATA GRID */}
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product ID (Text)</label>
                        <input
                            className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20"
                            value={form.product_id}
                            placeholder="e.g: Nyala"
                            onChange={(e) => setForm({...form, product_id: e.target.value})}
                        />
                    </div>
                </div>

                {/* CONTENT SECTION (TIPTAP) */}
                <div className="pt-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Writing Canvas</label>
                    <HtmlEditor
                        value={form.content}
                        onChange={(html: string) => setForm({...form, content: html})}
                    />
                </div>
            </div>
        </form>
    );
}