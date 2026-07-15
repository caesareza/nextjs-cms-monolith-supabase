import { ArticleService } from '../service';
import Link from 'next/link';
import {
    ChevronLeft, User, Tag, Calendar,
    ExternalLink, CheckCircle2, AlertCircle,
    Clock, Link2, Info, BarChart3, Flame, Target, Sparkles, FolderKanban
} from 'lucide-react';
import WorkflowActions from "./WorkflowActions";
import ArticleHistory from "./ArticleHistory";
import ShareConsole from "./ShareConsole";

export default async function Page({params}: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params;

    // Fetch clean consolidated strategy dataset and timeline tracking arrays
    const article = await ArticleService.getArticleById(Number(id));
    const logs = await ArticleService.getWorkflowLogs(id);

    const formatProductionMonth = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="max-w-7xl space-y-8">
            {/* 1. Header & Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/article"
                      className="flex items-center gap-2 text-slate-400 hover:text-brand-accent font-black uppercase text-[10px] tracking-widest transition-all">
                    <ChevronLeft size={16}/> Production Roadmap
                </Link>
                <div className="flex items-center gap-3">
                    <ShareConsole articleId={Number(id)} />

                    <Link href={`/article/edit/${id}`}
                          className="px-6 py-2.5 bg-brand-accent hover:bg-brand-navy text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-brand-accent/15 transition-all">
                        Edit Article
                    </Link>
                    <WorkflowActions article={article} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: PRIMARY CONTENT FOCUS CANVAS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span
                                    className="px-3 py-1 bg-brand-accent/10 text-brand-accent font-black text-[9px] uppercase tracking-widest rounded-full border border-brand-accent/20">
                                  {article.content_type || 'New Content'}
                                </span>
                                <span className="text-slate-300">/</span>
                                <span
                                    className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">
                                    {article.product?.name || 'No Product Tag'}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                                {article.title}
                            </h1>
                        </div>

                        {/* Main Content Body Canvas */}
                        <div
                            className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Old Content Reference Layout */}
                        {article.content_old && (
                            <div className="mt-8 p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">
                                    <Clock size={14}/> Reference: Old Content
                                </h4>

                                {article.content_old.startsWith('http') ? (
                                    <a
                                        href={article.content_old}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-brand-accent transition-colors group"
                                    >
                                        <span className="truncate">{article.content_old}</span>
                                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ) : (
                                    <p className="text-xs text-amber-700/80 line-clamp-3 leading-loose italic">
                                        {article.content_old}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FOOTER ROW: THE COMPREHENSIVE REVISION TIMELINE */}
                    <div className="border-t border-slate-100">
                        <div className="max-w-4xl">
                            <ArticleHistory logs={logs} />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: METADATA, SEO METRICS & SIDEBAR PANELS */}
                <div className="space-y-6">
                    {/* NEW UPGRADE: SEOStats pulls new global enums and demand figures */}
                    <SEOStats article={article}/>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest border-b border-slate-50 pb-4">
                            SEO & Publication
                        </h3>

                        <SidebarItem icon={<Link2 size={16}/>} label="Target Keyword" value={article.target_keyword}/>
                        <SidebarItem icon={<ExternalLink size={16}/>} label="URL Published" value={article.url_published} isLink/>
                        <SidebarItem icon={<BarChart3 size={16}/>} label="Index Status" value={article.index_status}/>

                        {/* Internal Links Split System Block */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Link2 size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  CTA Internal Links
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {article.cta_internal_link ? (
                                    article.cta_internal_link.split(',').map((url: string, index: number) => {
                                        const cleanUrl = url.trim();
                                        const label = cleanUrl.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');

                                        return (
                                            <a
                                                key={index}
                                                href={cleanUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-brand-accent/30 hover:bg-brand-accent/5 transition-all"
                                            >
                                                <span className="text-[9px] font-black text-brand-accent uppercase tracking-tighter mb-1 opacity-70 group-hover:opacity-100">
                                                  Link {index + 1} • {label}
                                                </span>
                                                <div className="flex items-center justify-between gap-2">
                                                  <span className="text-[11px] font-medium text-slate-500 truncate group-hover:text-slate-900 transition-colors">
                                                    {cleanUrl}
                                                  </span>
                                                    <ExternalLink size={12} className="text-slate-300 group-hover:text-brand-accent shrink-0" />
                                                </div>
                                            </a>
                                        );
                                    })
                                ) : (
                                    <span className="text-xs text-slate-400 italic font-medium px-1">No internal links defined.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* NEW UPGRADE: Corporate Ownership strip includes section taxonomy, target personas and theme maps */}
                    <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6 shadow-xl shadow-slate-200">
                        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Corporate Ownership</h3>

                        <SidebarItemInverted icon={<User size={16}/>} label="Writer" value={article.writer?.name}/>
                        <SidebarItemInverted icon={<FolderKanban size={16}/>} label="Section" value={article.section?.name}/>
                        <SidebarItemInverted icon={<Tag size={16}/>} label="Category" value={article.category?.name}/>
                        <SidebarItemInverted icon={<Sparkles size={16}/>} label="Theme" value={article.theme?.name}/>
                        <SidebarItemInverted icon={<Target size={16}/>} label="Target Persona" value={article.persona?.name}/>
                        <SidebarItemInverted icon={<Calendar size={16}/>} label="Production Month" value={formatProductionMonth(article.production_month)} />

                        <hr className="border-slate-800"/>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Status</span>
                                <span
                                    className={`text-[10px] font-black px-3 py-1 rounded-full ${article.status === 'Published' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'}`}>
                                    {article.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Approval</span>
                                <span className="flex items-center gap-2 text-xs font-bold">
                                    {article.approval === 'approved' || article.approval === 'Approved' ? (
                                        <CheckCircle2 size={14} className="text-emerald-400"/>
                                    ) : (
                                        <AlertCircle size={14} className="text-amber-400"/>
                                    )}
                                    <span className="capitalize">{article.approval || 'pending'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes / Rejection context mapping panel */}
                    <div className="bg-amber-50 p-6 rounded-4xl border border-amber-100">
                        <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Info size={14}/> Internal Notes
                        </h4>
                        <p className="text-xs text-amber-800/70 font-medium leading-relaxed italic">
                            {article.internal_notes || "No special instructions for this piece."}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Global Core Presentational Item Shell Formats
function SidebarItem({icon, label, value, isLink}: any) {
    return (
        <div className="space-y-1">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
            <div className="flex items-center gap-2">
                <div className="text-slate-300">{icon}</div>
                {isLink && value ? (
                    <a href={value} target="_blank" rel="noopener noreferrer"
                       className="text-xs font-bold text-brand-accent hover:text-brand-navy hover:underline truncate">{value}</a>
                ) : (
                    <span className="text-xs font-bold text-slate-700">{value || '-'}</span>
                )}
            </div>
        </div>
    );
}

function SidebarItemInverted({ icon, label, value, rawValue }: any) {
    return (
        <div className="flex items-center gap-4 group/item">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-brand-accent transition-colors shrink-0">
                {icon}
            </div>
            <div>
                <span className="block text-[9px] font-black text-slate-500 uppercase">{label}</span>
                <span className="text-xs font-bold text-white transition-colors" title={rawValue}>
                  {value || 'General Context / Unassigned'}
                </span>
            </div>
        </div>
    );
}

// Extended Meta Information Dashboard MonitorHUD
function SEOStats({article}: { article: any }) {
    const titleLength = article.title?.length || 0;
    const descLength = article.meta_description?.length || 0;
    const wordCount = article.content?.trim().split(/\s+/).filter(Boolean).length || 0;

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Meta Strategy Specs</h3>
                <span className="text-[10px] font-bold text-slate-400">LIVE METRICS</span>
            </div>

            {/* UPGRADE: Top Level Strategy Metrics Badges Layer Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center select-none">
                <div className="space-y-0.5">
                    <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Search Demand</span>
                    <span className="text-xs font-black text-slate-900 flex items-center justify-center gap-0.5 tabular-nums">
                        <Flame size={12} className="text-orange-500 shrink-0" /> {Number(article.demand || 0).toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="space-y-0.5 border-x border-slate-200">
                    <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Search Intent</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter block truncate px-1">
                        {article.intent || 'Info'}
                    </span>
                </div>
                <div className="space-y-0.5">
                    <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Classification</span>
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-tighter block truncate px-1">
                        {article.classification || 'Infantry'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <MetricRow
                    label="Title Length Mapping"
                    value={titleLength}
                    limit={65}
                    unit="char"
                    isError={titleLength > 65}
                />

                <MetricRow
                    label="Description Tag Length"
                    value={descLength}
                    limit={160}
                    unit="char"
                    isError={descLength > 160}
                />

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                        <span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-wider">Total Words</span>
                        <span className="text-xl font-black text-slate-900 tabular-nums">{wordCount}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                        <span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-wider">Lifecycle Type</span>
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide truncate">
                            ✨ {article.type || 'Evergreen'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricRow({label, value, limit, unit, isError}: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end select-none">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                <span className={`text-xs font-black tabular-nums ${isError ? 'text-orange-650' : 'text-emerald-500'}`}>
                    {value} / {limit} {unit}
                </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${isError ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{width: `${Math.min((value / limit) * 100, 100)}%`}}
                />
            </div>
        </div>
    );
}