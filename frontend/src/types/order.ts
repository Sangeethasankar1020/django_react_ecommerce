import { Product } from './product';

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  total_price: string;
}

export interface Order {
  id: string;
  user_email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  total_amount: string;
  shipping_address: string;
  payment_method: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  shipping_address: string;
  payment_method: string;
}