'use client';

import { Search } from 'lucide-react';
import { LookupOptions } from '@/types/article';

const YEARS = [2025, 2026, 2027];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ProductionFilterPanelProps {
    year: number;
    setYear: (y: number) => void;
    month: number;
    setMonth: (m: number) => void;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    writerId: string;
    setWriterId: (id: string) => void;
    categoryId: string;
    setCategoryId: (id: string) => void;
    contentType: string;
    setContentType: (type: string) => void;
    writers: any[];
    options: LookupOptions;
}

export default function ProductionFilterPanel({
                                                  year, setYear, month, setMonth, searchTerm, setSearchTerm,
                                                  writerId, setWriterId, categoryId, setCategoryId, contentType, setContentType,
                                                  writers, options
                                              }: ProductionFilterPanelProps) {
    return (
        <div className="space-y-6 shrink-0">
            {/* YEAR & MONTH SELECTOR BAR */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-slate-50 border-none text-sm font-black px-6 py-2.5 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-light-blue/30 transition-all cursor-pointer text-slate-800"
                >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                    {MONTHS.map((m, idx) => (
                        <button
                            key={m}
                            onClick={() => setMonth(idx + 1)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                month === idx + 1 ? 'bg-white text-brand-accent shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* FILTERS RIBBON */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-200/60">
                <div className="relative flex-1 min-w-75">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search workspace title headers..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none placeholder:text-slate-300 focus:border-brand-accent/20 focus:ring-4 focus:ring-brand-light-blue/20 transition-all text-slate-800"
                    />
                </div>

                {/* Author Selection Dropdown */}
                <select value={writerId} onChange={(e) => setWriterId(e.target.value)} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer text-slate-700">
                    <option value="">All Writers</option>
                    {writers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>

                {/* Centralized Category Selection Dropdown */}
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer text-slate-700">
                    <option value="">All Categories</option>
                    {options.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                {/* Intent Type Selection Dropdown */}
                <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer text-slate-700">
                    <option value="">All Types</option>
                    <option value="new">New Article</option>
                    <option value="adjust">Optimization / Adjust</option>
                </select>
            </div>
        </div>
    );
}