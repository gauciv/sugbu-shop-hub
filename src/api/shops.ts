import { supabase } from "@/lib/supabase";
import type { Shop } from "@/types";

export async function getActiveShops(): Promise<Shop[]> {
  const { data, error } = await supabase
    .from("shops")
    .select("*, product_count:products(count)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((s: Record<string, unknown>) => ({
    ...s,
    product_count: Array.isArray(s.product_count) ? s.product_count[0]?.count ?? 0 : 0,
  })) as Shop[];
}

export async function getShopBySlug(slug: string): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data as Shop;
}

export async function getMyShop(ownerId: string): Promise<Shop | null> {
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  return data as Shop | null;
}

export async function createShop(
  shop: Pick<Shop, "owner_id" | "name" | "slug" | "description" | "contact_email" | "contact_phone" | "address">
): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .insert(shop)
    .select()
    .single();
  if (error) throw error;
  return data as Shop;
}

export async function updateShop(
  shopId: string,
  updates: Partial<Pick<Shop, "name" | "slug" | "description" | "logo_url" | "banner_url" | "contact_email" | "contact_phone" | "address" | "is_active">>
): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .update(updates)
    .eq("id", shopId)
    .select()
    .single();
  if (error) throw error;
  return data as Shop;
}

export async function searchShops(query: string): Promise<Shop[]> {
  const { data, error } = await supabase
    .from("shops")
    .select("*, product_count:products(count)")
    .eq("is_active", true)
    .ilike("name", `%${query}%`)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((s: Record<string, unknown>) => ({
    ...s,
    product_count: Array.isArray(s.product_count) ? s.product_count[0]?.count ?? 0 : 0,
  })) as Shop[];
}
