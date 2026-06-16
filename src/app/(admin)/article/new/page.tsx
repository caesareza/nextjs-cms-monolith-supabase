import CreateArticleForm from './CreateArticleForm';
import {ArticleService} from "@/app/(admin)/article/service";
import {ProductTagService} from "@/app/(admin)/product-tag/service";

export default async function CreateArticlePage() {
    // Fetch writers on the server side
    const writers = await ArticleService.getWriters();
    const categories = await ArticleService.getCategories();
    const productTags = await ProductTagService.getProductTags();

    return (
        <div className="p-10 space-y-10">
            <header className="flex items-center justify-between">
                <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Content Lab / New Draft
                </h1>
            </header>

            {/* Pass writers data to the client form */}
            <CreateArticleForm writers={writers} categories={categories} productTags={productTags} />
        </div>
    );
}