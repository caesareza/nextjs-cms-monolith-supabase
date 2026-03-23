import { createClient } from '@/utils/supabase/client';

// The "ViewModel" interface - exactly what the UI needs
export interface WriterDisplay {
    id: number;
    name: string;
    initial: string;
    joinedDate: string;
}

export const WriterService = {
    async getAllWriters(): Promise<WriterDisplay[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('writer')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error("Fetch Error:", error.message);
            return [];
        }

        // Mapping Logic: Transform raw database data to UI display data
        return data.map((item) => ({
            id: item.id,
            name: item.name,
            initial: item.name.charAt(0).toUpperCase(),
            joinedDate: new Date(item.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
        }));
    }
};