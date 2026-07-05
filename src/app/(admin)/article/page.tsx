'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleService } from './service';
import { WriterService } from '../writer/service';
import { CategoryService } from '../category/service';
import { SectionService } from '../section/service';
import { LookupOptions, ArticleDisplay } from '@/types/article';
import ProductionFilterPanel from './ProductionFilterPanel';
import ProductionDataGrid from './ProductionDataGrid';

export default function ArticleProductionPage() {
    const now = new Date();

    // --- Core Filter State Coordinates ---
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [writerId, setWriterId] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');
    const [page] = useState(1);

    // --- Operational Lifecycle State ---
    const [articles, setArticles] = useState<ArticleDisplay[]>([]);
    const [writers, setWriters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [options, setOptions] = useState<LookupOptions>({
        categories: [],
        sections: [],
        productTags: [],
        themes: [],
        personas: [],
        campaigns: []
    });

    // Handle smooth search text input debounce execution cycles
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Gather select dropdown parameters concurrently on mount
    useEffect(() => {
        async function loadLookupOptions() {
            try {
                const [w, c, secData] = await Promise.all([
                    WriterService.getWriters(),
                    CategoryService.getCategories(),
                    SectionService.getSections({ page: 1, limit: 100, search: '' }).then(res => res.sections)
                ]);
                setWriters(w);
                setOptions(prev => ({ ...prev, categories: c, sections: secData }));
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
                categoryId: categoryId || null,
                contentType: contentType || null,
                searchQuery: debouncedSearch || null
            });
            setArticles(collectedData || []);
        } catch (err) {
            console.error("Error executing sheet synchronization loop:", err);
        } finally {
            setLoading(false);
        }
    }, [year, month, page, writerId, categoryId, contentType, debouncedSearch]);

    useEffect(() => {
        loadProductionData();
    }, [loadProductionData]);

    return (
        <div className="space-y-8 animate-in fade-in duration-200">

            {/* 1. SECTION TITLE INTRO */}
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Production Sheet</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Corporate Editorial Content Lifecycle
                </p>
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
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                contentType={contentType}
                setContentType={setContentType}
                writers={writers}
                options={options}
            />

            {/* 3. HIGH-DENSITY VISUAL DATA GRID */}
            <ProductionDataGrid
                articles={articles}
                loading={loading}
            />

        </div>
    );
}