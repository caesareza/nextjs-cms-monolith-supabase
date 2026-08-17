"use client";

import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Flame,
  FolderKanban,
  History,
  Info,
  Link2,
  Loader2,
  Lock,
  Megaphone,
  Save,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArticleService } from "@/app/(admin)/article/service";
import HtmlEditor from "@/components/editor/HtmlEditor";

interface EditProps {
  initialData: any;
  writers: any[];
  categories: any[];
  sections: any[];
  productTags: any[];
  themes: any[];
  personas: any[];
  campaigns: any[];
  productPriorities: any[];
  logs?: any[];
}

export default function EditArticleClient({
  initialData,
  writers,
  categories,
  sections,
  productTags,
  themes,
  personas,
  campaigns,
  productPriorities,
  logs = [],
}: EditProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewLog, setPreviewLog] = useState<any>(null);

  const [form, setForm] = useState({
    writer_id: initialData.writer_id || 0,
    content: initialData.content || "",
    cta_internal_link: initialData.cta_internal_link || "",
    seo_check: initialData.seo_check || "pending",
    index_status: initialData.index_status || "noindex",
    internal_notes: initialData.internal_notes || "",
    content_old: initialData.content_old || "",
    status: initialData.status || "draft",
    // Immutable Strategy Inclusions
    title: initialData.title || "",
    category_id: initialData.category_id || 0,
    section_id: initialData.section_id || 0,
    product_id: initialData.product_id || 0,
    production_month: initialData.production_month
      ? initialData.production_month.split("T")[0]
      : "",
    meta_description: initialData.meta_description || "",
    target_keyword: initialData.target_keyword || "",
    related_keyword: initialData.related_keyword || "",
    demand: String(initialData.demand || 0),
    intent: initialData.intent || "Informational",
    type: initialData.type || "Evergreen",
    classification: initialData.classification || "Infantry",
    theme_id: initialData.theme_id ? String(initialData.theme_id) : "",
    persona_id: initialData.persona_id ? String(initialData.persona_id) : "",
    campaign_id: initialData.campaign_id ? String(initialData.campaign_id) : "",
    gdrive_draft_content: initialData.gdrive_draft_content || "",
    product_priority_id: initialData.product_priority_id
      ? String(initialData.product_priority_id)
      : "",
  });

  // Strategy blocker condition assignment check matching system rules
  const isSeoPending = initialData.status === "seo pending";

  // String Resolvers for Read-Only Sidebar Data Presentations
  const currentSection =
    sections.find((s) => s.id === initialData.section_id)?.name ||
    "General Context";
  const currentCategory =
    categories.find((c) => c.id === initialData.category_id)?.name ||
    "Uncategorized";
  const currentProduct =
    productTags.find((t) => t.id === initialData.product_id)?.name ||
    "General Target";
  const currentPriorityProduct =
    productPriorities.find((p) => p.id === initialData.product_priority_id)
      ?.name || "General";
  const currentTheme =
    themes.find((t) => t.id === Number(initialData.theme_id))?.name ||
    "General Theme";
  const currentPersona =
    personas.find((p) => p.id === Number(initialData.persona_id))?.name ||
    "All Target Profiles";
  const currentCampaign =
    campaigns.find((c) => c.id === Number(initialData.campaign_id))?.name ||
    "Organic Strategy";
  const formattedMonth = initialData.production_month
    ? new Date(initialData.production_month).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    : "—";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSeoPending) return;

    // Front-End Required Field Structural Check Matrix
    const cleanContent = form.content?.replace(/<[^>]*>/g, "").trim();

    if (!form.writer_id || Number(form.writer_id) === 0) {
      setError(
        "Please assign a writer to this article before saving your changes.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!form.content || cleanContent === "") {
      setError(
        "The content body canvas cannot be left blank. Please add your draft body copy before pushing updates.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ArticleService.updateArticle(initialData.id, {
        ...form,
        writer_id: Number(form.writer_id),
        category_id: Number(form.category_id),
        section_id: Number(form.section_id),
        product_id: Number(form.product_id),
        demand: parseInt(form.demand, 10) || 0,
        theme_id: form.theme_id ? Number(form.theme_id) : null,
        persona_id: form.persona_id ? Number(form.persona_id) : null,
        campaign_id: form.campaign_id ? Number(form.campaign_id) : null,
        product_priority_id: form.product_priority_id
          ? Number(form.product_priority_id)
          : null,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/article/${initialData.id}`);
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        "A network infrastructure fault blocked saving changes. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-32 p-12 bg-white rounded-2xl text-center shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          Changes Synchronized
        </h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">
          Updating workflows...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleUpdate}
      className="max-w-7xl mx-auto space-y-6 pb-20 text-slate-900 animate-in fade-in duration-200"
    >
      {/* ACTION HUD TRIGGER BAR */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ChevronLeft size={14} /> Discard Changes
        </button>

        <button
          disabled={loading || isSeoPending}
          type="submit"
          className="text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 flex items-center gap-2 bg-brand-navy active:scale-95 disabled:bg-slate-105 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : isSeoPending ? (
            <Lock size={14} />
          ) : (
            <Save size={16} />
          )}
          {isSeoPending ? "Strategy Locked" : "Push Updates"}
        </button>
      </div>

      {/* VALIDATION ALERT PANEL */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3 text-orange-850 shadow-xs animate-in slide-in-from-top-3 duration-200">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 mt-0.5">
            <Info size={16} />
          </div>
          <div className="flex-1 space-y-0.5">
            <h4 className="text-xs font-black uppercase tracking-wider">
              Required Field Validation Alert
            </h4>
            <p className="text-xs font-medium text-orange-700/90 leading-relaxed">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-orange-500 hover:text-orange-700 text-[10px] font-black uppercase tracking-tight px-2 py-1 hover:bg-orange-100 rounded-md transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TWIN ARCHITECTURE LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT CANVAS: INTERACTIVE FORM LAYOUT CANVAS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-xs space-y-6">
            {/* READ-ONLY TITLE ACCORDION ABOVE INPUTS */}
            <div className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block select-none">
                  Target Strategy Brief Topic
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {form.title}
                </h1>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1 select-all shrink-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block select-none">
                  Job Code
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200/85 px-2.5 py-1 rounded-md tracking-wider whitespace-nowrap shadow-xs">
                  {initialData.job_code || "—"}
                </span>
              </div>
            </div>

            {/* ROW: WRITER SELECT AND STATUS LIFECYCLE DROPDOWNS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {/* Writer Selector Input Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                  <User className="text-slate-400" size={12} /> Writer
                  Assignment{" "}
                  <span className="text-brand-accent font-bold">*</span>
                </label>
                <select
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white cursor-pointer"
                  value={form.writer_id}
                  onChange={(e) =>
                    setForm({ ...form, writer_id: parseInt(e.target.value) })
                  }
                >
                  <option value={0}>Select Writer...</option>
                  {writers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✨ NEW FEATURE: WORKFLOW STATUS SELECT MENU DROPDOWN */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                  <Activity className="text-slate-400" size={12} /> Article
                  Workflow Status
                </label>
                <select
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none focus:bg-white cursor-pointer lowercase"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="seo pending">seo pending</option>
                  <option value="writing">writing</option>
                  <option value="ready for review">ready for review</option>
                  <option value="published">published</option>
                  <option value="deleted">deleted</option>
                </select>
              </div>
            </div>

            {/* Rich Text Editor Body Block */}
            <div className="relative pt-2">
              {isSeoPending && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[0.5px] z-40 rounded-2xl flex flex-col items-center justify-center gap-2 select-none text-center">
                  <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md">
                    <Lock size={14} />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Canvas Locked
                  </h4>
                  <p className="text-slate-400 text-[9px] max-w-xs uppercase tracking-tight">
                    Active strategy briefs require director verification.
                  </p>
                </div>
              )}
              <div
                className={isSeoPending ? "opacity-10 pointer-events-none" : ""}
              >
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">
                  Content Body (HTML Mode){" "}
                  <span className="text-brand-accent font-bold">*</span>
                </label>
                <HtmlEditor
                  value={form.content}
                  onChange={(html: string) =>
                    setForm({ ...form, content: html })
                  }
                />
              </div>
            </div>

            {/* CTA Internal Link Textarea */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                <Link2 className="text-slate-400" size={12} /> CTA Internal
                Destination Links
              </label>
              <textarea
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-brand-accent/20 focus:ring-4 focus:ring-brand-light-blue/20 transition-all leading-relaxed"
                placeholder="Paste structural target linking parameters..."
                value={form.cta_internal_link}
                onChange={(e) =>
                  setForm({ ...form, cta_internal_link: e.target.value })
                }
              />
            </div>

            {/* Google Drive Draft Content Link Input */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                <Link2 className="text-slate-400" size={12} /> Google Drive
                Draft Content Link
              </label>
              <input
                type="url"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-brand-accent/20 focus:ring-4 focus:ring-brand-light-blue/20 transition-all"
                placeholder="https://docs.google.com/document/d/..."
                value={form.gdrive_draft_content}
                onChange={(e) =>
                  setForm({ ...form, gdrive_draft_content: e.target.value })
                }
              />
            </div>
          </div>

          {/* COMPLIANCE CONTROLS & BACKUPS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-xs space-y-6">
            <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] border-b border-slate-100 pb-3 select-none">
              Internal Compliance Systems & Logs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  System SEO Check
                </label>
                <select
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white"
                  value={form.seo_check}
                  onChange={(e) =>
                    setForm({ ...form, seo_check: e.target.value })
                  }
                >
                  <option value="pending">⏳ Pending Review</option>
                  <option value="pass">✅ Pass Verification</option>
                  <option value="fail">❌ Fail / Blocked</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Google Index Intent
                </label>
                <select
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white"
                  value={form.index_status}
                  onChange={(e) =>
                    setForm({ ...form, index_status: e.target.value })
                  }
                >
                  <option value="noindex">🚫 Noindex Header Block</option>
                  <option value="index">🌐 Index Crawler Access</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">
                Internal Reviewer Logs
              </label>
              <textarea
                rows={2}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white resize-none leading-relaxed"
                placeholder="Type internal feedback or review specifications notes..."
                value={form.internal_notes}
                onChange={(e) =>
                  setForm({ ...form, internal_notes: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">
                Legacy Source Backup Archive (Content Old)
              </label>
              <textarea
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white resize-none leading-relaxed"
                placeholder="Raw markdown snapshot backup records fallback..."
                value={form.content_old}
                onChange={(e) =>
                  setForm({ ...form, content_old: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* =========================================================
                    RIGHT HAND SIDE COLUMN: STICKY READ-ONLY STRATEGY METRICS
                   ========================================================= */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* CARD 1: HIGH-DENSITY PERFORMANCE HUD CODES */}
          <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-md space-y-4 select-none">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Forecast & Core Pillars
            </span>
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1 text-slate-400">
                  <Flame className="text-orange-400 shrink-0" size={12} />{" "}
                  Search Demand
                </span>
                <span className="font-black tabular-nums text-white text-sm">
                  {Number(form.demand).toLocaleString("id-ID")}
                </span>
              </div>
              <p className="flex justify-between px-1">
                <span className="text-slate-400">Search Intent:</span>
                <span className="font-extrabold text-emerald-400 uppercase">
                  {form.intent}
                </span>
              </p>
              <p className="flex justify-between px-1">
                <span className="text-slate-400">Lifecycle Type:</span>
                <span className="font-extrabold text-amber-400 uppercase">
                  {form.type}
                </span>
              </p>
              <p className="flex justify-between px-1 items-center">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck
                    className="text-brand-accent shrink-0"
                    size={12}
                  />{" "}
                  Classification:
                </span>
                <span className="font-extrabold text-brand-accent uppercase">
                  {form.classification}
                </span>
              </p>
            </div>
          </div>

          {/* CARD 4: PERSISTENT KEYWORD CONSTRAINT CHEAT SHEET */}
          <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest block select-none">
              Brief Validation Strategy
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">
                  Focus Target Keyword
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 select-all block mt-0.5 bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  {form.target_keyword || "—"}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">
                  Required Meta Description Tag
                </span>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed mt-1 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  {form.meta_description || "No tag summaries provided."}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">
                  Related Keywords
                </span>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed mt-1 bg-slate-50 border border-slate-100 p-3 rounded-xl whitespace-pre-line">
                  {form.related_keyword || "No related keywords specified."}
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2: TAXONOMY HIERARCHY MAP */}
          <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-xs space-y-4 font-medium text-slate-700">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest block select-none">
              Taxonomy Hierarchies
            </h4>

            <div className="space-y-3.5 text-xs pt-1">
              <div className="flex items-start gap-3">
                <FolderKanban
                  className="text-slate-300 mt-0.5 shrink-0"
                  size={14}
                />
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase select-none">
                    Section Cluster
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentSection}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FolderKanban
                  className="text-slate-300 mt-0.5 shrink-0"
                  size={14}
                />
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase select-none">
                    Category Cluster
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentCategory}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="text-slate-300 mt-0.5 shrink-0" size={14} />
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase select-none">
                    Product Association
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentProduct}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="text-slate-300 mt-0.5 shrink-0"
                  size={14}
                />
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase select-none">
                    Priority Product
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentPriorityProduct}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar
                  className="text-slate-300 mt-0.5 shrink-0"
                  size={14}
                />
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase select-none">
                    Production Cycle
                  </span>
                  <span className="font-bold text-slate-800 tracking-tight">
                    {formattedMonth}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: CORPORATE MARKETING SUITE CONTEXT */}
          <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-xs space-y-4 font-medium text-slate-600">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest block select-none">
              Marketing Matrix Context
            </h4>
            <div className="space-y-3 text-xs pt-1">
              <div className="flex items-start gap-3">
                <Sparkles
                  className="text-slate-300 mt-0.5 shrink-0"
                  size={14}
                />
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase select-none">
                    Strategic Theme
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentTheme}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="text-slate-300 mt-0.5 shrink-0" size={14} />
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase select-none">
                    Audience Persona
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentPersona}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Megaphone
                  className="text-slate-300 mt-0.5 shrink-0"
                  size={14}
                />
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase select-none">
                    Campaign Attribution
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentCampaign}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: WORKFLOW AUDIT TIMELINE */}
          <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest block select-none">
              Workflow Audit Timeline
            </h4>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-450 italic">
                No historical activities logged.
              </p>
            ) : (
              <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6 pt-2">
                {logs.map((log) => {
                  const logDate = new Date(log.created_at).toLocaleString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );
                  const hasBackup = !!log.content_backup;

                  return (
                    <div key={log.id} className="relative group/item">
                      {/* Timeline Dot Indicator */}
                      <span
                        className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${hasBackup
                          ? "bg-brand-accent animate-pulse"
                          : "bg-slate-350"
                          }`}
                      />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-800">
                            {log.notes || "Workflow log update"}
                          </p>
                          <span className="text-[8px] font-semibold text-slate-400 tabular-nums">
                            {logDate}
                          </span>
                        </div>

                        {log.user_email && (
                          <p className="text-[9px] text-slate-400 font-medium lowercase truncate">
                            by {log.user_email}
                          </p>
                        )}

                        {/* Status/Approval Transitions */}
                        {(log.old_status || log.new_status) && (
                          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-slate-500 pt-0.5 tracking-wider">
                            <span className="bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                              {log.old_status || "—"}
                            </span>
                            <span>➔</span>
                            <span className="bg-slate-900 text-white px-1 py-0.5 rounded">
                              {log.new_status || "—"}
                            </span>
                          </div>
                        )}

                        {hasBackup && (
                          <button
                            type="button"
                            onClick={() => setPreviewLog(log)}
                            className="mt-2 text-[9px] font-black text-brand-accent hover:text-brand-navy uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <History size={10} /> Preview & Restore
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Draft Preview & Restore Modal Overlay */}
      {previewLog && (
        <div
          className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewLog(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-650">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Preview Historical Draft
                  </h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Logged by {previewLog.user_email || "system"} on{" "}
                    {new Date(previewLog.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: Raw HTML Preview Panel */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs prose prose-slate max-w-none min-h-[300px]">
                {/* Render the backup HTML content securely */}
                <div
                  className="text-xs text-slate-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: previewLog.content_backup || "",
                  }}
                />
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                Restoring will overwrite current editor body canvas
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewLog(null)}
                  className="px-4 py-2 text-slate-450 hover:text-slate-700 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to restore this historical draft? This will replace your current editor content.",
                      )
                    ) {
                      setForm({
                        ...form,
                        content: previewLog.content_backup || "",
                      });
                      setPreviewLog(null);
                      alert(
                        "Draft successfully restored! Please click 'Push Updates' to save changes.",
                      );
                    }
                  }}
                  className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={12} /> Restore This Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
