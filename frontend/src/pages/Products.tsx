import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter } from "lucide-react";
import { AppDispatch, RootState } from "../store/store";
import { fetchProducts, fetchCategories } from "../store/slices/productsSlice";
import { addToCart } from "../store/slices/cartSlice";
import ProductCard from "../components/products/ProductCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const Products: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, categories, loading } = useSelector(
    (state: RootState) => state.products
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      dispatch(
        fetchProducts({
          search: searchTerm,
          category: selectedCategory,
        })
      );
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [dispatch, searchTerm, selectedCategory]);

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      toast.success("Product added to cart!");
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors sm:hidden"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        <div className={`mt-4 ${showFilters ? "block" : "hidden"} sm:block`}>
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories?.results?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.products_count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              showAddToCart={!!user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
