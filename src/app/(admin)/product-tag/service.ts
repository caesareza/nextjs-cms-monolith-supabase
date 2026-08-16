// app/(admin)/product-tag/service.ts
import { createClient } from "@/utils/supabase/client";

export const ProductTagService = {
  // Read records using pagination, search, and target table parameters
  async getProductTags(params: {
    page: number;
    limit: number;
    search: string;
  }) {
    const supabase = createClient();
    const { page, limit, search } = params;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Base query targeted cleanly at your mapped table
    let query = supabase.from("product_tag").select("*", { count: "exact" });

    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data, error, count } = await query
      .order("id", { ascending: false }) // Enforced order rule
      .range(from, to);

    if (error) throw error;

    return {
      productTags: data || [],
      total: count || 0,
    };
  },

  // Create a new entry row node
  async createProductTag(name: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_tag")
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update row name values
  async updateProductTag(id: number, name: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_tag")
      .update({ name })
      .eq("id", id)
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
      .from("product_tag")
      .update({ deleted_at: timestamp })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
