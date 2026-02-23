export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
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
};

export const ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
} as const;
