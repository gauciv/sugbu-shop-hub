export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "return_requested",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "Preparing", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "Shipped", color: "bg-pink-100 text-pink-800" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  return_requested: { label: "Return/Refund", color: "bg-orange-100 text-orange-800" },
};

export const BUYER_ORDER_TABS = [
  { key: "all", label: "All", statuses: null },
  { key: "to_pay", label: "To Pay", statuses: ["pending"] },
  { key: "to_ship", label: "To Ship", statuses: ["confirmed", "preparing"] },
  { key: "to_receive", label: "To Receive", statuses: ["shipped"] },
  { key: "completed", label: "Completed", statuses: ["delivered"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
  { key: "return_refund", label: "Return/Refund", statuses: ["return_requested"] },
] as const;

export const SELLER_ORDER_TABS = [
  { key: "all", label: "All", statuses: null },
  { key: "to_ship", label: "To Ship", statuses: ["confirmed", "preparing"] },
  { key: "shipped", label: "Shipped", statuses: ["shipped"] },
  { key: "completed", label: "Completed", statuses: ["delivered"] },
  { key: "return_refund", label: "Return/Refund", statuses: ["return_requested"] },
] as const;

export const ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
} as const;
