'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, UserCheck, Calendar, Hash, Activity } from 'lucide-react';
import { PersonaService } from './service';

export default function PersonaClient() {
    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPersonaName, setNewPersonaName] = useState('');

    // Inline Editing Trackers
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const loadPersonas = async () => {
        setLoading(true);
        try {
            const data = await PersonaService.getPersonas();
            setPersonas(data);
        } catch (err) {
            console.error("Failed loading audience target personas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPersonas(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPersonaName.trim()) return;
        try {
            const created = await PersonaService.createPersona(newPersonaName.trim());
            setPersonas([...personas, created].sort((a, b) => a.name.localeCompare(b.name)));
            setNewPersonaName('');
        } catch (err) {
            alert("Error: Persona rule parameter name might already exist.");
        }
    };

    const handleSaveUpdate = async (id: number) => {
        if (!editingName.trim()) return;
        try {
            await PersonaService.updatePersona(id, editingName.trim());
            setPersonas(personas.map(p => p.id === id ? { ...p, name: editingName.trim() } : p));
            setEditingId(null);
        } catch (err) {
            alert("Error saving targeted validation string modifications.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to safely archive this audience Persona parameter?")) return;
        try {
            await PersonaService.softDeletePersona(id);
            setPersonas(personas.filter(p => p.id !== id));
        } catch (err) {
            console.error("Soft deletion request failed:", err);
            alert("Failed to safely remove this option from active lists.");
        }
    };

    return (
        <div className="space-y-8">
            {/* BRAND HEADER DISPLAY */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Persona Management</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Segment Personas & Target Profiles</p>
                    </div>
                </div>
                <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-slate-200/40 w-fit self-end sm:self-auto">
                    Active Records: {personas.length}
                </div>
            </div>

            {/* CREATION WRAPPER BAR */}
            <form onSubmit={handleCreate} className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex gap-3 items-center">
                <input
                    type="text"
                    placeholder="E.g., EA - Salaried Worker, Womenpreneur..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all"
                    value={newPersonaName}
                    onChange={(e) => setNewPersonaName(e.target.value)}
                />
                <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shrink-0">
                    <Plus size={14} /> Add Persona
                </button>
            </form>

            {/* ENTERPRISE DATATABLE PRESENTATION OPTION */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                            <th className="px-8 py-5 font-black flex items-center gap-2"><Hash size={12}/> ID</th>
                            <th className="px-6 py-5 font-black">Audience Profile Target Criteria</th>
                            <th className="px-6 py-5 font-black hidden md:table-cell"><Activity size={12} className="inline mr-1"/> Status</th>
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
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Compiling datatable nodes...</span>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-100">
                            {personas.map((persona) => (
                                <tr key={persona.id} className="group hover:bg-slate-50/40 transition-colors">

                                    {/* Column 1: Alphanumeric DB ID Key */}
                                    <td className="px-8 py-4.5 text-xs font-black text-slate-400 tabular-nums">
                                        #{persona.id}
                                    </td>

                                    {/* Column 2: Editable Profile Title Target */}
                                    <td className="px-6 py-4.5">
                                        {editingId === persona.id ? (
                                            <input
                                                type="text"
                                                className="px-3 py-1.5 border border-blue-500 bg-white rounded-xl text-xs font-bold outline-none text-slate-800 w-full max-w-sm shadow-sm"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-slate-800 tracking-tight leading-relaxed">
                                                    {persona.name}
                                                </span>
                                        )}
                                    </td>

                                    {/* Column 3: Status Tag (Contextual indicators for tabular workflows) */}
                                    <td className="px-6 py-4.5 hidden md:table-cell">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active
                                            </span>
                                    </td>

                                    {/* Column 4: Mapped Timestamp Column */}
                                    <td className="px-6 py-4.5 text-[11px] font-bold text-slate-400 tracking-tight hidden sm:table-cell whitespace-nowrap">
                                        {new Date(persona.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>

                                    {/* Column 5: Direct Row Action Operations Wrapper */}
                                    <td className="px-8 py-4.5 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {editingId === persona.id ? (
                                                <>
                                                    <button type="button" onClick={() => handleSaveUpdate(persona.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                                        <Check size={14} />
                                                    </button>
                                                    <button type="button" onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button type="button" onClick={() => { setEditingId(persona.id); setEditingName(persona.name); }} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/40 sm:opacity-0 sm:group-hover:opacity-100 rounded-xl transition-all">
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button type="button" onClick={() => handleDelete(persona.id)} className="p-2 text-slate-400 hover:text-brand-accent bg-slate-50 hover:bg-brand-accent/10 border border-slate-200/40 sm:opacity-0 sm:group-hover:opacity-100 rounded-xl transition-all">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>

                                </tr>
                            ))}

                            {personas.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center space-y-2">
                                        <p className="text-xs font-medium italic text-slate-400">
                                            Persona criteria database matrix currently holds zero rows.
                                        </p>
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