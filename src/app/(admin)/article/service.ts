import { createClient } from '@/utils/supabase/client';

export interface ArticleDisplay {
    id: string;
    title: string;
    category: string
    writer: string
    product: string;
    productionMonth: string;
    type: string;
    meta: string;
    isApproved: boolean;
    approval: string | null;
    status: string;
    pipelineStage?: any;
}

// services/article.service.ts

export const ArticleService = {
    async getArticles(params: {
        year: number;
        month: number;
        page: number;
        writerId: string | null;
        categoryId: string | null;
        contentType: string | null;
        searchQuery: string | null;
        // Make these optional with a '?' so our simplified component doesn't break
        status?: string;
        approval?: string | null;
        pipelineStage?: any;
    }) {
        const { year, month, page = 1, writerId, categoryId, contentType, searchQuery } = params;
        const supabase = createClient();
        const pageSize = 10;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

        let query = supabase
            .from('article')
            .select(`*, category(id, name), writer(id, name)`, { count: 'exact' })
            .gte('production_month', startDate)
            .lt('production_month', endDate)
            .is('deleted_at', null);

        // Dynamic Filters
        if (writerId) query = query.eq('writer_id', writerId);
        if (categoryId) query = query.eq('category_id', categoryId);
        if (contentType) query = query.eq('content_type', contentType);

        // Search Logic: ilike allows for "Contains" searching (e.g. "CC" finds "Credit Card")
        if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return {
            articles: data.map(item => ({
                id: item.id,
                title: item.title,
                category: item.category?.name || 'Uncategorized',
                writer: item.writer?.name || 'Unknown',
                product: item.product_id,
                status: item.status,
                type: item.content_type,
                approval: item.approval,
                target_keyword: item.target_keyword,
                meta_description: item.meta_description
            })),
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
        writer:writer_id(id, name)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // async updateWorkflow(params: {
    //     id: string;
    //     status: string;
    //     approval: string;
    //     url_published?: string;
    //     oldStatus: string;
    //     oldApproval: string;
    // }) {
    //     const { id, status, approval, url_published, oldStatus, oldApproval } = params;
    //     const supabase = createClient();
    //
    //     // Get the current user session
    //     const { data: { user } } = await supabase.auth.getUser();
    //     const userEmail = user?.email || 'nisa@posthink.com';
    //
    //     // 1. Update the Article
    //     const updateData: any = {
    //         status,
    //         approval,
    //         approve_at: approval === 'approved' ? new Date().toISOString() : null,
    //         approval_by: user?.email || null
    //     };
    //
    //     if (url_published) updateData.url_published = url_published;
    //
    //     const { error: updateError } = await supabase
    //         .from('article')
    //         .update(updateData)
    //         .eq('id', id);
    //
    //     if (updateError) throw updateError;
    //
    //     // 2. Insert the Log with the Email
    //     await supabase.from('workflow_logs').insert({
    //         article_id: id,
    //         user_email: userEmail,
    //         old_status: oldStatus,
    //         new_status: status,
    //         old_approval: oldApproval,
    //         new_approval: approval,
    //         notes: url_published ? `Published to: ${url_published}` : null
    //     });
    // },

    async getWorkflowLogs(articleId: string) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('workflow_logs')
            .select('*')
            .eq('article_id', Number(articleId))
            .order('created_at', { ascending: false }); // Newest logs first


        console.log('data log', data)
        console.log('data log articleId', articleId)
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
            .order('created_at', { ascending: true }) // Oldest first = highest priority
            .limit(limit);

        if (error) throw error;
        return data;
    },

    async createArticle(payload: {
        title: string;
        content: string;
        category_id: number;
        product_id: number;
        production_month: string;
        content_type: 'new' | 'adjust';
        content_old?: string;
        meta_description?: string;
        target_keyword?: string;
        cta_internal_link?: string;
        seo_check?: string;
        index_status?: string;
        internal_notes?: string;
        status: string
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
            .from('writer') // Assuming your table name is 'writer'
            .select('id, name')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getCategories() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('category') // Ensure your table name is 'category'
            .select('id, name')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async updateArticle(id: number | string, payload: {
        title?: string;            // Made optional
        content?: string;          // Made optional
        category_id?: number;      // Made optional
        product_id?: number;       // Made optional
        production_month?: string; // Made optional
        content_type?: "new" | "adjust";
        status?: string;           // Made optional
        target_keyword?: string;
        meta_description?: string;
        cta_internal_link?: string;
        approval?: string
    }) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('article')
            .update({
                ...payload,
                // We keep approval as is, or you could reset it to 'pending'
                // if you want the Director to re-approve every edit.
            })
            .eq('id', id) // Targets the specific article
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async softDeleteArticle(id: number, currentStatus: string, userEmail: string) {
        const supabase = createClient();

        // 1. Update Article Status and deleted_at
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

        // 2. Insert into workflow_logs
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
        internal_notes?: string; // Added field for Director feedback
    }) {
        const { id, status, approval, url_published, oldStatus, oldApproval, internal_notes } = params;
        const supabase = createClient();

        // Get the current user session
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || 'nisa@posthink.com';

        // 1. Update the Article
        const updateData: any = {
            status,
            approval,
            approve_at: approval === 'approved' ? new Date().toISOString() : null,
            approval_by: user?.email || null
        };

        if (url_published) updateData.url_published = url_published;

        // Save the director's note if provided during rejection
        if (internal_notes) updateData.internal_notes = internal_notes;

        const { error: updateError } = await supabase
            .from('article')
            .update(updateData)
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. Insert the Log with the Email and custom message
        let logNotes = url_published ? `Published to: ${url_published}` : null;
        if (approval === 'rejected' && internal_notes) {
            logNotes = `Rejected by Director. Reason: ${internal_notes}`;
        }

        await supabase.from('workflow_logs').insert({
            article_id: id,
            user_email: userEmail,
            old_status: oldStatus,
            new_status: status,
            old_approval: oldApproval,
            new_approval: approval,
            notes: logNotes
        });
    },
};