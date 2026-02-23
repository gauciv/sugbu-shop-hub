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
