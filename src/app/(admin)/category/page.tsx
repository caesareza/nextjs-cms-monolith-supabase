import CategoryClient from './CategoryClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Categories | OCBC Nexus',
};

export default function CategoryPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Categories</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Define the segments for Individu or Bisnis sectors.</p>
            </div>
            <CategoryClient />
        </div>
    );
}