import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { cart, loading } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
      if (quantity === 0) {
        toast.success('Item removed from cart');
      } else {
        toast.success('Cart updated');
      }
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => (
            <div key={item.id} className="p-6">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={item.product.image || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    className="h-20 w-20 object-cover rounded-md"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.product.category_name}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    ${parseFloat(item.product.price).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-medium w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Total Price */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ${parseFloat(item.total_price).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800 mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in cart
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                Total: ${parseFloat(cart.total_price).toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="flex-1 bg-gray-200 text-gray-800 text-center py-3 px-6 rounded-md hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;