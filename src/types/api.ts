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
  avatar_url?: string | null;
  created_at?: string;
}

export interface Order {
  id: number;
  reference: string;
  status: string;
  quoted_amount: number;
  currency: string;
  shipping_route: {
    id: number;
    origin: string;
    destination: string;
    transit_days?: number;
  };
  created_at: string;
  updated_at: string;
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
