// app/(admin)/theme/ThemeClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Palette } from 'lucide-react';
import { ThemeService } from './service';

export default function ThemeClient() {
    const [themes, setThemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newThemeName, setNewThemeName] = useState('');

    // Inline Edit Triggers
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const loadThemes = async () => {
        setLoading(true);
        try {
            const data = await ThemeService.getThemes();
            setThemes(data);
        } catch (err) {
            console.error("Failed loading corporate themes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadThemes(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThemeName.trim()) return;
        try {
            const created = await ThemeService.createTheme(newThemeName.trim());
            // Prepend to top manually since we follow ID Descending order layout parameters
            setThemes([created, ...themes]);
            setNewThemeName('');
        } catch (err) {
            alert("Error: Theme name might already exist.");
        }
    };

    const handleSaveUpdate = async (id: number) => {
        if (!editingName.trim()) return;
        try {
            await ThemeService.updateTheme(id, editingName.trim());
            setThemes(themes.map(t => t.id === id ? { ...t, name: editingName.trim() } : t));
            setEditingId(null);
        } catch (err) {
            alert("Error saving topic theme updates.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to permanently delete this Theme option?")) return;
        try {
            await ThemeService.deleteTheme(id);
            setThemes(themes.filter(t => t.id !== id));
        } catch (err) {
            alert("Cannot delete: This theme parameter is currently linked to active items.");
        }
    };

    return (
        <div className="space-y-8"> {/* Enforced Client Container Rule */}

            {/* HEADER METRICS */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                    <Palette size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Theme Management</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Campaign Themes & Content Topics</p>
                </div>
            </div>

            {/* INPUT PANEL TRIGGER */}
            <form onSubmit={handleCreate} className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex gap-3 items-center">
                <input
                    type="text"
                    placeholder="E.g., Kesehatan & Lingkungan, Life Series..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                />
                <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shrink-0">
                    <Plus size={14} /> Add Theme
                </button>
            </form>

            {/* MANAGEMENT TABLE CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Topic Name Hierarchy</span>
                    <span>Actions</span>
                </div>

                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-slate-300" size={24} />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Loading structural parameters...</span>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {themes.map((theme) => (
                            <div key={theme.id} className="px-8 py-4 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">

                                <div className="flex items-center gap-3">
                                    {editingId === theme.id ? (
                                        <input
                                            type="text"
                                            className="px-3 py-1.5 border border-blue-400 bg-white rounded-lg text-xs font-bold outline-none text-slate-800"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-xs font-black text-slate-700 bg-slate-100/60 px-3 py-1 rounded-xl border border-slate-200/40">
                                            {theme.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {editingId === theme.id ? (
                                        <>
                                            <button onClick={() => handleSaveUpdate(theme.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-100/60 transition-colors">
                                                <Check size={14} />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200/60 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingId(theme.id); setEditingName(theme.name); }} className="p-2 text-slate-400 hover:text-slate-700 bg-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(theme.id)} className="p-2 text-slate-400 hover:text-brand-accent bg-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>

                            </div>
                        ))}

                        {themes.length === 0 && (
                            <div className="p-16 text-center text-xs font-medium italic text-slate-400">
                                Theme engine records matrix currently evaluates to zero tags.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}