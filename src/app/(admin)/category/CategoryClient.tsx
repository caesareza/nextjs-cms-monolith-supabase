// app/(admin)/category/CategoryClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Tags, Hash, Calendar, Activity } from 'lucide-react';
import { CategoryService } from './service';

export default function CategoryClient() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Inline Edit states
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await CategoryService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed loading corporate categories matrix:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const created = await CategoryService.createCategory(newCategoryName.trim());
            setCategories([created, ...categories]);
            setNewCategoryName('');
        } catch (err) {
            alert("Error: Category name value might already exist.");
        }
    };

    const handleSaveUpdate = async (id: number) => {
        if (!editingName.trim()) return;
        try {
            await CategoryService.updateCategory(id, editingName.trim());
            setCategories(categories.map(c => c.id === id ? { ...c, name: editingName.trim() } : c));
            setEditingId(null);
        } catch (err) {
            alert("Error saving category configuration changes.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to safely archive this Category?")) return;
        try {
            await CategoryService.softDeleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            console.error("Soft delete processing failed:", err);
            alert("Failed to move item entry to archive trash.");
        }
    };

    // Helper mapping pill style backgrounds dynamically to preserve Screenshot taxonomy themes
    const getBadgeStyle = (name: string) => {
        if (name.startsWith('[I]')) return 'bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/20'; // Individu blue-teal hue
        if (name.startsWith('[U]')) return 'bg-amber-50 text-amber-700 border-amber-200';        // UKM Yellow hue
        if (name.startsWith('[K]')) return 'bg-sky-50 text-sky-700 border-sky-200';            // Korporasi Light Blue
        if (name.startsWith('[S]')) return 'bg-purple-50 text-purple-700 border-purple-200';    // Syariah Purple
        if (name.startsWith('OCBC') || name.endsWith('Banking')) return 'bg-orange-50 text-orange-700 border-orange-200'; // Channels
        return 'bg-slate-100 text-slate-700 border-slate-200';                                  // General fallback
    };

    return (
        <div className="space-y-8"> {/* Enforced Client Container Spacing Rule */}

            {/* BRAND HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                        <Tags size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Segment Sub-Taxonomies & Channels</p>
                    </div>
                </div>
                <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-slate-200/40 w-fit">
                    Active Sub-categories: {categories.length}
                </div>
            </div>

            {/* CREATION WRAPPER BAR */}
            <form onSubmit={handleCreate} className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex gap-3 items-center">
                <input
                    type="text"
                    placeholder="Use standard format labels, e.g., [K] Layanan or OCBC Mobile..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shrink-0">
                    <Plus size={14} /> Add Category
                </button>
            </form>

            {/* HIGH DENSITY TABULAR PRESENTATION DISPLAY */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                            <th className="px-8 py-5 font-black flex items-center gap-2"><Hash size={12}/> ID</th>
                            <th className="px-6 py-5 font-black">Sub-Taxonomy Node Tag</th>
                            <th className="px-6 py-5 font-black hidden md:table-cell"><Activity size={12} className="inline mr-1"/> Visibility</th>
                            <th className="px-6 py-5 font-black hidden sm:table-cell"><Calendar size={12} className="inline mr-1"/> Created Date</th>
                            <th className="px-8 py-5 font-black text-right">Actions</th>
                        </tr>
                        </thead>

                        {loading ? (
                            <tbody>
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="animate-spin text-slate-300" size={28} />
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Compiling active lookups...</span>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-100">
                            {categories.map((category) => (
                                <tr key={category.id} className="group hover:bg-slate-50/40 transition-colors">

                                    {/* Column 1: Alphanumeric Tabular System ID */}
                                    <td className="px-8 py-4.5 text-xs font-black text-slate-400 tabular-nums">
                                        #{category.id}
                                    </td>

                                    {/* Column 2: Structural Label Tag Context */}
                                    <td className="px-6 py-4.5">
                                        {editingId === category.id ? (
                                            <input
                                                type="text"
                                                className="px-3 py-1.5 border border-blue-500 bg-white rounded-xl text-xs font-bold outline-none text-slate-800 w-full max-w-sm shadow-sm"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span className={`px-3 py-1 border rounded-xl text-xs font-bold tracking-wide shadow-sm ${getBadgeStyle(category.name)}`}>
                                                    {category.name}
                                                </span>
                                        )}
                                    </td>

                                    {/* Column 3: Live Status parameters */}
                                    <td className="px-6 py-4.5 hidden md:table-cell">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active
                                            </span>
                                    </td>

                                    {/* Column 4: Created Timestamp */}
                                    <td className="px-6 py-4.5 text-[11px] font-bold text-slate-400 tracking-tight hidden sm:table-cell whitespace-nowrap">
                                        {new Date(category.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>

                                    {/* Column 5: Grid Inline Operations Actions */}
                                    <td className="px-8 py-4.5 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {editingId === category.id ? (
                                                <>
                                                    <button type="button" onClick={() => handleSaveUpdate(category.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                                        <Check size={14} />
                                                    </button>
                                                    <button type="button" onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button type="button" onClick={() => { setEditingId(category.id); setEditingName(category.name); }} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/40 sm:opacity-0 sm:group-hover:opacity-100 rounded-xl transition-all">
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button type="button" onClick={() => handleDelete(category.id)} className="p-2 text-slate-400 hover:text-brand-accent bg-slate-50 hover:bg-brand-accent/10 border border-slate-200/40 sm:opacity-0 sm:group-hover:opacity-100 rounded-xl transition-all">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>

                                </tr>
                            ))}

                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-xs font-medium italic text-slate-400">
                                        Category structure list database holds zero rows.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}