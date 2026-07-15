// app/(admin)/product-tag/ProductTagClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Package, Search, Hash, Calendar, Activity, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { ProductTagService } from './service';

export default function ProductTagClient() {
    const [productTags, setProductTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTagName, setNewTagName] = useState('');

    // Pagination & Search Query Parameters
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Inline Edit State Trackers
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const loadProductTags = async () => {
        setLoading(true);
        try {
            const data = await ProductTagService.getProductTags({ page, limit, search });
            setProductTags(data.productTags);
            setTotal(data.total);
        } catch (err) {
            console.error("Failed loading data rows from product_tag matrix:", err);
        } finally {
            setLoading(false);
        }
    };

    // Submits call actions on user typing cycles or structural index page mutations
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            loadProductTags();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [page, search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;
        try {
            await ProductTagService.createProductTag(newTagName.trim());
            setNewTagName('');
            setPage(1); // Realignment back to initial record row index sets
            loadProductTags();
        } catch (err) {
            alert("Error: Reference key name might already exist inside the system.");
        }
    };

    const handleSaveUpdate = async (id: number) => {
        if (!editingName.trim()) return;
        try {
            await ProductTagService.updateProductTag(id, editingName.trim());
            setProductTags(productTags.map(p => p.id === id ? { ...p, name: editingName.trim() } : p));
            setEditingId(null);
        } catch (err) {
            alert("Error trying to process cell content update updates.");
        }
    };

    const handleToggleDelete = async (id: number, isDeleted: boolean) => {
        const verificationText = isDeleted
            ? "Restore this financial tagging key back into system visibility?"
            : "Soft archive this product option parameter? It will switch status markers to Not Active.";
        if (!confirm(verificationText)) return;

        try {
            const updated = await ProductTagService.toggleSoftDelete(id, isDeleted);
            setProductTags(productTags.map(p => p.id === id ? updated : p));
        } catch (err) {
            alert("Visibility status toggle adjustment failed execution.");
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-8"> {/* Enforced Client Layout Rule */}

            {/* TITLES HEADER BLOCK */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                        <Package size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Tag Management</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Enterprise Solutions & Core Sub Products</p>
                    </div>
                </div>
                <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-slate-200/40 w-fit">
                    Matches Found: {total} Entries
                </div>
            </div>

            {/* ACTION PIPELINE TOOLBAR (GRID LAYOUT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-4 relative flex items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
                    <Search className="absolute left-8 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search product tags..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <form onSubmit={handleCreate} className="lg:col-span-8 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex gap-3 items-center">
                    <input
                        type="text"
                        placeholder="Insert sub product tag label name (e.g. Tabungan Emas, KPR Syariah)..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shrink-0">
                        <Plus size={14} /> Add Tag
                    </button>
                </form>
            </div>

            {/* DATATABLE PLATFORM DISPLAY */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                            <th className="px-8 py-5 font-black flex items-center gap-2"><Hash size={12}/> ID</th>
                            <th className="px-6 py-5 font-black">Sub Product Classification</th>
                            <th className="px-6 py-5 font-black"><Activity size={12} className="inline mr-1"/> Status Indicator</th>
                            <th className="px-6 py-5 font-black hidden sm:table-cell"><Calendar size={12} className="inline mr-1"/> Date Added</th>
                            <th className="px-8 py-5 font-black text-right">Actions</th>
                        </tr>
                        </thead>

                        {loading ? (
                            <tbody>
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="animate-spin text-slate-300" size={28} />
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Querying active tags matrix...</span>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-100">
                            {productTags.map((tag) => {
                                const isArchived = tag.deleted_at !== null;
                                return (
                                    <tr key={tag.id} className={`group transition-colors ${isArchived ? 'bg-slate-50/60 opacity-65' : 'hover:bg-slate-50/40'}`}>

                                        <td className="px-8 py-4.5 text-xs font-black text-slate-400 tabular-nums">
                                            #{tag.id}
                                        </td>

                                        <td className="px-6 py-4.5">
                                            {editingId === tag.id ? (
                                                <input
                                                    type="text"
                                                    className="px-3 py-1.5 border border-blue-500 bg-white rounded-xl text-xs font-bold outline-none text-slate-800 w-full max-w-sm shadow-sm"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className={`text-xs font-bold tracking-tight ${isArchived ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                        {tag.name}
                                                    </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4.5">
                                            {isArchived ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-rose-100">
                                                        Not Active
                                                    </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                                                        Active
                                                    </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4.5 text-[11px] font-bold text-slate-400 tracking-tight hidden sm:table-cell whitespace-nowrap">
                                            {new Date(tag.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </td>

                                        <td className="px-8 py-4.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {editingId === tag.id ? (
                                                    <>
                                                        <button type="button" onClick={() => handleSaveUpdate(tag.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                                            <Check size={14} />
                                                        </button>
                                                        <button type="button" onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {!isArchived && (
                                                            <button type="button" onClick={() => { setEditingId(tag.id); setEditingName(tag.name); }} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/40 sm:opacity-0 sm:group-hover:opacity-100 rounded-xl transition-all">
                                                                <Edit2 size={13} />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleDelete(tag.id, isArchived)}
                                                            className={`p-2 border border-slate-200/40 sm:opacity-0 sm:group-hover:opacity-100 rounded-xl transition-all ${isArchived ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' : 'text-slate-400 hover:text-brand-accent bg-slate-50 hover:bg-brand-accent/10'}`}
                                                            title={isArchived ? "Restore Tag" : "Soft Delete"}
                                                        >
                                                            {isArchived ? <RotateCcw size={13} /> : <Trash2 size={13} />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                    </tr>
                                );
                            })}

                            {productTags.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-xs font-medium italic text-slate-400">
                                        No configuration profiles found matching current selections.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* PAGINATION SECTION */}
                {totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <ArrowLeft size={14} />
                            </button>
                            <button
                                type="button"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}