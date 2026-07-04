// app/(admin)/writer/service.ts
import { createClient } from '@/utils/supabase/client';

export const WriterService = {
    // Read active records sorted by ID in descending order
    async getWriters() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('writer')
            .select('*')
            .is('deleted_at', null)
            .order('id', { ascending: false }); // Enforced sorting constraint

        if (error) throw error;
        return data || [];
    }
};