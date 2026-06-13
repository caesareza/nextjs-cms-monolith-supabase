'use client';

import { useEffect, useState } from 'react';
import { CategoryService, type CategoryDisplay } from './service';
import { Layers, ChevronRight } from 'lucide-react';

export default function CategoryClient() {
    const [categories, setCategories] = useState<CategoryDisplay[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const data = await CategoryService.getAllCategories();
            setCategories(data);
            setLoading(false);
        }
        init();
    }, []);

    const SkeletonItem = () => (
        <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50"></div>
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-50 rounded"></div>
                    <div className="h-3 w-16 bg-slate-50 rounded"></div>
                </div>
            </div>
            <div className="h-8 w-8 bg-slate-50 rounded-full"></div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? [1,2,3].map(i => <SkeletonItem key={i} />) :
                categories.map((cat) => (
                    <div key={cat.id} className="group bg-white border border-slate-200 p-6 rounded-3xl hover:shadow-xl hover:shadow-slate-100 hover:border-[#EE1C25]/20 transition-all cursor-pointer relative overflow-hidden">
                        {/* Subtle background decoration */}
                        <div className="absolute -right-4 -top-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Layers size={80} />
                        </div>

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 text-[#EE1C25] rounded-2xl flex items-center justify-center font-black shadow-inner">
                                    {cat.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{cat.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        ID: {cat.id} • /{cat.slug}
                                    </p>
                                </div>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-full group-hover:bg-[#EE1C25] group-hover:text-white transition-all transform group-hover:translate-x-1">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}