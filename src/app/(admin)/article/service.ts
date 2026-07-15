// app/(admin)/article/service.ts
import { createClient } from '@/utils/supabase/client';

export const ArticleService = {
    // Read records using pagination, search filters, and full taxonomy joins
    async getArticles(params: {
        year: number;
        month: number;
        page: number;
        writerId?: string | null;
        categoryId: string | null;
        contentType: string | null;
        searchQuery: string | null;
        status?: string;
        approval?: string | null;
    }) {
        const { year, month, page = 1, writerId, categoryId, contentType, searchQuery, status, approval } = params;
        const supabase = createClient();
        const pageSize = 10;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

        // Updated Selection parameters to match all corporate taxonomy relationships
        let query = supabase
            .from('article')
            .select(`
                id,
                title,
                content,
                demand,
                intent,
                type,
                classification,
                status,
                approval,
                target_keyword,
                meta_description,
                cta_internal_link,
                created_at,
                section:section_id(id, name),
                category:category_id(id, name),
                writer:writer_id(id, name),
                product:product_id(id, name),
                persona:persona_id(id, name),
                campaign:campaign_id(id, name),
                theme:theme_id(id, name)
            `, { count: 'exact' })
            .gte('production_month', startDate)
            .lt('production_month', endDate)
            .is('deleted_at', null);

        // Dynamic Filters
        if (writerId) query = query.eq('writer_id', writerId);
        if (categoryId) query = query.eq('category_id', categoryId);
        if (contentType) query = query.eq('content_type', contentType);
        if (status) query = query.eq('status', status);
        if (approval) query = query.eq('approval', approval);

        // Search criteria matching input values
        if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

        const { data, error, count } = await query
            .order('id', { ascending: false }) // Enforced strict sorting constraint
            .range(from, to);

        if (error) throw error;

        return {
            articles: (data || []).map(item => {
                const categoryObj = Array.isArray(item.category) ? item.category[0] : item.category;
                const sectionObj = Array.isArray(item.section) ? item.section[0] : item.section;
                const writerObj = Array.isArray(item.writer) ? item.writer[0] : item.writer;
                const productObj = Array.isArray(item.product) ? item.product[0] : item.product;
                const personaObj = Array.isArray(item.persona) ? item.persona[0] : item.persona;
                const campaignObj = Array.isArray(item.campaign) ? item.campaign[0] : item.campaign;
                const themeObj = Array.isArray(item.theme) ? item.theme[0] : item.theme;

                return {
                    id: String(item.id),
                    title: item.title,
                    category: categoryObj?.name || 'Uncategorized',
                    writer: writerObj?.name || 'Unknown',
                    section: sectionObj?.name || 'General',

                    product: String(productObj?.id || ''),
                    product_name: productObj?.name || 'Umum',

                    persona: personaObj?.name || 'All Target Profiles',
                    campaign: campaignObj?.name || 'Organic / None',
                    theme: themeObj?.name || 'General Topic',

                    demand: item.demand || 0,
                    intent: item.intent,
                    type: item.type,
                    classification: item.classification,

                    isApproved: item.approval === 'approved',
                    approval: item.approval,
                    status: item.status,
                    created_at: item.created_at
                };
            }),
            total: count || 0
        };
    },

    async getArticleById(id: number) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('article')
            .select(`
                *,
                category:category_id(id, name),
                writer:writer_id(id, name),
                product:product_id(id, name),
                persona:persona_id(id, name),
                campaign:campaign_id(id, name),
                theme:theme_id(id, name)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async getWorkflowLogs(articleId: string) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('workflow_logs')
            .select('*')
            .eq('article_id', Number(articleId))
            .order('id', { ascending: false }); // ID descending rule consistency

        if (error) throw error;
        return data || [];
    },

    async getTopPending(limit = 10) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('article')
            .select(`
                id, 
                title, 
                created_at, 
                approval,
                writer:writer_id(name)
            `)
            .eq('approval', 'pending')
            .order('id', { ascending: true })
            .limit(limit);

        if (error) throw error;
        return data;
    },

    async createArticle(payload: {
        title: string;
        content: string;
        category_id: number;
        section_id: number;
        product_id: number;
        production_month: string;
        content_type: 'new' | 'adjust';
        demand: number;
        intent: string;
        type: string;
        classification: string; // Added to mandatory payload
        theme_id?: number | null;
        persona_id?: number | null;
        campaign_id?: number | null;
        content_old?: string;
        meta_description?: string;
        target_keyword?: string;
        cta_internal_link?: string;
        seo_check?: string;
        index_status?: string;
        internal_notes?: string;
        status: string;
    }) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('article')
            .insert([{
                ...payload,
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getWriters() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('writer')
            .select('id, name')
            .is('deleted_at', null)
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getCategories() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('category')
            .select('id, name')
            .is('deleted_at', null)
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async updateArticle(id: number | string, payload: {
        title?: string;
        content?: string;
        writer_id?: number;
        category_id?: number;
        section_id?: number;
        product_id?: number;
        production_month?: string;
        content_type?: "new" | "adjust";
        demand?: number;
        intent?: string;
        type?: string;
        classification?: string;
        theme_id?: number | null;
        persona_id?: number | null;
        campaign_id?: number | null;
        status?: string;
        target_keyword?: string;
        meta_description?: string;
        cta_internal_link?: string;
        approval?: string;
    }) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('article')
            .update({
                ...payload,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async softDeleteArticle(id: number, currentStatus: string, userEmail: string) {
        const supabase = createClient();

        const { data: article, error: articleError } = await supabase
            .from('article')
            .update({
                status: 'deleted',
                deleted_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (articleError) throw articleError;

        const { error: logError } = await supabase
            .from('workflow_logs')
            .insert([{
                article_id: id,
                user_email: userEmail,
                old_status: currentStatus,
                new_status: 'deleted',
                notes: 'Article moved to trash (soft delete)'
            }]);

        if (logError) throw logError;
        return article;
    },

    async updateWorkflow(params: {
        id: string;
        status: string;
        approval: 'approved' | 'rejected' | 'pending' | string;
        url_published?: string;
        oldStatus: string;
        oldApproval: string;
        internal_notes?: string;
    }) {
        const { id, status, approval, url_published, oldStatus, oldApproval, internal_notes } = params;
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || 'nisa@posthink.com';

        const updateData: any = {
            status,
            approval,
            approve_at: approval === 'approved' ? new Date().toISOString() : null,
            approval_by: user?.email || null
        };

        if (url_published) updateData.url_published = url_published;
        if (internal_notes) updateData.internal_notes = internal_notes;

        const { error: updateError } = await supabase
            .from('article')
            .update(updateData)
            .eq('id', id);

        if (updateError) throw updateError;

        let logNotes = url_published ? `Published to: ${url_published}` : null;
        if (approval === 'rejected' && internal_notes) {
            logNotes = `Rejected by Director. Reason: ${internal_notes}`;
        }

        await supabase.from('workflow_logs').insert({
            article_id: Number(id),
            user_email: userEmail,
            old_status: oldStatus,
            new_status: status,
            old_approval: oldApproval,
            new_approval: approval,
            notes: logNotes
        });
    },
};