import { supabase } from "@/lib/supabase";
import type { Order } from "@/types";

interface PlaceOrderInput {
  buyerId: string;
  shopId: string;
  items: {
    productId: string;
    productName: string;
    productImage: string | null;
    unitPrice: number;
    quantity: number;
  }[];
  shippingAddress: string;
  contactPhone?: string;
  notes?: string;
  shippingFee?: number;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const shippingFee = input.shippingFee ?? 0;
  const total = subtotal + shippingFee;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: input.buyerId,
      shop_id: input.shopId,
      subtotal,
      shipping_fee: shippingFee,
      total,
      shipping_address: input.shippingAddress,
      contact_phone: input.contactPhone,
      notes: input.notes,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.productName,
    product_image: item.productImage,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    line_total: item.unitPrice * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order as Order;
}

export async function getBuyerOrders(buyerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, shop:shops(id, name, slug, logo_url), items:order_items(*)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getShopOrders(shopId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, buyer:profiles(id, full_name, email), items:order_items(*)")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrderById(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, shop:shops(id, name, slug, logo_url), buyer:profiles(id, full_name, email, phone), items:order_items(*)")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data as Order;
}

export async function updateOrderStatus(
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
