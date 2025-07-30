import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  showAddToCart = true 
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <Link to={`/products/${product.id}`}>
        <div className="relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {!product.is_in_stock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {product.name}
            </h3>
            <span className="text-lg font-bold text-blue-600 ml-2">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Category</span>
              <span className="text-sm font-medium text-gray-700">
                {product.category_name}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Stock</span>
              <span className="text-sm font-medium text-gray-700">
                {product.stock} units
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      {showAddToCart && (
        <div className="px-4 pb-4">
          <button
            onClick={handleAddToCart}
            disabled={!product.is_in_stock}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;