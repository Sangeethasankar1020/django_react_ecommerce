import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { fetchProductById, clearCurrentProduct } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentProduct: product, loading } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(parseInt(id)));
    }
    
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    if (!product) return;
    
    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      toast.success(`${quantity} item(s) added to cart!`);
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-blue-600">
              ${parseFloat(product.price).toFixed(2)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Category</span>
              <p className="text-lg text-gray-900">{product.category_name}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Stock</span>
              <p className="text-lg text-gray-900">
                {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Seller</span>
              <p className="text-lg text-gray-900">{product.created_by_name}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {user && product.is_in_stock && (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart - ${(parseFloat(product.price) * quantity).toFixed(2)}</span>
              </button>
            </div>
          )}

          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Please{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-yellow-900 underline hover:text-yellow-700"
                >
                  login
                </button>{' '}
                to add items to your cart.
              </p>
            </div>
          )}

          {!product.is_in_stock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">This product is currently out of stock.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;