export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  errors?: Record<string, string[]>;
  code?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  email_verified: boolean;
  have_completed_profile?: boolean;
  auth_provider?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface RouteCountry {
  id: number;
  name: string;
  code: string;
  flag_emoji: string | null;
}

export interface ShippingRoute {
  id: number;
  name: string;
  origin_country: RouteCountry | null;
  destination_country: RouteCountry | null;
  transport_mode: string;
  city: string | null;
  transit_days_min: number | null;
  transit_days_max: number | null;
  price_per_kg: string;
  currency: string;
  active: boolean;
}

export interface OrderPricing {
  total: number;
  currency: string;
  transportCost?: number;
  serviceFee?: number;
  paymentFee?: number;
  breakdown?: { label: string; amount: number }[];
}

export interface Order {
  id: number;
  reference: string;
  status: string;
  service_type?: 'purchase_assisted' | 'transit';
  quoted_amount: number | null;
  paid_amount: number;
  paid?: boolean;
  extra_fees?: number | null;
  extra_fees_note?: string | null;
  currency: string;
  estimated_weight?: number | string;
  actual_weight?: number | string;
  delivery_address?: string | null;
  client_notes?: string | null;
  shipping_route: {
    id: number;
    origin: string;
    destination: string;
    transit_days?: number;
    transport_mode?: string;
    origin_country?: { name: string; code: string; flag_emoji: string } | null;
    destination_country?: { name: string; code: string; flag_emoji: string } | null;
  };
  pricing?: OrderPricing | null;
  products?: OrderProduct[];
  logs?: OrderLog[];
  media?: OrderMedia[];
  created_at: string;
  updated_at: string;
}

export interface OrderProduct {
  name: string;
  quantity: number | null;
  unit_price: number | string;
  total: number;
}

export interface OrderLog {
  status: string;
  label: string;
  note?: string;
  date: string;
}

export interface OrderMedia {
  id: number;
  path: string;
  type: string;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  read: boolean;
  order_reference?: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  subject: string;
  status: string;
  order_reference?: string;
  last_message_at?: string;
  created_at: string;
}

export interface TicketMessage {
  id: number;
  body: string;
  sender: 'client' | 'admin';
  created_at: string;
}

export interface Payment {
  id: number;
  reference: string;
  order_reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  method?: string;
  paid_at?: string;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  cover_image: string | null;
  thumbnail: string | null;
  published_at: string;
}
