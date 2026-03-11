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
  ADMIN: "admin",
} as const;

export const ADMIN_ORDER_TABS = [
  { key: "all",             label: "All",          statuses: null },
  { key: "pending",         label: "Pending",      statuses: ["pending"] },
  { key: "active",          label: "Active",       statuses: ["confirmed", "preparing", "shipped"] },
  { key: "completed",       label: "Completed",    statuses: ["delivered"] },
  { key: "cancelled",       label: "Cancelled",    statuses: ["cancelled"] },
  { key: "return_requests", label: "Return/Refund", statuses: ["return_requested"] },
] as const;

export const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  open:        { label: "Open",        color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-700" },
  resolved:    { label: "Resolved",    color: "bg-green-100 text-green-700" },
  closed:      { label: "Closed",      color: "bg-slate-100 text-slate-600" },
};

export const TICKET_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "bg-slate-100 text-slate-600" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

export const TICKET_TYPES = ["order_dispute", "seller_dispute", "bug_report", "complaint", "general"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const TICKET_TYPE_CONFIG: Record<TicketType, { label: string }> = {
  order_dispute:  { label: "Order Dispute" },
  seller_dispute: { label: "Seller Dispute" },
  bug_report:     { label: "Bug Report" },
  complaint:      { label: "Complaint" },
  general:        { label: "General Inquiry" },
};

export const ADMIN_TICKET_TABS = [
  { key: "all",         label: "All",         statuses: null },
  { key: "open",        label: "Open",        statuses: ["open"] },
  { key: "in_progress", label: "In Progress", statuses: ["in_progress"] },
  { key: "resolved",    label: "Resolved",    statuses: ["resolved"] },
  { key: "closed",      label: "Closed",      statuses: ["closed"] },
] as const;
