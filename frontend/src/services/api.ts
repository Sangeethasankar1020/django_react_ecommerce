import axios, { AxiosResponse } from "axios";
import { LoginCredentials, RegisterData, User } from "../types/auth";
import { Product, Category } from "../types/product";
import { Cart } from "../types/cart";
import { Order, OrderCreate } from "../types/order";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response: AxiosResponse = await api.post("/auth/login/", credentials);
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response: AxiosResponse = await api.post("/auth/register/", userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response: AxiosResponse = await api.get("/auth/me/");
    return response.data;
  },

  updateProfile: async (userData: Partial<User>) => {
    const response: AxiosResponse = await api.put("/auth/profile/", userData);
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params?: {
    page?: number;
    search?: string;
    category?: string;
  }) => {
    const response: AxiosResponse = await api.get("/products/", { params });
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response: AxiosResponse = await api.get(`/products/${id}/`);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response: AxiosResponse = await api.get("/products/categories/");
    return response.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response: AxiosResponse = await api.get("/products/featured/");
    return response.data;
  },

  createProduct: async (productData: FormData) => {
    const response: AxiosResponse = await api.post("/products/", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateProduct: async (id: number, productData: FormData) => {
    const response: AxiosResponse = await api.put(
      `/products/${id}/`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteProduct: async (id: number) => {
    await api.delete(`/products/${id}/`);
  },
};

// Cart API
export const cartAPI = {
  getCart: async (): Promise<Cart> => {
    const response: AxiosResponse = await api.get("/cart/");
    return response.data;
  },

  addToCart: async (productId: number, quantity: number) => {
    const response: AxiosResponse = await api.post("/cart/add/", {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const response: AxiosResponse = await api.put(`/cart/update/${itemId}/`, {
      quantity,
    });
    return response.data;
  },

  removeFromCart: async (itemId: number) => {
    await api.delete(`/cart/remove/${itemId}/`);
  },

  clearCart: async () => {
    await api.delete("/cart/clear/");
  },
};

// Orders API
export const ordersAPI = {
  getOrders: async (): Promise<Order[]> => {
    const response: AxiosResponse = await api.get("/orders/");
    return response.data;
  },
  getAdminOrders: async (): Promise<Order[]> => {
    const response: AxiosResponse = await api.get("/orders/admin/all/");
    return response.data;
  },

  createOrder: async (orderData: OrderCreate): Promise<Order> => {
    const response: AxiosResponse = await api.post(
      "/orders/create/",
      orderData
    );
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const response: AxiosResponse = await api.get(`/orders/${orderId}/`);
    return response.data;
  },

  cancelOrder: async (orderId: string) => {
    const response: AxiosResponse = await api.post(
      `/orders/${orderId}/cancel/`
    );
    return response.data;
  },

  downloadReceipt: async (orderId: string) => {
    const response: AxiosResponse = await api.get(
      `/orders/${orderId}/receipt-pdf/`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
  updateOrderStatus: async (
    orderId: string,
    newStatus: string
  ): Promise<Order> => {
    const response: AxiosResponse = await api.put(
      `/orders/admin/${orderId}/status/`,
      { status: newStatus }
    );
    return response.data;
  },
  getAdminDashboard: async () => {
    const response: AxiosResponse = await api.get(
      `/orders/admin/dashboard-data/`
    );
    return response.data;
  },
};

interface IntentData {
  amount: number;
  description: string;
  currency: string;
}
// Payment API
export const paymentAPI = {
  createIntent: async (data: IntentData) => {
    const response: AxiosResponse = await api.post(
      `/orders/create-payment-intent/`, {
      ...data
    }
    );
    return response.data;
  },
}


export default api;
