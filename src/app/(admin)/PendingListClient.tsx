"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  HelpCircle,
  Link2,
} from "lucide-react";
import { ArticleService } from "@/app/(admin)/article/service";
import { formatAuditTimestamp } from "@/utils/date";

export default function PendingListClient() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("ALL");

  // --- Inline Expansion & Workflow Tracking States ---
  const [expandedArticleId, setExpandedArticleId] = useState<number | null>(
    null,
  );
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [showRejectModalId, setShowRejectModalId] = useState<number | null>(
    null,
  );
  const [internalNote, setInternalNote] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try {
      // Pull prioritised queue (Oldest First)
      const data = await ArticleService.getTopPending(20);
      setArticles(data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // --- DECISION GATE ACTIONS ---

  // 1. Inline Approval Handler
  const handleInlineApprove = async (article: any) => {
    setActionLoadingId(article.id);
    try {
      await ArticleService.updateWorkflow({
        id: String(article.id),
        status: "writing",
        approval: "approved",
        oldStatus: article.status || "seo pending",
        oldApproval: "pending",
      });
      // Instantly slice out from view layout state
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      if (expandedArticleId === article.id) setExpandedArticleId(null);
    } catch (err) {
      console.error(err);
      alert("Encountered an issue processing approval workflow state changes.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Inline Rejection Confirmation Dispatch
  const handleInlineRejectSubmit = async (e: React.FormEvent, article: any) => {
    e.preventDefault();
    if (!internalNote.trim() || !showRejectModalId) return;

    setActionLoadingId(article.id);
    setShowRejectModalId(null);
    try {
      await ArticleService.updateWorkflow({
        id: String(article.id),
        status: "seo pending",
        approval: "rejected",
        oldStatus: article.status || "seo pending",
        oldApproval: "pending",
        internal_notes: internalNote,
      });
      // Instantly slice out from view layout state
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      if (expandedArticleId === article.id) setExpandedArticleId(null);
      setInternalNote("");
    } catch (err) {
      console.error(err);
      alert("Encountered an issue processing rejection workflow notes.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleExpandTray = (id: number) => {
    setExpandedArticleId(expandedArticleId === id ? null : id);
  };

  // Extract segments dynamically based on active pending queue items
  const segments = useMemo(() => {
    const priorityNames = articles
      .map((a) => a.product_priority?.name)
      .filter(Boolean);
    return ["ALL", ...Array.from(new Set(priorityNames))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesSegment =
        selectedSegment === "ALL" ||
        a.product_priority?.name === selectedSegment;
      const writerName = a.writer?.name || "";
      const matchesSearch =
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.job_code?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSegment && matchesSearch;
    });
  }, [articles, selectedSegment, searchTerm]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-2xs overflow-hidden">
      {/* HEADER CONTROLS */}
      <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-3 h-3 rounded-full bg-brand-accent ${loading ? "animate-ping" : "animate-pulse"}`}
          />
          <h3 className="font-bold text-brand-navy uppercase text-xs tracking-wider">
            Needs Approval
          </h3>
          <span className="text-[10px] bg-brand-accent/5 text-brand-accent border border-brand-accent/15 px-2.5 py-1 rounded-lg font-bold">
            {filteredArticles.length} Pending
          </span>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/80"
            size={16}
          />
          <input
            type="text"
            placeholder="Search queue..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-semibold uppercase tracking-wider focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-steel-blue outline-none transition-all placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* SEGMENT FILTER TABS */}
      {!loading && segments.length > 1 && (
        <div className="px-10 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-2 items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mr-2 select-none">
            Segments:
          </span>
          {segments.map((segment) => {
            const count = articles.filter(
              (a) => segment === "ALL" || a.product_priority?.name === segment,
            ).length;
            return (
              <button
                key={segment}
                onClick={() => setSelectedSegment(segment)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                  selectedSegment === segment
                    ? "bg-slate-900 border-slate-900 text-white shadow-3xs font-bold"
                    : "bg-white border-slate-200/80 text-slate-650 hover:bg-slate-50 transition-colors"
                }`}
              >
                {segment === "ALL" ? "All Segments" : segment} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* INTERACTIVE DATA REVIEWS */}
      {loading ? (
        <div className="p-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-slate-250" size={32} />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Fetching latest queue...
          </span>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredArticles.map((article) => {
            const isExpanded = expandedArticleId === article.id;
            const isActionBusy = actionLoadingId === article.id;

            // Calculate days pending to flag overdue strategy briefs (stale queue warning)
            const createdDate = new Date(article.created_at);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - createdDate.getTime());
            const daysPending = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const isOverdue = daysPending >= 3;

            const writerName = article.writer?.name || "Unassigned Writer";
            const categoryName = article.category?.name || "Uncategorized";
            const priorityName = article.product_priority?.name;

            return (
              <div key={article.id} className="flex flex-col transition-all">
                {/* MASTER LINE ROW */}
                <div
                  onClick={() => toggleExpandTray(article.id)}
                  className={`group flex items-center gap-8 px-10 py-6 transition-all cursor-pointer select-none border-l-4 ${
                    isOverdue
                      ? "border-l-rose-500 bg-rose-50/10 hover:bg-rose-50/20"
                      : "border-l-transparent " +
                        (isExpanded ? "bg-slate-50/50" : "hover:bg-slate-55/70")
                  }`}
                >
                  {/* Title Segment */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-sm font-bold text-brand-navy group-hover:text-brand-accent transition-colors leading-relaxed line-clamp-1">
                        {article.title}
                      </h4>
                      {isOverdue && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[8px] font-black text-rose-650 bg-rose-50 border border-rose-200/85 px-2 py-0.5 rounded-md tracking-wider uppercase animate-pulse">
                          <AlertTriangle size={10} className="text-rose-500" />{" "}
                          Stale Queue ({daysPending}d)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md tracking-wider">
                        {article.job_code || "—"}
                      </span>
                      {priorityName && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[8px] font-black text-brand-accent bg-brand-accent/5 border border-brand-accent/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none">
                          <ShieldCheck size={9} /> {priorityName}
                        </span>
                      )}
                      {article.demand !== undefined && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-250/70 px-2 py-0.5 rounded-md">
                          <Flame size={9} className="text-amber-500" />{" "}
                          {(article.demand || 0).toLocaleString("id-ID")} Vol
                        </span>
                      )}
                      {categoryName && (
                        <span className="shrink-0 text-[8px] font-black text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          📂 {categoryName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Writer Track */}
                  <div className="hidden md:flex items-center gap-3 w-44 shrink-0">
                    <div className="w-8 h-8 bg-brand-cream/60 rounded-full flex items-center justify-center text-brand-steel-blue/60 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                      <User size={14} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase truncate">
                      {writerName}
                    </span>
                  </div>

                  {/* Timestamp Track */}
                  <div className="hidden lg:flex items-center gap-2 w-40 shrink-0">
                    <Clock size={12} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {formatAuditTimestamp(article.created_at)}
                    </span>
                  </div>

                  {/* Quick Action Controls (Visible on Hover / Inactive State) */}
                  <div
                    className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-155 hidden md:flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      disabled={isActionBusy}
                      onClick={() => setShowRejectModalId(article.id)}
                      className="h-9 px-3 border border-brand-accent/25 bg-white hover:bg-brand-accent/10 text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      title="Request Revision"
                    >
                      <AlertTriangle size={11} /> Revision
                    </button>
                    <button
                      disabled={isActionBusy}
                      onClick={() => handleInlineApprove(article)}
                      className="h-9 px-3 bg-brand-accent hover:bg-brand-navy text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      title="Approve Strategy"
                    >
                      {isActionBusy && actionLoadingId === article.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <CheckCircle size={11} />
                      )}
                      Approve
                    </button>
                  </div>

                  {/* Toggle Action Control Icon */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${isExpanded ? "bg-brand-navy text-brand-cream" : "bg-brand-cream/60 text-brand-steel-blue/50 group-hover:bg-brand-cream group-hover:text-brand-navy"}`}
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                {/* CONTEXTUAL DETAIL REVIEW TRAY BLOCK */}
                {isExpanded && (
                  <div className="px-10 pb-8 pt-2 bg-slate-50/40 border-y border-slate-100 flex flex-col space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Row 1: Triple Metrics Overview Context */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-4 border border-brand-light-blue/20 rounded-2xl flex items-center gap-3">
                        <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
                          <Flame size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-brand-steel-blue/60 uppercase tracking-wider">
                            Search Demand
                          </p>
                          <p className="text-sm font-black text-brand-navy tabular-nums">
                            {(article.demand || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 border border-brand-light-blue/20 rounded-2xl flex items-center gap-3">
                        <div className="p-2.5 bg-brand-light-blue/10 text-brand-steel-blue rounded-xl">
                          <HelpCircle size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-brand-steel-blue/60 uppercase tracking-wider">
                            Search Intent
                          </p>
                          <p className="text-xs font-black text-brand-steel-blue">
                            {article.intent || "Informational"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 border border-brand-light-blue/20 rounded-2xl flex items-center gap-3">
                        <div className="p-2.5 bg-brand-accent/10 text-brand-accent rounded-xl">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-brand-steel-blue/60 uppercase tracking-wider">
                            Classification
                          </p>
                          <p className="text-xs font-black text-brand-accent">
                            {article.classification || "Infantry"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Deep Intent Keyword Copy Deck Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 bg-white p-4 border border-brand-light-blue/20 rounded-2xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-steel-blue/60 block">
                          Target Focus Keyword
                        </span>
                        <p className="text-xs font-mono font-bold text-brand-navy bg-brand-cream/40 px-2.5 py-1.5 rounded border border-brand-light-blue/10 mt-1">
                          {article.target_keyword || "—"}
                        </p>
                      </div>

                      <div className="space-y-1 bg-white p-4 border border-brand-light-blue/20 rounded-2xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-steel-blue/60 block">
                          Meta Description Snippet
                        </span>
                        <p className="text-xs font-medium text-brand-steel-blue leading-relaxed mt-1">
                          {article.meta_description || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Row 3: Live Decision Trigger Toolbar */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-brand-light-blue/15">
                      <a
                        href={`/seo-keyword/edit/${article.id}`}
                        className="text-[10px] font-black text-brand-navy/60 hover:text-brand-accent uppercase tracking-wider transition-colors flex items-center gap-1.5"
                      >
                        <Link2 size={12} /> View Full Specification
                      </a>

                      <div className="flex items-center gap-3">
                        <button
                          disabled={isActionBusy}
                          onClick={() => setShowRejectModalId(article.id)}
                          className="px-5 py-2.5 border border-brand-accent/20 bg-white hover:bg-brand-accent/10 text-brand-accent rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <AlertTriangle size={14} /> Request Revision
                        </button>

                        <button
                          disabled={isActionBusy}
                          onClick={() => handleInlineApprove(article)}
                          className="px-6 py-2.5 bg-brand-accent hover:bg-brand-navy text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                        >
                          {isActionBusy && actionLoadingId === article.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />{" "}
                              Authorizing...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} /> Approve Strategy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* INDEPENDENT FLOATING INLINE OVERLAY FOR ENTRY LEVEL REJECTIONS */}
                {showRejectModalId === article.id && (
                  <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-brand-cream rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-light-blue/20 animate-in zoom-in-95 duration-150">
                      <h3 className="text-base font-black text-brand-navy mb-1">
                        Reject Strategic Concepts
                      </h3>
                      <p className="text-xs text-brand-steel-blue font-bold uppercase tracking-wider mb-4">
                        Provide clear internal instructions
                      </p>

                      <form
                        onSubmit={(e) => handleInlineRejectSubmit(e, article)}
                      >
                        <textarea
                          required
                          rows={4}
                          className="w-full bg-white border border-brand-light-blue/30 rounded-xl p-3.5 text-xs font-medium text-brand-navy outline-none focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-steel-blue transition-all resize-none placeholder:text-slate-400"
                          placeholder="Specify exact optimizations required (e.g. adjust alignment, target commercial metrics instead...)"
                          value={internalNote}
                          onChange={(e) => setInternalNote(e.target.value)}
                        />

                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            type="button"
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-steel-blue hover:bg-brand-light-blue/10 rounded-xl transition-colors"
                            onClick={() => {
                              setShowRejectModalId(null);
                              setInternalNote("");
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!internalNote.trim()}
                            className="bg-brand-accent hover:bg-brand-navy text-white px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-40"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* EMPTY RESULTS STATE */}
          {filteredArticles.length === 0 && (
            <div className="p-24 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <CheckCircle size={32} />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                {searchTerm
                  ? "No matching pending articles"
                  : "All caught up! Queue is empty"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
