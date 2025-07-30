export interface Category {
  id: number;
  name: string;
  description: string;
  products_count: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: number;
  category_name: string;
  image?: string;
  stock: number;
  is_active: boolean;
  is_in_stock: boolean;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}