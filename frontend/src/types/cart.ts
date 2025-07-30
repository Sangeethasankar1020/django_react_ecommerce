import { Product } from './product';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  total_price: string;
  created_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
  total_items: number;
  created_at: string;
  updated_at: string;
}