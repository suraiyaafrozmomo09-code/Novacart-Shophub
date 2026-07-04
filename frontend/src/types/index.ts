export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  sku: string;
  image?: string;
  created_at: string;
}

export interface Product {
  id: string;
  product_code?: string;
  name: string;
  description?: string;
  category_id: string;
  brand?: string;
  status: "active" | "inactive";
  gender: "male" | "female" | "unisex";
  product_type: string;
  sub_type?: string;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
}

export interface CartItem {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  variant?: ProductVariant;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: "online" | "cod";
  payment_status: "pending" | "paid" | "failed";
  shipping_address: Address;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Address {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: "customer" | "admin";
  created_at: string;
}

export type ReviewLanguage = "english" | "bangla" | "banglish";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  language: ReviewLanguage;
  comment?: string;
  created_at: string;
  updated_at?: string;
  user?: {
    full_name?: string;
    email?: string;
  };
}

export interface SearchLog {
  id: string;
  user_id?: string;
  query: string;
  results_count: number;
  created_at: string;
}

export interface ClickEvent {
  id: string;
  user_id?: string;
  product_id: string;
  variant_id?: string;
  event_type: string;
  created_at: string;
}
