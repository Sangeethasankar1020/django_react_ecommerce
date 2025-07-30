import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';
import { Product, Category } from '../../types/product';

interface ProductsState {
  products: Product[];
  categories: Category[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: ProductsState = {
  products: [],
  categories: [],
  currentProduct: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params?: { page?: number; search?: string; category?: string }) => {
    const response = await productsAPI.getProducts(params);
    return response;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number) => {
    const response = await productsAPI.getProductById(id);
    return response;
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const response = await productsAPI.getCategories();
    return response;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    const response = await productsAPI.getFeaturedProducts();
    return response;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.results;
        state.totalPages = Math.ceil(action.payload.count / 20);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Fetch Featured Products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      });
  },
});

export const { clearCurrentProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;