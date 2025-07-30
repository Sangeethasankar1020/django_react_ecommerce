import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { AppDispatch, RootState } from "../../store/store";
import {
  fetchProducts,
  fetchCategories,
} from "../../store/slices/productsSlice";
import { productsAPI } from "../../services/api";
import ProductCard from "../../components/products/ProductCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  image?: FileList;
}

const AdminProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, categories, loading } = useSelector(
    (state: RootState) => state.products
  );
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, formData);
        toast.success("Product updated successfully!");
      } else {
        await productsAPI.createProduct(formData);
        toast.success("Product created successfully!");
      }

      setShowModal(false);
      setEditingProduct(null);
      dispatch(fetchProducts());
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsAPI.deleteProduct(productId);
        toast.success("Product deleted successfully!");
        dispatch(fetchProducts());
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} showAddToCart={false} />

              {/* Admin Actions Overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingProduct?.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingProduct?.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.price || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    name="stock"
                    type="number"
                    required
                    defaultValue={editingProduct?.stock || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  defaultValue={editingProduct?.category || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories?.results?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingProduct?.image && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current image will be replaced if new image is selected
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active Product
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingProduct?.is_active ?? true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition duration-300"></div>
                  <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-md transform peer-checked:translate-x-full transition duration-300"></div>
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submitting
                    ? "Saving..."
                    : editingProduct
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
