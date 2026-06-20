// @/services/productTag.service.ts
import { createClient } from '@/utils/supabase/client';

export const ProductTagService = {
    // READ ALL
    async getProductTags() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('product_tag')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    // CREATE
    async createProductTag(name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('product_tag')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // UPDATE
    async updateProductTag(id: number, name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('product_tag')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // DELETE
    async deleteProductTag(id: number) {
        const supabase = createClient();
        const { error } = await supabase
            .from('product_tag')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};