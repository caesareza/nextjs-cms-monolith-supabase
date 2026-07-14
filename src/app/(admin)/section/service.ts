// app/(admin)/section/service.ts
import { createClient } from '@/utils/supabase/client';

export const SectionService = {
    // Read records using pagination, search, and soft-delete criteria
    async getSections(params: { page: number; limit: number; search: string }) {
        const supabase = createClient();
        const { page, limit, search } = params;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('section')
            .select('*', { count: 'exact' });

        if (search.trim()) {
            query = query.ilike('name', `%${search.trim()}%`);
        }

        const { data, error, count } = await query
            .order('id', { ascending: false }) // Enforced order rule
            .range(from, to);

        if (error) throw error;

        return {
            sections: data || [],
            total: count || 0
        };
    },

    // Create a new entry row
    async createSection(name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('section')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update row name values
    async updateSection(id: number, name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('section')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Flexible Soft Delete Toggle
    async toggleSoftDelete(id: number, currentlyDeleted: boolean) {
        const supabase = createClient();
        const timestamp = currentlyDeleted ? null : new Date().toISOString();

        const { data, error } = await supabase
            .from('section')
            .update({ deleted_at: timestamp })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};