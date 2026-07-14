// types/article.ts
export interface ArticleDisplay {
    id: string;
    title: string;
    category: string;
    section: string;
    writer: string;
    product: string;
    product_name: string;
    persona: string;
    campaign: string;
    theme: string;
    demand: number;
    intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational' | string;
    type: 'Evergreen' | 'Seasonal' | string;
    classification: 'Artillery' | 'Infantry' | 'Hygiene' | string;
    isApproved: boolean;
    approval: 'approved' | 'rejected' | 'pending' | null | string;
    status: string;
    created_at: string;
}

export interface LookupOptions {
    categories: { id: number; name: string }[];
    sections: { id: number; name: string }[];
    productTags: { id: number; name: string }[];
    themes: { id: number; name: string }[];
    personas: { id: number; name: string }[];
    campaigns: { id: number; name: string }[];
}

export interface EditFormState {
    title: string;
    category_id: number;
    section_id: number;
    product_id: number;
    content_type: string;
    production_month: string;
    demand: string;
    intent: string;
    type: string;
    classification: string;
    theme_id: string;
    persona_id: string;
    campaign_id: string;
    target_keyword: string;
    meta_description: string;
    cta_internal_link: string;
}