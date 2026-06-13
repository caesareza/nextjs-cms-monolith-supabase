import { createClient } from '@/utils/supabase/client';

export interface CategoryDisplay {
    id: number;
    name: string;
    slug: string; // Transform name for UI/URL usage
}

export const CategoryService = {
    async getAllCategories(): Promise<CategoryDisplay[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('category')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error("Category Fetch Error:", error.message);
            return [];
        }

        return data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.name.toLowerCase().replace(/\s+/g, '-'),
        }));
    }
};