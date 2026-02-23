import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

export async function getShopProducts(shopId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getActiveShopProducts(shopId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), shop:shops(id, name, slug)")
    .eq("shop_id", shopId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), shop:shops(id, name, slug, logo_url)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Product;
}

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, shop:shops(id, name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(
  product: Pick<Product, "shop_id" | "category_id" | "name" | "description" | "price" | "compare_at_price" | "stock" | "image_urls">
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<Pick<Product, "category_id" | "name" | "description" | "price" | "compare_at_price" | "stock" | "image_urls" | "is_active">>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function searchProducts(opts: {
  query?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ products: Product[]; count: number }> {
  const { query, categoryId, page = 1, pageSize = 12 } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("products")
    .select("*, shop:shops(id, name, slug), category:categories(*)", { count: "exact" })
    .eq("is_active", true);

  if (query) {
    q = q.ilike("name", `%${query}%`);
  }
  if (categoryId) {
    q = q.eq("category_id", categoryId);
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { products: (data ?? []) as Product[], count: count ?? 0 };
}
