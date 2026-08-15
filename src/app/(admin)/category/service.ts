// app/(admin)/category/service.ts
import { createClient } from "@/utils/supabase/client";

export const CategoryService = {
  // Read only active records sorted with your strict global rule
  async getCategories() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .is("deleted_at", null)
      .order("id", { ascending: false }); // Enforced sorting constraint

    if (error) throw error;
    return data || [];
  },

  // Create a new record
  async createCategory(name: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("category")
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing record
  async updateCategory(id: number, name: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("category")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Safe Soft Delete execution
  async softDeleteCategory(id: number) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("category")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
