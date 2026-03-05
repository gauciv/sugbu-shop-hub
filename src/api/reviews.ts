import { supabase } from "@/lib/supabase";
import type { Review, ReviewStats } from "@/types";

const REVIEWS_PAGE_SIZE = 5;

export async function getProductReviews(
  productId: string,
  opts: { page?: number; pageSize?: number; rating?: number }
): Promise<{ reviews: Review[]; count: number }> {
  const { page = 1, pageSize = REVIEWS_PAGE_SIZE, rating } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("reviews")
    .select("*, buyer:profiles(id, full_name, avatar_url)", { count: "exact" })
    .eq("product_id", productId);

  if (rating) {
    q = q.eq("rating", rating);
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { reviews: (data ?? []) as Review[], count: count ?? 0 };
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const { data: product, error: pError } = await supabase
    .from("products")
    .select("avg_rating, review_count")
    .eq("id", productId)
    .single();

  if (pError) throw pError;

  const { data: reviews, error: rError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (rError) throw rError;

  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  (reviews ?? []).forEach((r: { rating: number }) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating - 1]++;
    }
  });

  return {
    avg_rating: product.avg_rating ?? 0,
    review_count: product.review_count ?? 0,
    distribution,
  };
}

export async function getShopReviews(
  shopId: string,
  opts: { page?: number; pageSize?: number }
): Promise<{ reviews: Review[]; count: number }> {
  const { page = 1, pageSize = REVIEWS_PAGE_SIZE } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: products, error: pError } = await supabase
    .from("products")
    .select("id")
    .eq("shop_id", shopId);

  if (pError) throw pError;
  const productIds = (products ?? []).map((p: { id: string }) => p.id);
  if (productIds.length === 0) return { reviews: [], count: 0 };

  const { data, error, count } = await supabase
    .from("reviews")
    .select("*, buyer:profiles(id, full_name, avatar_url), product:products(name, image_urls)", { count: "exact" })
    .in("product_id", productIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { reviews: (data ?? []) as Review[], count: count ?? 0 };
}

export async function getTopRatedProducts(
  shopId: string,
  limit: number = 4
): Promise<{ id: string; name: string; image_urls: string[]; price: number; avg_rating: number; review_count: number }[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, image_urls, price, avg_rating, review_count")
    .eq("shop_id", shopId)
    .eq("is_active", true)
    .gt("review_count", 0)
    .order("avg_rating", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as { id: string; name: string; image_urls: string[]; price: number; avg_rating: number; review_count: number }[];
}

export async function createOrUpdateReview(input: {
  productId: string;
  buyerId: string;
  orderItemId: string;
  rating: number;
  comment?: string;
  imageUrls?: string[];
}): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        product_id: input.productId,
        buyer_id: input.buyerId,
        order_item_id: input.orderItemId,
        rating: input.rating,
        comment: input.comment ?? null,
        image_urls: input.imageUrls ?? [],
      },
      { onConflict: "product_id,buyer_id" }
    )
    .select("*, buyer:profiles(id, full_name, avatar_url)")
    .single();

  if (error) throw error;
  return data as Review;
}

export async function getOrderItemReviewStatus(
  orderItemIds: string[]
): Promise<Record<string, Review>> {
  if (orderItemIds.length === 0) return {};

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .in("order_item_id", orderItemIds);

  if (error) throw error;

  const map: Record<string, Review> = {};
  (data ?? []).forEach((r: Review) => {
    map[r.order_item_id] = r;
  });
  return map;
}

export async function getBuyerReviewForProduct(
  productId: string,
  buyerId: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (error) throw error;
  return data as Review | null;
}
