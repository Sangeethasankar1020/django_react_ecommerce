import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle, Download, Package } from "lucide-react";
import { AppDispatch, RootState } from "../store/store";
import { fetchOrderById } from "../store/slices/ordersSlice";
import { ordersAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder: order, loading } = useSelector(
    (state: RootState) => state.orders
  );

  console.log(orderId);

  useEffect(() => {
    if (!orderId) return;
    console.log("hitet");
    dispatch(fetchOrderById(orderId))
      .unwrap()
      .catch(() => {
        toast.error("Failed to fetch order details");
      });
  }, [dispatch, orderId]);

  const handleDownloadReceipt = async () => {
    if (!order) return;

    try {
      const pdfBlob = await ordersAPI.downloadReceipt(order.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `order_${order.id}_receipt.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download receipt");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Order not found</p>
          <Link to="/orders" className="text-blue-600 hover:text-blue-800">
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Order #{order.id}
              </h2>
              <p className="text-sm text-gray-600">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "processing"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "shipped"
                    ? "bg-purple-100 text-purple-800"
                    : order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {order?.status?.charAt(0).toUpperCase() +
                  order?.status?.slice(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              {Array.isArray(order.items) &&
                order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">
                        {item.product.name}
                      </h4>
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
          </div>

          {/* Shipping Information */}
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Shipping Address
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {order.shipping_address}
            </p>
          </div>

          {/* Order Total */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Amount:</span>
              <span>${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownloadReceipt}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Download Receipt</span>
        </button>

        <Link
          to="/orders"
          className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
        >
          <Package className="h-5 w-5" />
          <span>View All Orders</span>
        </Link>

        <Link
          to="/products"
          className="flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors"
        >
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
