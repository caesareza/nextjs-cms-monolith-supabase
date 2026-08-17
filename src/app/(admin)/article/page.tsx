"use client";

import { Download, Rocket } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ArticleDisplay, LookupOptions } from "@/types/article";
import { exportArticlesToExcel } from "@/utils/export";
import { CategoryService } from "../category/service";
import { ProductPriorityService } from "../product-priority/service";
import { SectionService } from "../section/service";
import { WriterService } from "../writer/service";
import ProductionDataGrid from "./ProductionDataGrid";
import ProductionFilterPanel from "./ProductionFilterPanel";
import { ArticleService } from "./service";

export default function ArticleProductionPage() {
  const now = new Date();

  // --- Core Filter State Coordinates ---
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [writerId, setWriterId] = useState<string>("");
  const [productPriorityId, setProductPriorityId] = useState<string>("");
  const [contentType, setContentType] = useState<string>("");
  const [page] = useState(1);

  // --- Operational Lifecycle State ---
  const [articles, setArticles] = useState<ArticleDisplay[]>([]);
  const [writers, setWriters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [options, setOptions] = useState<LookupOptions>({
    categories: [],
    sections: [],
    productTags: [],
    themes: [],
    personas: [],
    campaigns: [],
  });

  // Handle smooth search text input debounce execution cycles
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    document.title = "Article Production Dashboard | PT CMS";
  }, []);

  // Gather select dropdown parameters concurrently on mount
  useEffect(() => {
    async function loadLookupOptions() {
      try {
        const [w, c, secData, pr] = await Promise.all([
          WriterService.getWriters(),
          CategoryService.getCategories(),
          SectionService.getSections({ page: 1, limit: 100, search: "" }).then(
            (res) => res.sections,
          ),
          ProductPriorityService.getAllActiveProductPriorities(),
        ]);
        setWriters(w);
        setOptions((prev) => ({
          ...prev,
          categories: c,
          sections: secData,
          productPriorities: pr,
        }));
      } catch (err) {
        console.error("Failed to collect filter lookup arrays:", err);
      }
    }
    loadLookupOptions();
  }, []);

  // Primary data sync dispatcher mapped out to the service tier
  const loadProductionData = useCallback(async () => {
    setLoading(true);
    try {
      const { articles: collectedData } = await ArticleService.getArticles({
        year,
        month,
        page,
        writerId: writerId || null,
        productPriorityId: productPriorityId || null,
        categoryId: null,
        contentType: contentType || null,
        searchQuery: debouncedSearch || null,
      });
      setArticles(collectedData || []);
    } catch (err) {
      console.error("Error executing sheet synchronization loop:", err);
    } finally {
      setLoading(false);
    }
  }, [
    year,
    month,
    page,
    writerId,
    productPriorityId,
    contentType,
    debouncedSearch,
  ]);

  useEffect(() => {
    loadProductionData();
  }, [loadProductionData]);

  const handleExportExcel = useCallback(async () => {
    try {
      await exportArticlesToExcel(articles, year, month);
    } catch (err) {
      console.error("Failed to export articles to Excel:", err);
    }
  }, [articles, year, month]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. SECTION TITLE INTRO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-steel-blue shrink-0">
            <Rocket size={18} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
              Production Sheet
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              Corporate Editorial Content Lifecycle
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 cursor-pointer flex items-center gap-1.5 transition-all self-start sm:self-center"
        >
          <Download size={12} /> Export Excel
        </button>
      </div>

      {/* 1.5. HIGH-DENSITY PRODUCTION STATISTICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none animate-in fade-in duration-300 delay-100">
        {/* Card 1: Monthly Production Goal Progress */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Monthly Target Progress
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {articles.length}{" "}
                <span className="text-xs text-slate-400 font-bold">
                  / 80 posts
                </span>
              </p>
            </div>
            <div className="p-3 bg-brand-accent/10 text-brand-accent rounded-xl">
              <Rocket size={18} />
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-500">
                {Math.round((articles.length / 80) * 100)}% Completed
              </span>
              <span className="text-slate-450 font-mono">Target: 80</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, Math.round((articles.length / 80) * 100))}%`,
                }}
                className="bg-brand-accent h-full rounded-full transition-all duration-500 ease-out"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Workflow Pipeline Status */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-3">
          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Pipeline Distribution
          </span>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="block text-base font-extrabold text-slate-800">
                {
                  articles.filter(
                    (a) => a.status === "draft" || a.status === "writing",
                  ).length
                }
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mt-0.5">
                Drafts
              </span>
            </div>
            <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-center">
              <span className="block text-base font-extrabold text-indigo-650">
                {articles.filter((a) => a.status === "ready for review").length}
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mt-0.5">
                In Review
              </span>
            </div>
            <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-center">
              <span className="block text-base font-extrabold text-emerald-650">
                {articles.filter((a) => a.status === "published").length}
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mt-0.5">
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Target Quality & Trajectory Indicator */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Production Pace Status
              </span>
              <h4 className="text-sm font-extrabold text-slate-800 mt-1 leading-snug">
                {articles.length >= 80
                  ? "🎉 Goal Reached!"
                  : articles.length >= 60
                    ? "⚡ On Track for Goal"
                    : articles.length >= 40
                      ? "📈 Moderate Pace"
                      : "⚠️ Action Required"}
              </h4>
            </div>
            <span
              className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${
                articles.length >= 80
                  ? "bg-emerald-50 text-emerald-700"
                  : articles.length >= 60
                    ? "bg-blue-50 text-blue-700"
                    : articles.length >= 40
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700 animate-pulse"
              }`}
            >
              {articles.length >= 80
                ? "Goal Met"
                : articles.length >= 40
                  ? "On Track"
                  : "Low Output"}
            </span>
          </div>

          <p className="text-[10px] text-slate-450 font-medium leading-relaxed pt-2">
            {articles.length >= 80
              ? "Awesome! The production goal has been fully met for this period."
              : `Needs ${80 - articles.length} more posts to satisfy the monthly target of 80.`}
          </p>
        </div>
      </div>

      {/* 2. ENCAPSULATED CONTROLS & FILTER BAR */}
      <ProductionFilterPanel
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        writerId={writerId}
        setWriterId={setWriterId}
        productPriorityId={productPriorityId}
        setProductPriorityId={setProductPriorityId}
        contentType={contentType}
        setContentType={setContentType}
        writers={writers}
        options={options}
      />

      {/* 3. HIGH-DENSITY VISUAL DATA GRID */}
      <ProductionDataGrid articles={articles} loading={loading} />
    </div>
  );
}
