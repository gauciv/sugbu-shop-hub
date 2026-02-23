import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}
