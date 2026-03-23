'use client';

import { useEffect, useState } from 'react';
import { WriterService, type WriterDisplay } from './service';
import { Eye } from 'lucide-react';

export default function WritersClient() {
    const [writers, setWriters] = useState<WriterDisplay[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const data = await WriterService.getAllWriters();
            setWriters(data);
            setLoading(false);
        }
        init();
    }, []);

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-8 py-5"><div className="h-4 w-8 bg-slate-100 rounded"></div></td>
            <td className="px-8 py-5"><div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                <div className="h-4 w-32 bg-slate-100 rounded"></div>
            </div></td>
            <td className="px-8 py-5"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
            <td className="px-8 py-5"><div className="h-8 w-8 bg-slate-100 rounded-xl ml-auto"></div></td>
        </tr>
    );

    return (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">ID</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Writer</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Joined</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {loading ? [1,2,3,4,5].map(i => <SkeletonRow key={i} />) :
                    writers.map((writer) => (
                        <tr key={writer.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 text-sm font-bold text-[#EE1C25]">#{writer.id}</td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                                        {writer.initial}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{writer.name}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-sm font-medium text-slate-500">{writer.joinedDate}</td>
                            <td className="px-8 py-5 text-right">
                                <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </div>
    );
}