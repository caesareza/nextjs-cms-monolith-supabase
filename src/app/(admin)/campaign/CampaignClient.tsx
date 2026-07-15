// app/(admin)/campaign/CampaignClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Megaphone, Calendar, Hash, Activity } from 'lucide-react';
import { CampaignService } from './service';

export default function CampaignClient() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCampaignName, setNewCampaignName] = useState('');

    // Inline Edit states
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await CampaignService.getCampaigns();
            setCampaigns(data);
        } catch (err) {
            console.error("Failed loading corporate campaigns matrix:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCampaigns(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaignName.trim()) return;
        try {
            const created = await CampaignService.createCampaign(newCampaignName.trim());
            setCampaigns([...campaigns, created].sort((a, b) => a.name.localeCompare(b.name)));
            setNewCampaignName('');
        } catch (err) {
            alert("Error: Campaign key descriptor value might already exist.");
        }
    };

    const handleSaveUpdate = async (id: number) => {
        if (!editingName.trim()) return;
        try {
            await CampaignService.updateCampaign(id, editingName.trim());
            setCampaigns(campaigns.map(c => c.id === id ? { ...c, name: editingName.trim() } : c));
            setEditingId(null);
        } catch (err) {
            alert("Error saving modified campaign properties.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to archive this tracking Campaign target?")) return;
        try {
            await CampaignService.softDeleteCampaign(id);
            setCampaigns(campaigns.filter(c => c.id !== id));
        } catch (err) {
            console.error("Soft delete processing fail:", err);
            alert("Failed to move configuration entry to archive trash.");
        }
    };

    return (
        <div className="space-y-8">

            {/* BRAND HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                        <Megaphone size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Management</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Tracking Tags & Promo Key Attributions</p>
                    </div>
                </div>
                <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-slate-200/40 w-fit">
                    Total Active: {campaigns.length}
                </div>
            </div>

            {/* CREATION INPUT BAR */}
            <form onSubmit={handleCreate} className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex gap-3 items-center">
                <input
                    type="text"
                    placeholder="E.g., Promo Pemilu, NyalaFest, #KartuWajibLiburan..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                />
                <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shrink-0">
                    <Plus size={14} /> Add Campaign
                </button>
            </form>

            {/* DATATABLE PRESENTATION FRAME */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                            <th className="px-8 py-5 font-black flex items-center gap-2"><Hash size={12}/> ID</th>
                            <th className="px-6 py-5 font-black">Campaign Identifier / Tracking Tag</th>
                            <th className="px-6 py-5 font-black hidden md:table-cell"><Activity size={12} className="inline mr-1"/> Pipeline</th>
                            <th className="px-6 py-5 font-black hidden sm:table-cell"><Calendar size={12} className="inline mr-1"/> Date Formed</th>
                            <th className="px-8 py-5 font-black text-right">Actions</th>
                        </tr>
                        </thead>

                        {loading ? (
                            <tbody>
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="animate-spin text-slate-300" size={28} />
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Compiling active campaigns...</span>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-100">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="group hover:bg-slate-50/40 transition-colors">

                                    <td className="px-8 py-4.5 text-xs font-black text-slate-400 tabular-nums">
                                        #{campaign.id}
                                    </td>

                                    <td className="px-6 py-4.5">
                                        {editingId === campaign.id ? (
                                            <input
                                                type="text"
                                                className="px-3 py-1.5 border border-blue-500 bg-white rounded-xl text-xs font-bold outline-none text-slate-800 w-full max-w-sm shadow-sm"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-slate-800 tracking-tight leading-relaxed">
                                                    {campaign.name}
                                                </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4.5 hidden md:table-cell">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-accent/10 text-brand-accent text-[9px] font-black uppercase tracking-wider rounded-md border border-brand-accent/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                                                Live Track
                                            </span>
                                    </td>

                                    <td className="px-6 py-4.5 text-[11px] font-bold text-slate-400 tracking-tight hidden sm:table-cell whitespace-nowrap">
                                        {new Date(campaign.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>

                                    <td className="px-8 py-4.5 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {editingId === campaign.id ? (
                                                <>
                                                    <button type="button" onClick={() => handleSaveUpdate(campaign.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                                        <Check size={14} />
                                                    </button>
                                                    <button type="button" onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button type="button" onClick={() => { setEditingId(campaign.id); setEditingName(campaign.name); }} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/40 sm:opacity-0 sm:group-hover:opacity-100 rounded-xl transition-all">
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button type="button" onClick={() => handleDelete(campaign.id)} className="p-2 text-slate-400 hover:text-brand-accent bg-slate-50 hover:bg-brand-accent/10 border border-slate-200/40 sm:opacity-0 sm:group-hover:opacity-100 rounded-xl transition-all">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>

                                </tr>
                            ))}

                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-xs font-medium italic text-slate-400">
                                        Campaign table contains zero tracking records.
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