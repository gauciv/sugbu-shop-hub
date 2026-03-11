export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "buyer" | "seller" | "admin";
  phone: string | null;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  banner_position_y: number;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  is_active: boolean;
  approval_status: "pending" | "approved" | "suspended";
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image_urls: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avg_rating?: number;
  review_count?: number;
  shop?: Shop;
  category?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  shop_id: string;
  status: "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled" | "return_requested";
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_address: string;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  payout_id?: string | null;
  shop?: Shop;
  buyer?: Profile;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  order_item_id: string;
  rating: number;
  comment: string | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  buyer?: Pick<Profile, "id" | "full_name" | "avatar_url">;
  product?: Pick<Product, "name" | "image_urls">;
}

export interface ReviewStats {
  avg_rating: number;
  review_count: number;
  distribution: [number, number, number, number, number];
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  address: string;
  contact_phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlatformSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface Payout {
  id: string;
  seller_id: string;
  shop_id: string;
  period_label: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: "pending" | "paid";
  transaction_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  paid_by: string | null;
  shop?: Shop;
}

export interface SellerPayoutSummary {
  shop_id: string;
  seller_id: string;
  shop_name: string;
  unpaid_order_count: number;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  order_ids: string[];
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  submitted_by: string;
  submitted_by_role: "buyer" | "seller";
  type: "order_dispute" | "seller_dispute" | "bug_report" | "complaint" | "general";
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  related_order_id: string | null;
  created_at: string;
  updated_at: string;
  submitter?: Profile;
  order?: Order;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  shop_id: string;
  product_id: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  buyer?: Profile;
  seller?: Profile;
  shop?: Shop;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}
