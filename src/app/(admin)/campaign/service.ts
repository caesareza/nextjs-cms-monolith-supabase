// app/(admin)/campaign/service.ts
import { createClient } from '@/utils/supabase/client';

export const CampaignService = {
    // Read active records
    async getCampaigns() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('campaign')
            .select('*')
            .is('deleted_at', null)
            .order('id', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Create a new campaign option
    async createCampaign(name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('campaign')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update campaign parameters
    async updateCampaign(id: number, name: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('campaign')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Safe soft-delete execution
    async softDeleteCampaign(id: number) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('campaign')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};