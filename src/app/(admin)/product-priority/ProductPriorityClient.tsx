'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, BookmarkCheck, Search, Hash, Calendar, Activity, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { ProductPriorityService } from './service';

export default function ProductPriorityClient() {
    const [productPriorities, setProductPriorities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPriorityName, setNewPriorityName] = useState('');
    const [newPriorityCode, setNewPriorityCode] = useState('');

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingCode, setEditingCode] = useState('');

    const loadProductPriorities = async () => {
        setLoading(true);
        try {
            const data = await ProductPriorityService.getProductPriorities({ page, limit, search });
            setProductPriorities(data.productPriorities);
            setTotal(data.total);
        } catch (err) {
            console.error("Failed loading data rows from product_priority matrix:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            loadProductPriorities();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [page, search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPriorityName.trim()) return;
        try {
            await ProductPriorityService.createProductPriority(newPriorityName.trim(), newPriorityCode.trim());
            setNewPriorityName('');
            setNewPriorityCode('');
            setPage(1);
            loadProductPriorities();
        } catch (err) {
            alert("Error: Reference key name might already exist inside the system.");
        }
    };

    const handleSaveUpdate = async (id: number) => {
        if (!editingName.trim()) return;
        try {
            await ProductPriorityService.updateProductPriority(id, editingName.trim(), editingCode.trim());
            setProductPriorities(productPriorities.map(p => p.id === id ? { ...p, name: editingName.trim(), code: editingCode.trim() } : p));
            setEditingId(null);
        } catch (err) {
            alert("Error trying to process cell content updates.");
        }
    };

    const handleToggleDelete = async (id: number, isDeleted: boolean) => {
        const verificationText = isDeleted
            ? "Restore this priority product tagging back into visibility?"
            : "Soft archive this priority product option? It will switch status markers to Not Active.";
        if (!confirm(verificationText)) return;

        try {
            const updated = await ProductPriorityService.toggleSoftDelete(id, isDeleted);
            setProductPriorities(productPriorities.map(p => p.id === id ? updated : p));
        } catch (err) {
            alert("Visibility status toggle adjustment failed execution.");
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-8">

            {/* TITLES HEADER BLOCK */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-steel-blue shrink-0">
                        <BookmarkCheck size={18} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Priority Product Management</h1>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Configure Priority Products & Banking Segments</p>
                    </div>
                </div>
                <div className="bg-slate-100 text-slate-650 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-slate-200/40 w-fit">
                    Matches Found: {total} Entries
                </div>
            </div>

            {/* ACTION FORMS PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Side: Create Entry Panel */}
                <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Plus size={14} /> Add New Priority Option
                    </h3>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Option Label Name</label>
                            <input
                                type="text"
                                value={newPriorityName}
                                onChange={(e) => setNewPriorityName(e.target.value)}
                                placeholder="Insert product name (e.g. NYALA, PREMIER)..."
                                className="w-full bg-slate-50 border-none text-xs font-bold px-4 py-3 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-accent/20 transition-all text-slate-800"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Option Code (e.g. NB, NYA)</label>
                            <input
                                type="text"
                                value={newPriorityCode}
                                onChange={(e) => setNewPriorityCode(e.target.value)}
                                placeholder="3-letter code (optional, auto-generated if blank)..."
                                className="w-full bg-slate-50 border-none text-xs font-bold px-4 py-3 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-accent/20 transition-all text-slate-800"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-brand-navy hover:bg-slate-850 text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Plus size={12} /> Register Option
                        </button>
                    </form>
                </div>

                {/* Right Side: Data Grids with Search controls */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Search Panel */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search priority options..."
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent/40 outline-none transition-all"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-6 py-4.5 w-16"><Hash size={12} /></th>
                                    <th className="px-6 py-4.5 w-1/3">Option Name</th>
                                    <th className="px-6 py-4.5 w-1/4">Option Code</th>
                                    <th className="px-6 py-4.5"><Calendar size={12} /> Created At</th>
                                    <th className="px-6 py-4.5"><Activity size={12} /> Status</th>
                                    <th className="px-6 py-4.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="animate-spin text-slate-350" size={20} />
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Syncing Options...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : productPriorities.length > 0 ? (
                                    productPriorities.map((item) => {
                                        const isEditing = editingId === item.id;
                                        const isDeleted = !!item.deleted_at;

                                        return (
                                            <tr key={item.id} className={`group transition-colors ${isDeleted ? 'bg-slate-50/40 opacity-70' : 'hover:bg-slate-50/30'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-slate-450">{item.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-brand-accent/40 w-full"
                                                        />
                                                    ) : (
                                                        <span className={`text-xs font-black ${isDeleted ? 'text-slate-450 line-through' : 'text-slate-800'}`}>
                                                            {item.name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingCode}
                                                            onChange={(e) => setEditingCode(e.target.value)}
                                                            placeholder="Code..."
                                                            className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-brand-accent/40 w-24"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-105 border border-slate-200/60 px-2.5 py-0.5 rounded-md">
                                                            {item.code || '-'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-450">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${
                                                        isDeleted
                                                            ? 'text-slate-400 bg-slate-50 border-slate-200/60'
                                                            : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                                    }`}>
                                                        {isDeleted ? 'Not Active' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => handleSaveUpdate(item.id)} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors cursor-pointer" title="Save">
                                                                    <Check size={13} />
                                                                </button>
                                                                <button onClick={() => setEditingId(null)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer" title="Cancel">
                                                                    <X size={13} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {!isDeleted && (
                                                                    <button
                                                                        onClick={() => { setEditingId(item.id); setEditingName(item.name); setEditingCode(item.code || ''); }}
                                                                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                                                                        title="Edit Option"
                                                                    >
                                                                        <Edit2 size={13} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleToggleDelete(item.id, isDeleted)}
                                                                    className={`p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ${
                                                                        isDeleted ? 'text-slate-400 hover:text-emerald-600' : 'text-slate-400 hover:text-rose-600'
                                                                    }`}
                                                                    title={isDeleted ? 'Restore Option' : 'Soft Delete Option'}
                                                                >
                                                                    {isDeleted ? <RotateCcw size={13} /> : <Trash2 size={13} />}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-16 text-center text-slate-450 font-bold text-xs uppercase tracking-wider italic">No options found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* PAGINATION NAVIGATION FOOTER */}
                        {totalPages > 1 && (
                            <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs font-bold text-slate-450">
                                <span>Page {page} of {totalPages}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                                    >
                                        <ArrowLeft size={12} />
                                    </button>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                                    >
                                        <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
