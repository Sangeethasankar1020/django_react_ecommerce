import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';
import { Cart, CartItem } from '../../types/cart';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async () => {
    const response = await cartAPI.getCart();
    return response;
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: number; quantity: number }) => {
    await cartAPI.addToCart(productId, quantity);
    const response = await cartAPI.getCart();
    return response;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
    await cartAPI.updateCartItem(itemId, quantity);
    const response = await cartAPI.getCart();
    return response;
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: number) => {
    await cartAPI.removeFromCart(itemId);
    const response = await cartAPI.getCart();
    return response;
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async () => {
    await cartAPI.clearCart();
    const response = await cartAPI.getCart();
    return response;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add to cart';
      })
      // Update Cart Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;