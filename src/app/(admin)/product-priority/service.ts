import { createClient } from "@/utils/supabase/client";

export const ProductPriorityService = {
  async getProductPriorities(params: {
    page: number;
    limit: number;
    search: string;
  }) {
    const supabase = createClient();
    const { page, limit, search } = params;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("product_priority")
      .select("*", { count: "exact" });

    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data, error, count } = await query
      .order("id", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      productPriorities: data || [],
      total: count || 0,
    };
  },

  async getAllActiveProductPriorities() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_priority")
      .select("id, name, code")
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createProductPriority(name: string, code: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_priority")
      .insert([{ name, code }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProductPriority(id: number, name: string, code: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_priority")
      .update({ name, code })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleSoftDelete(id: number, currentlyDeleted: boolean) {
    const supabase = createClient();
    const timestamp = currentlyDeleted ? null : new Date().toISOString();

    const { data, error } = await supabase
      .from("product_priority")
      .update({ deleted_at: timestamp })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
