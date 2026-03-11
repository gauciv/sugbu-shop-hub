import { supabase } from "@/lib/supabase";
import type { Payout, SellerPayoutSummary } from "@/types";

// ─── Commission Rate ──────────────────────────────────────────────────────────

export async function getCommissionRate(): Promise<number> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "commission_rate")
    .single();
  if (error) throw error;
  return parseFloat(data.value);
}

export async function setCommissionRate(rate: number): Promise<void> {
  const { error } = await supabase
    .from("platform_settings")
    .update({ value: rate.toString(), updated_at: new Date().toISOString() })
    .eq("key", "commission_rate");
  if (error) throw error;
}

// ─── Payout Summaries ─────────────────────────────────────────────────────────

export async function getSellerPayoutSummaries(
  commissionRate: number
): Promise<SellerPayoutSummary[]> {
  // Fetch all delivered orders that haven't been assigned to a payout yet
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, shop_id, total, shipping_fee, shop:shops(id, name, owner_id)")
    .eq("status", "delivered")
    .is("payout_id", null);

  if (error) throw error;

  // Group by shop
  const byShop: Record<
    string,
    {
      shop_id: string;
      seller_id: string;
      shop_name: string;
      orders: { id: string; gross: number }[];
    }
  > = {};

  for (const o of orders ?? []) {
    const shop = o.shop as { id: string; name: string; owner_id: string } | null;
    if (!shop) continue;
    if (!byShop[shop.id]) {
      byShop[shop.id] = {
        shop_id: shop.id,
        seller_id: shop.owner_id,
        shop_name: shop.name,
        orders: [],
      };
    }
    byShop[shop.id].orders.push({
      id: o.id,
      gross: (o.total as number) - (o.shipping_fee as number),
    });
  }

  const rate = commissionRate / 100;

  return Object.values(byShop).map((s) => {
    const gross = s.orders.reduce((sum, o) => sum + o.gross, 0);
    const commission = parseFloat((gross * rate).toFixed(2));
    return {
      shop_id: s.shop_id,
      seller_id: s.seller_id,
      shop_name: s.shop_name,
      unpaid_order_count: s.orders.length,
      gross_amount: parseFloat(gross.toFixed(2)),
      commission_amount: commission,
      net_amount: parseFloat((gross - commission).toFixed(2)),
      order_ids: s.orders.map((o) => o.id),
    };
  });
}

// ─── Create Payout ────────────────────────────────────────────────────────────

export async function createPayout(
  shopId: string,
  sellerId: string,
  periodLabel: string,
  summary: SellerPayoutSummary,
  commissionRate: number
): Promise<Payout> {
  // Insert the payout record
  const { data: payout, error: payoutError } = await supabase
    .from("payouts")
    .insert({
      seller_id: sellerId,
      shop_id: shopId,
      period_label: periodLabel,
      gross_amount: summary.gross_amount,
      commission_rate: commissionRate,
      commission_amount: summary.commission_amount,
      net_amount: summary.net_amount,
      status: "pending",
    })
    .select()
    .single();

  if (payoutError) throw payoutError;

  // Mark the included orders with the payout_id
  const { error: orderError } = await supabase
    .from("orders")
    .update({ payout_id: payout.id })
    .in("id", summary.order_ids);

  if (orderError) throw orderError;

  return payout as Payout;
}

// ─── Mark Payout as Paid ──────────────────────────────────────────────────────

export async function markPayoutPaid(
  payoutId: string,
  transactionRef: string
): Promise<Payout> {
  const { data, error } = await supabase
    .from("payouts")
    .update({
      status: "paid",
      transaction_ref: transactionRef,
      paid_at: new Date().toISOString(),
    })
    .eq("id", payoutId)
    .select()
    .single();
  if (error) throw error;
  return data as Payout;
}

// ─── Get All Payouts ──────────────────────────────────────────────────────────

export async function getAllPayouts(): Promise<Payout[]> {
  const { data, error } = await supabase
    .from("payouts")
    .select("*, shop:shops(id, name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Payout[];
}

// ─── Transaction Log ──────────────────────────────────────────────────────────

export interface TransactionLogEntry {
  id: string;
  order_number: string;
  shop_name: string;
  buyer_name: string;
  total: number;
  shipping_fee: number;
  gross_revenue: number;
  status: string;
  payout_id: string | null;
  created_at: string;
}

export async function getTransactionLog(opts: {
  page: number;
  pageSize: number;
}): Promise<{ entries: TransactionLogEntry[]; count: number }> {
  const { page, pageSize } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("orders")
    .select(
      "id, order_number, total, shipping_fee, status, payout_id, created_at, shop:shops(name), buyer:profiles(full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const entries: TransactionLogEntry[] = (data ?? []).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    shop_name: (o.shop as { name: string } | null)?.name ?? "—",
    buyer_name: (o.buyer as { full_name: string } | null)?.full_name ?? "—",
    total: o.total,
    shipping_fee: o.shipping_fee,
    gross_revenue: (o.total as number) - (o.shipping_fee as number),
    status: o.status,
    payout_id: o.payout_id,
    created_at: o.created_at,
  }));

  return { entries, count: count ?? 0 };
}
