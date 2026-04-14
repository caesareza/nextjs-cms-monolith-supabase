// app/(admin)/article/edit/[id]/page.tsx

import {ArticleService} from "@/app/(admin)/article/service";
import EditArticleClient from './EditArticleClient';

export default async function EditArticlePage({
                                                  params
                                              }: {
    params: Promise<{ id: string }> // Update type to Promise
}) {
    // 1. Await the params first
    const resolvedParams = await params;
    const id = resolvedParams.id;

    console.log('Resolved ID:', id);

    // 2. Now you can safely fetch your data
    const [article, writers, categories] = await Promise.all([
        ArticleService.getArticleById(id),
        ArticleService.getWriters(),
        ArticleService.getCategories()
    ]);

    return (
        <div className="p-8 min-h-screen bg-slate-50/50">
            <EditArticleClient
                initialData={article}
                writers={writers}
                categories={categories}
            />
        </div>
    );
}