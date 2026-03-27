'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {ArticleService} from "@/app/(admin)/article/service";
import { Save, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function CreateArticleClient({ writers, categories }: { writers: any[], categories: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [form, setForm] = useState({
        title: '',
        content: '',
        writer_id: 0,
        category_id: 0,
        production_month: new Date().toISOString().split('T')[0], // yyyy-mm-dd
    });

    const mdeOptions = useMemo(() => ({ spellChecker: false, status: false }), []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side Validation
        if (!form.title.trim()) return setError("Article title is required.");
        if (!form.content.trim()) return setError("Article content cannot be empty.");
        if (form.writer_id === 0) return setError("Please select a writer.");
        if (form.category_id === 0) return setError("Please select a category.");

        setLoading(true);
        try {
            await ArticleService.createArticle(form);
            setSuccess(true);

            // Auto-redirect after 3 seconds
            setTimeout(() => {
                router.push('/article');
                router.refresh();
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to save to database. Check field constraints.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-12 bg-white rounded-[3rem] border border-slate-100 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Article Created!</h2>
                <p className="text-slate-500 font-bold">The draft has been initialized with "Pending" approval.</p>
                <div className="pt-6 flex flex-col gap-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Redirecting in 3 seconds...</p>
                    <button onClick={() => router.push('/article')} className="text-xs font-black text-[#EE1C25] uppercase tracking-widest flex items-center justify-center gap-2">
                        Click here to go now <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="max-w-5xl mx-auto p-8 space-y-8">
            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm space-y-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">New Article</h1>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#EE1C25] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 flex items-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Initialize Draft
                    </button>
                </div>

                {/* TITLE */}
                <input
                    placeholder="Enter headline..."
                    className="w-full text-4xl font-black text-slate-900 border-b-2 border-slate-50 focus:border-[#EE1C25] outline-none pb-4 transition-all placeholder:text-slate-100"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                />

                {/* METADATA GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Writer</label>
                        <select
                            className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border border-slate-100 focus:bg-white focus:border-[#EE1C25]/20"
                            value={form.writer_id}
                            onChange={(e) => setForm({...form, writer_id: parseInt(e.target.value)})}
                        >
                            <option value={0}>Select Writer</option>
                            {writers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select
                            className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border border-slate-100 focus:bg-white focus:border-[#EE1C25]/20"
                            value={form.category_id}
                            onChange={(e) => setForm({...form, category_id: parseInt(e.target.value)})}
                        >
                            <option value={0}>Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Production Date</label>
                        <input
                            type="date"
                            className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border border-slate-100 focus:bg-white"
                            value={form.production_month}
                            onChange={(e) => setForm({...form, production_month: e.target.value})}
                        />
                    </div>
                </div>

                {/* EDITOR */}
                <div className="space-y-4 prose prose-slate max-w-none">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content Body</label>
                    <SimpleMDE value={form.content} onChange={(val) => setForm({...form, content: val})} options={mdeOptions} />
                </div>
            </div>
        </form>
    );
}