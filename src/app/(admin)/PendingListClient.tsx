"use client";

import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  HelpCircle,
  Link2,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ArticleService } from "@/app/(admin)/article/service";
import { sendStaleKeywordsEmail } from "@/app/actions/email";
import { formatAuditTimestamp } from "@/utils/date";

export default function PendingListClient() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("ALL");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // --- Inline Expansion & Workflow Tracking States ---
  const [expandedArticleId, setExpandedArticleId] = useState<number | null>(
    null,
  );
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [showRejectModalId, setShowRejectModalId] = useState<number | null>(
    null,
  );
  const [internalNote, setInternalNote] = useState("");

  // --- Email Alerts Workflow States ---
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [lastSentDate, setLastSentDate] = useState<string | null>(null);
  const [emailAlertStatus, setEmailAlertStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [customEmailMessage, setCustomEmailMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("posthinks_last_email_sent_date");
      if (stored) setLastSentDate(stored);
    }
  }, []);

  const isEmailSentToday = useMemo(() => {
    if (!lastSentDate) return false;
    try {
      const lastDate = new Date(lastSentDate);
      const today = new Date();
      return lastDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  }, [lastSentDate]);

  const handleEmailStaleAlerts = async () => {
    const staleArticles = articles.filter(
      (a) => getDaysPending(a.created_at) >= 3,
    );
    if (staleArticles.length === 0) return;

    setIsEmailSending(true);
    setEmailAlertStatus({ type: null, message: "" });
    try {
      const res = await sendStaleKeywordsEmail({
        articles: staleArticles,
        customMessage: customEmailMessage,
      });
      if (res.success) {
        const now = new Date().toISOString();
        if (typeof window !== "undefined") {
          localStorage.setItem("posthinks_last_email_sent_date", now);
        }
        setLastSentDate(now);
        setEmailAlertStatus({
          type: "success",
          message:
            "Editorial revision alerts sent successfully to the distribution list!",
        });
        setTimeout(
          () => setEmailAlertStatus({ type: null, message: "" }),
          6000,
        );
        setShowEmailConfirmModal(false);
        setCustomEmailMessage("");
      } else {
        setEmailAlertStatus({
          type: "error",
          message: `Failed to send alerts: ${res.message}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setEmailAlertStatus({
        type: "error",
        message:
          err.message ||
          "An unexpected error occurred while dispatching emails.",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

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

  // Helper to compute days brief has been pending Strategy approval
  const getDaysPending = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const overdueCount = useMemo(() => {
    return articles.filter((a) => getDaysPending(a.created_at) >= 3).length;
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesSegment =
        selectedSegment === "ALL" ||
        a.product_priority?.name === selectedSegment;

      const daysPending = getDaysPending(a.created_at);
      const matchesOverdue = !showOverdueOnly || daysPending >= 3;

      const writerName = a.writer?.name || "";
      const matchesSearch =
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.job_code?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSegment && matchesOverdue && matchesSearch;
    });
  }, [articles, selectedSegment, searchTerm, showOverdueOnly]);

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
      {!loading && (
        <div className="px-10 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            {segments.length > 1 && (
              <>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mr-2 select-none">
                  Segments:
                </span>
                {segments.map((segment) => {
                  const count = articles.filter(
                    (a) =>
                      segment === "ALL" || a.product_priority?.name === segment,
                  ).length;
                  return (
                    <button
                      type="button"
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
              </>
            )}
          </div>

          {/* Overdue Switcher & Email Action */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                showOverdueOnly
                  ? "bg-rose-600 border-rose-600 text-white shadow-3xs font-bold animate-pulse"
                  : "bg-white border-slate-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <AlertTriangle
                size={11}
                className={showOverdueOnly ? "text-white" : "text-rose-500"}
              />
              Overdue ASAP ({overdueCount})
            </button>

            {overdueCount > 0 && (
              <button
                type="button"
                disabled={isEmailSending || isEmailSentToday}
                onClick={() => setShowEmailConfirmModal(true)}
                className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-slate-105 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                title={
                  isEmailSentToday
                    ? "Revision email alert can only be sent once a day."
                    : "Email Stale Alerts"
                }
              >
                {isEmailSending ? (
                  <Loader2 size={11} className="animate-spin text-white" />
                ) : (
                  <Mail
                    size={11}
                    className={
                      isEmailSentToday ? "text-slate-400" : "text-white"
                    }
                  />
                )}
                {isEmailSending
                  ? "Sending alerts..."
                  : isEmailSentToday
                    ? "Alerts Sent Today"
                    : "Email Stale Alerts"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Email Status Banner */}
      {emailAlertStatus.type && (
        <div
          className={`px-10 py-3 text-[10px] font-bold uppercase tracking-wider border-b flex items-center justify-between ${emailAlertStatus.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-rose-50 text-rose-800 border-rose-100"}`}
        >
          <span>{emailAlertStatus.message}</span>
          <button
            type="button"
            onClick={() => setEmailAlertStatus({ type: null, message: "" })}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Email Dispatch Confirmation Modal */}
      {showEmailConfirmModal && (
        <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xl max-w-md w-full mx-4 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-xl bg-slate-105 flex items-center justify-center text-slate-600">
                <Mail size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Confirm Alert Email
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  stale editorial queue
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-550 leading-relaxed">
              You are about to dispatch stale strategy alerts for{" "}
              <span className="font-bold text-slate-800">{overdueCount}</span>{" "}
              brief(s). You can append a custom message below to include
              additional instructions.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Custom Message (Optional)
              </label>
              <textarea
                value={customEmailMessage}
                onChange={(e) => setCustomEmailMessage(e.target.value)}
                placeholder="Type any strategic instructions, priorities, or remarks to include in the email..."
                rows={4}
                className="w-full p-3 bg-slate-50 hover:bg-slate-50/80 border border-slate-250 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-accent/20 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEmailConfirmModal(false);
                  setCustomEmailMessage("");
                }}
                disabled={isEmailSending}
                className="px-4 py-2 text-slate-400 hover:text-slate-700 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmailStaleAlerts}
                disabled={isEmailSending}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEmailSending ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>Send Alert</>
                )}
              </button>
            </div>
          </div>
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
                  className={`group flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 sm:px-8 sm:py-6 transition-all cursor-pointer select-none border-l-4 ${
                    isOverdue
                      ? "border-l-rose-500 bg-rose-50/10 hover:bg-rose-50/20"
                      : "border-l-transparent " +
                        (isExpanded ? "bg-slate-50/50" : "hover:bg-slate-50/30")
                  }`}
                >
                  {/* Title Segment */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-sm sm:text-base font-extrabold text-brand-navy group-hover:text-brand-accent transition-colors leading-relaxed">
                        {article.title?.trim() || (
                          <span className="text-slate-400 italic font-medium">
                            Untitled Strategy Brief
                          </span>
                        )}
                      </h4>
                      {isOverdue && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[8px] font-black text-rose-650 bg-rose-50 border border-rose-200/85 px-2 py-0.5 rounded-md tracking-wider uppercase animate-pulse">
                          <AlertTriangle size={10} className="text-rose-500" />{" "}
                          Stale Queue ({daysPending}d)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md tracking-wider whitespace-nowrap">
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
                        <span className="shrink-0 text-[8px] font-black text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                          📂 {categoryName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata & Actions Segment */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                    {/* Writer Track */}
                    <div className="flex items-center gap-2.5 w-36 shrink-0">
                      <div className="w-7 h-7 bg-brand-cream/60 rounded-full flex items-center justify-center text-brand-steel-blue/60 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                        <User size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase truncate">
                        {writerName}
                      </span>
                    </div>

                    {/* Timestamp Track */}
                    <div className="flex items-center gap-2 w-32 shrink-0">
                      <Clock size={11} className="text-slate-350" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {formatAuditTimestamp(article.created_at)}
                      </span>
                    </div>

                    {/* Quick Action Controls (Visible on Hover / Inactive State) */}
                    <div
                      className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={isActionBusy}
                        onClick={() => setShowRejectModalId(article.id)}
                        className="h-8 px-3 border border-brand-accent/25 bg-white hover:bg-brand-accent/10 text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                        title="Request Revision"
                      >
                        <AlertTriangle size={11} /> Revision
                      </button>
                      <button
                        type="button"
                        disabled={isActionBusy}
                        onClick={() => handleInlineApprove(article)}
                        className="h-8 px-3 bg-brand-accent hover:bg-brand-navy text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1 disabled:opacity-40"
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
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${isExpanded ? "bg-brand-navy text-brand-cream" : "bg-brand-cream/60 text-brand-steel-blue/50 group-hover:bg-brand-cream group-hover:text-brand-navy"}`}
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </div>
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
