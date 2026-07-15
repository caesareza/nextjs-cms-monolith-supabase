// app/(admin)/writer/WriterClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Users, Hash, Calendar, Search } from 'lucide-react';
import { WriterService } from './service';

export default function WriterClient() {
    const [writers, setWriters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadWriters = async () => {
        setLoading(true);
        try {
            const data = await WriterService.getWriters();
            setWriters(data);
        } catch (err) {
            console.error("Failed loading corporate writers matrix:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadWriters(); }, []);

    // Filter writers based on search input
    const filteredWriters = writers.filter(w =>
        w.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Color theme badge assignment matching your screenshot aesthetics
    const getBadgeStyle = (index: number) => {
        const styles = [
            'bg-emerald-50 text-emerald-700 border-emerald-200',
            'bg-amber-50 text-amber-700 border-amber-200',
            'bg-sky-50 text-sky-700 border-sky-200',
            'bg-purple-50 text-purple-700 border-purple-200'
        ];
        return styles[index % styles.length];
    };

    return (
        <div className="space-y-8"> {/* Enforced Client Container Spacing Rule */}

            {/* BRAND HEADER & METRICS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                        <Users size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Writer Directory</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Editorial Content Authors</p>
                    </div>
                </div>
                <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-slate-200/40 w-fit">
                    Total Active: {filteredWriters.length}
                </div>
            </div>

            {/* SEARCH CONTROLLER FILTERS BAR */}
            <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm flex items-center relative max-w-md">
                <Search className="absolute left-9 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Search copywriters..."
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* HIGH-DENSITY DATATABLE PRESENTATION */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                            <th className="px-8 py-5 font-black flex items-center gap-2"><Hash size={12}/> ID</th>
                            <th className="px-6 py-5 font-black">Writer Name Label</th>
                            <th className="px-6 py-5 font-black hidden md:table-cell">Role Group</th>
                            <th className="px-8 py-5 font-black text-right hidden sm:table-cell"><Calendar size={12} className="inline mr-1"/> Date Joined</th>
                        </tr>
                        </thead>

                        {loading ? (
                            <tbody>
                            <tr>
                                <td colSpan={4} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="animate-spin text-slate-300" size={28} />
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Compiling author ledger...</span>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-100">
                            {filteredWriters.map((writer, index) => (
                                <tr key={writer.id} className="group hover:bg-slate-50/40 transition-colors">

                                    {/* Column 1: DB Alphanumeric Identification Index */}
                                    <td className="px-8 py-4.5 text-xs font-black text-slate-400 tabular-nums">
                                        #{writer.id}
                                    </td>

                                    {/* Column 2: Author Badge Representational Tag */}
                                    <td className="px-6 py-4.5">
                                            <span className={`px-3 py-1 border rounded-xl text-xs font-bold tracking-wide shadow-sm whitespace-nowrap ${getBadgeStyle(index)}`}>
                                                {writer.name}
                                            </span>
                                    </td>

                                    {/* Column 3: Fixed Internal Classification Tag */}
                                    <td className="px-6 py-4.5 hidden md:table-cell">
                                            <span className="text-xs font-bold text-slate-500">
                                                Content Contributor
                                            </span>
                                    </td>

                                    {/* Column 4: Mapped Timestamp Column */}
                                    <td className="px-8 py-4.5 text-right text-[11px] font-bold text-slate-400 tracking-tight hidden sm:table-cell whitespace-nowrap">
                                        {writer.created_at ? new Date(writer.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : '-'}
                                    </td>

                                </tr>
                            ))}

                            {filteredWriters.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-16 text-center text-xs font-medium italic text-slate-400">
                                        {searchTerm ? 'No authors found matching search terms.' : 'Writer lookup database matrix contains zero tracking rows.'}
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