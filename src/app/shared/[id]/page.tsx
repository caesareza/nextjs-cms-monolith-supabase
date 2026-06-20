import { ArticleService} from "@/app/(admin)/article/service";
import { notFound } from 'next/navigation';
import { Search, Globe, ArrowLeft } from 'lucide-react';

interface PublicViewProps {
    params: Promise<{ id: string }>
}

export default async function PublicSharedArticleView({ params }: PublicViewProps) {
    const { id } = await params;

    let article;
    try {
        // Reuse your central server service layer instead of raw queries!
        article = await ArticleService.getArticleById(Number(id));
    } catch (err) {
        console.error("Error retrieving share preview record:", err);
        notFound();
    }

    if (!article) {
        notFound();
    }

    const formattedDate = new Date(article.production_month).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-white text-slate-800 antialiased select-text selection:bg-red-50">

            {/* --- MULTI-TIER OCBC HEADER --- */}
            <header className="w-full border-b border-slate-100 bg-white sticky top-0 z-50 select-none">
                {/* Top Utility Bar */}
                <div className="w-full bg-slate-50 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <div className="flex gap-2 bg-slate-200 p-0.5 rounded">
                            <span className="bg-white px-1.5 py-0.5 rounded text-slate-900 font-black">ID</span>
                            <span className="px-1.5 py-0.5">EN</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">💼 Karir</span>
                            <span className="flex items-center gap-1"><Globe size={12} /> Region</span>
                        </div>
                    </div>
                </div>

                {/* Main Brand Bar */}
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-[#EE1C25] rounded-full flex items-center justify-center font-black text-white text-xl">
                                O
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-slate-950">OCBC</span>
                        </div>

                        <nav className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-600">
                            <span className="text-slate-900">Individu</span>
                            <span>UKM</span>
                            <span>Korporasi</span>
                            <span>Syariah</span>
                            <span>Digital</span>
                            <span className="text-[#EE1C25] border-b-2 border-[#EE1C25] pt-7 pb-7">Artikel</span>
                            <span>Tentang Kami</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Search size={20} className="text-slate-700 cursor-pointer" />
                        <button type="button" className="bg-[#EE1C25] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                            Jadi Nasabah
                        </button>
                    </div>
                </div>
            </header>

            {/* --- HERO ARTICLE BANNER FRAME --- */}
            <section className="max-w-7xl mx-auto px-6 pt-8 pb-12">
                <button type="button" className="mb-6 flex items-center gap-1.5 px-4 py-1.5 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 bg-white">
                    <ArrowLeft size={12} /> Kembali ke Artikel
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-5 space-y-4">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            {article.category?.name || 'Individu'}
                        </span>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                            {article.title}
                        </h1>
                        <p className="text-slate-400 text-xs font-medium">
                            {formattedDate} • Ditulis oleh: <span className="font-bold text-slate-600">{article.writer?.name || 'Redaksi OCBC'}</span>
                        </p>

                        <div className="pt-4 space-y-2 select-none">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Bagikan Ke</span>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-xs">f</span>
                                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">𝕏</span>
                                <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">wa</span>
                                <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">🔗</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100 via-red-50 to-red-100 relative shadow-inner border border-slate-100">
                            <div className="absolute right-12 bottom-0 top-0 w-1/2 bg-contain bg-center bg-no-repeat opacity-90" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1598550476439-6847785fce6e?w=600&auto=format&fit=crop&q=60')` }} />
                            <div className="absolute left-6 bottom-6 bg-black/5 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-widest border border-white/20">
                                🏮 2026 Financial Forecast Frame
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- COMPOSITION WORKSPACE TEXT CONTAINER --- */}
            <main className="max-w-3xl mx-auto px-6 pb-12">
                <div
                    className="prose prose-slate max-w-none
                        prose-p:text-slate-800 prose-p:text-base prose-p:leading-relaxed prose-p:mb-6
                        prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight prose-headings:mt-10 prose-headings:mb-4
                        prose-strong:font-black prose-strong:text-slate-950
                        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-li:text-slate-800 prose-li:mb-2"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                <div className="mt-16 pt-8 border-t border-slate-100 space-y-8">

                    {/* Call To Action Box */}
                    <div className="py-10 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight max-w-xs">
                            Tertarik dengan artikel kami?
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button type="button" className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-xs font-black uppercase text-slate-700 bg-white rounded-xl tracking-wider text-center">
                                Ikuti promo/program terkini!
                            </button>
                            <button type="button" className="px-6 py-3 bg-[#EE1C25] hover:brightness-110 text-white text-xs font-black uppercase rounded-xl tracking-wider text-center">
                                Jadi nasabah OCBC sekarang!
                            </button>
                        </div>
                    </div>

                    {/* Ribbon Share Bar */}
                    <div className="w-full bg-[#E6F7FC] border border-[#D0F0FA] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                        <span className="text-sm font-black text-slate-800 tracking-tight">
                            Bagikan Artikel Ini?
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-9 h-9 rounded-full bg-[#3B5998] text-white flex items-center justify-center font-black text-sm shadow-sm cursor-pointer">f</span>
                            <span className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-black text-sm shadow-sm cursor-pointer">𝕏</span>
                            <span className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center font-black text-sm shadow-sm cursor-pointer">wa</span>
                            <span className="w-9 h-9 rounded-full bg-white text-slate-400 flex items-center justify-center font-black text-sm shadow-sm cursor-pointer border border-slate-200">🔗</span>
                        </div>
                    </div>

                </div>
            </main>

        </div>
    );
}