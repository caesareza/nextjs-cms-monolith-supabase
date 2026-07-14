// app/(admin)/article/edit/[id]/page.tsx

import { ArticleService } from "@/app/(admin)/article/service";
import { SectionService } from "@/app/(admin)/section/service";
import { ProductTagService } from "@/app/(admin)/product-tag/service";
import { ThemeService } from "@/app/(admin)/theme/service";
import { PersonaService } from "@/app/(admin)/persona/service";
import { CampaignService } from "@/app/(admin)/campaign/service";
import EditArticleClient from './EditArticleClient';

export default async function EditArticlePage({
                                                  params
                                              }: {
    params: Promise<{ id: string }>
}) {
    // 1. Await the dynamic layout parameters first
    const resolvedParams = await params;
    const id = resolvedParams.id;

    console.log('Resolved Editing ID:', id);

    // 2. Fetch all metadata validation matrices concurrently
    const [
        article,
        writers,
        categories,
        sectionsResponse,
        productTagsResponse,
        themes,
        personas,
        campaigns
    ] = await Promise.all([
        ArticleService.getArticleById(Number(id)),
        ArticleService.getWriters(),
        ArticleService.getCategories(),
        SectionService.getSections({ page: 1, limit: 100, search: '' }),
        ProductTagService.getProductTags({ page: 1, limit: 100, search: '' }),
        ThemeService.getThemes(),
        PersonaService.getPersonas(),
        CampaignService.getCampaigns()
    ]);

    // Safely unwrap paginated service collections
    const sections = sectionsResponse?.sections || [];
    const productTags = productTagsResponse?.productTags || [];

    return (
        <div className="p-8 min-h-screen bg-slate-50/50">
            <EditArticleClient
                initialData={article}
                writers={writers}
                categories={categories}
                sections={sections}
                productTags={productTags}
                themes={themes}
                personas={personas}
                campaigns={campaigns}
            />
        </div>
    );
}