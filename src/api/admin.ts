import { supabase } from "@/lib/supabase";
import type { Order, Profile, Shop, Product } from "@/types";

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalShops: number;
  totalOrders: number;
  platformRevenue: number;
  pendingApprovals: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [usersRes, shopsRes, ordersRes, revenueRes, pendingRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("shops").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("status", "delivered"),
    supabase.from("shops").select("id", { count: "exact", head: true }).eq("approval_status", "pending"),
  ]);

  if (usersRes.error) throw usersRes.error;
  if (shopsRes.error) throw shopsRes.error;
  if (ordersRes.error) throw ordersRes.error;
  if (revenueRes.error) throw revenueRes.error;

  const platformRevenue = (revenueRes.data ?? []).reduce(
    (sum: number, o: { total: number }) => sum + o.total,
    0
  );

  return {
    totalUsers: usersRes.count ?? 0,
    totalShops: shopsRes.count ?? 0,
    totalOrders: ordersRes.count ?? 0,
    platformRevenue,
    pendingApprovals: pendingRes.count ?? 0,
  };
}

export async function getRecentOrders(limit: number = 5): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, shop:shops(id, name, slug), buyer:profiles(id, full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Order[];
}

// ─── Shop Management (added in Commit 2) ─────────────────────────────────────

export async function getAdminShops(): Promise<Shop[]> {
  const { data, error } = await supabase
    .from("shops")
    .select("*, owner:profiles(id, full_name, email), product_count:products(count)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((s: Record<string, unknown>) => ({
    ...s,
    product_count: Array.isArray(s.product_count)
      ? (s.product_count[0] as { count: number })?.count ?? 0
      : 0,
  })) as Shop[];
}

export async function approveShop(shopId: string): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .update({ approval_status: "approved", is_active: true })
    .eq("id", shopId)
    .select()
    .single();
  if (error) throw error;
  return data as Shop;
}

export async function suspendShop(shopId: string): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .update({ approval_status: "suspended", is_active: false })
    .eq("id", shopId)
    .select()
    .single();
  if (error) throw error;
  return data as Shop;
}

export async function reinstateShop(shopId: string): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .update({ approval_status: "approved", is_active: true })
    .eq("id", shopId)
    .select()
    .single();
  if (error) throw error;
  return data as Shop;
}

// ─── User Management (added in Commit 3) ─────────────────────────────────────

export async function getAdminUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function suspendUser(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_suspended: true })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function reinstateUser(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_suspended: false })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

// ─── Product Management (added in Commit 4) ──────────────────────────────────

export async function getAdminProducts(opts: {
  query?: string;
  page: number;
  pageSize: number;
}): Promise<{ products: Product[]; count: number }> {
  const { query, page, pageSize } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("products")
    .select(
      "*, shop:shops(id, name, slug), category:categories(id, name)",
      { count: "exact" }
    );

  if (query) {
    q = q.ilike("name", `%${query}%`);
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { products: (data ?? []) as Product[], count: count ?? 0 };
}

export async function adminToggleProduct(
  productId: string,
  isActive: boolean
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
}

// ─── Order Management (added in Commit 4) ────────────────────────────────────

export async function getAdminOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, shop:shops(id, name, slug), buyer:profiles(id, full_name, email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}
