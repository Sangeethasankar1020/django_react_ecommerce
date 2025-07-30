import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Package, Download, Calendar, ShoppingBag } from "lucide-react";
import { AppDispatch, RootState } from "../store/store";
import { fetchOrders } from "../store/slices/ordersSlice";
import { ordersAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const OrderHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleDownloadReceipt = async (orderId: string) => {
    try {
      const pdfBlob = await ordersAPI.downloadReceipt(orderId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `order_${orderId}_receipt.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download receipt");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
        <p className="text-gray-600 mb-8">
          You haven't placed any orders yet. Start shopping to see your order
          history here.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        </div>
        <p className="text-gray-600">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-6">
        {orders?.results?.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                  <div>
                    <p className="text-sm text-gray-600">Order</p>
                    <p className="font-mono text-sm font-medium">#{order.id}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × $
                        {parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-lg font-medium text-gray-900">
                      ${parseFloat(item.total_price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/order-confirmation/${order.id}`}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  <span>View Details</span>
                </Link>

                <button
                  onClick={() => handleDownloadReceipt(order.id)}
                  className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Receipt</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
