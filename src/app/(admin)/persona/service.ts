// app/(admin)/persona/service.ts
import { createClient } from '@/utils/supabase/client';

export const PersonaService = {
    // 1. Fetch only active (non-deleted) records
    async getPersonas() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('persona')
            .select('*')
            .is('deleted_at', null) // Filter out items marked as soft-deleted
            .order('id', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Create a new record
    async createPersona(name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('persona')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update an existing record
    async updatePersona(id: number, name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('persona')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 2. SOFT DELETE MECHANISM: Write a timestamp instead of dropping the row
    async softDeletePersona(id: number) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('persona')
            .update({
                deleted_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};