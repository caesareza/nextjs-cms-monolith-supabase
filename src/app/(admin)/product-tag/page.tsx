'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { ProductTagService } from './service';

export default function ProductTagPage() {
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTagName, setNewTagName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Editing State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            const data = await ProductTagService.getProductTags();
            setTags(data);
        } catch (err) {
            alert('Failed to load product tags');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim() || actionLoading) return;

        setActionLoading(true);
        try {
            const freshTag = await ProductTagService.createProductTag(newTagName.trim());
            setTags(prev => [...prev, freshTag].sort((a,b) => a.name.localeCompare(b.name)));
            setNewTagName('');
        } catch (err) {
            console.error('err', err)
            alert('Failed to create product tag');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editingName.trim() || actionLoading) return;
        setActionLoading(true);
        try {
            const updated = await ProductTagService.updateProductTag(id, editingName.trim());
            setTags(prev => prev.map(t => t.id === id ? updated : t));
            setEditingId(null);
        } catch (err) {
            alert('Failed to update tag');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete the product tag "${name}"?`)) return;
        setActionLoading(true);
        try {
            await ProductTagService.deleteProductTag(id);
            setTags(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            alert('Cannot delete. This tag might be used by active articles.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">

            {/* HEADER SECTION */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Tag className="text-[#EE1C25]" size={28} /> Product Tags
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Manage global product indicators for navigation filtering
                    </p>
                </div>
            </div>

            {/* CREATE BAR */}
            <form onSubmit={handleCreate} className="bg-white rounded-4xl p-4 border border-slate-100 shadow-sm flex gap-4">
                <input
                    type="text"
                    disabled={actionLoading}
                    className="flex-1 px-6 py-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-[#EE1C25]/20 transition-all"
                    placeholder="Enter product brand name (e.g., Nyala, OCBC, Tabungan Bisnis)..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={actionLoading || !newTagName.trim()}
                    className="bg-[#EE1C25] text-white px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 flex items-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add Tag
                </button>
            </form>

            {/* DATA GRID DISPLAY */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 flex justify-center text-slate-400"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {tags.map((tag) => (
                            <div key={tag.id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">

                                {/* LEFT SIDE: INLINE MANAGER INJECTION */}
                                <div className="flex-1 max-w-lg">
                                    {editingId === tag.id ? (
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-white border border-[#EE1C25]/30 rounded-lg text-xs font-bold outline-none"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-slate-400 font-mono w-8">#{tag.id}</span>
                                            <span className="text-sm font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                        {tag.name}
                      </span>
                                            <span className="text-[10px] font-bold text-slate-300">
                        Created: {new Date(tag.created_at).toLocaleDateString('id-ID')}
                      </span>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT SIDE: INTERACTION BUTTONS */}
                                <div className="flex items-center gap-2">
                                    {editingId === tag.id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdate(tag.id)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setEditingId(tag.id); setEditingName(tag.name); }}
                                                className="p-2 text-slate-300 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                                title="Rename Tag"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id, tag.name)}
                                                className="p-2 text-slate-300 hover:text-[#EE1C25] hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                                title="Delete Tag"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>

                            </div>
                        ))}

                        {tags.length === 0 && (
                            <p className="text-[10px] font-black text-slate-300 uppercase text-center py-12 tracking-widest">
                                No system tags registered yet.
                            </p>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}