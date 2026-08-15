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
