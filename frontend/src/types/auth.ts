export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "customer" | "admin";
  phone?: string;
  address?: string;
  date_joined: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  phone?: string;
  role?: string;
  address?: string;
}
