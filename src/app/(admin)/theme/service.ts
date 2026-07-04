// app/(admin)/theme/service.ts
import { createClient } from '@/utils/supabase/client';

export const ThemeService = {
    // Read all records with strict ID Descending rule
    async getThemes() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('theme')
            .select('*')
            .order('id', { ascending: false }); // Enforced strict sorting constraint

        if (error) throw error;
        return data || [];
    },

    // Create a new record
    async createTheme(name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('theme')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update an existing record
    async updateTheme(id: number, name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('theme')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete a record
    async deleteTheme(id: number) {
        const supabase = createClient();
        const { error } = await supabase
            .from('theme')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};