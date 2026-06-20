import ArticleClient from './ArticleClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Article Management | OCBC Nexus',
    description: 'Manage production roadmap, SEO checks, and publication status.',
};

export default function ArticlePage() {
    return (
        <div className="max-w-400 mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Article - Production Sheet</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Production Roadmap & SEO Performance Tracking</p>
                </div>
                {/* Action Button for future Create CRUD */}
                {/*<Link href="/article/new" className="px-6 py-3 bg-[#EE1C25] text-white rounded-2xl text-sm font-black shadow-lg shadow-red-100 hover:bg-[#D71921] transition-all transform active:scale-95">*/}
                {/*    + Create New Article*/}
                {/*</Link>*/}
            </div>

            {/* The Main Client Component */}
            <ArticleClient />
        </div>
    );
}