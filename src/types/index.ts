export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "buyer" | "seller";
  phone: string | null;
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
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  is_active: boolean;
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
  status: "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_address: string;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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
