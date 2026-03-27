import { createClient } from '@/utils/supabase/client';

export interface ArticleDisplay {
    id: string;
    title: string;
    category: string
    writer: string
    product: string;
    status: string;
    productionMonth: string;
    type: string;
    meta: string;
    isApproved: boolean;
}

// services/article.service.ts

export const ArticleService = {
    async getArticles(params: {
        year: number;
        month: number;
        page?: number;
        writerId?: string | null;
        categoryId?: string | null;
        contentType?: string | null;
        searchQuery?: string | null; // New Parameter
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
                isApproved: item.approval === 'Approved'
            })),
            total: count || 0
        };
    },

    async getArticleById(id: string) {
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

    async updateWorkflow(params: {
        id: string;
        status: string;
        approval: string;
        url_published?: string;
        oldStatus: string;
        oldApproval: string;
    }) {
        const { id, status, approval, url_published, oldStatus, oldApproval } = params;
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

        const { error: updateError } = await supabase
            .from('article')
            .update(updateData)
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. Insert the Log with the Email
        await supabase.from('workflow_logs').insert({
            article_id: id,
            user_email: userEmail,
            old_status: oldStatus,
            new_status: status,
            old_approval: oldApproval,
            new_approval: approval,
            notes: url_published ? `Published to: ${url_published}` : null
        });
    },

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
        writer_id: number;
        production_month: string;
    }) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('article')
            .insert([{
                ...payload,
                approval: 'pending', // Per your requirement
                status: 'draft',     // Per your requirement
                // created_at is handled automatically by Postgres default
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
    }
};