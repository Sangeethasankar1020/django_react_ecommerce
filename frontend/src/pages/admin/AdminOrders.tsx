import React, { useEffect, useState } from "react";
import { Package, Calendar, User, DollarSign, Eye } from "lucide-react";
import { ordersAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

interface Order {
  id: string;
  user_email: string;
  status: string;
  payment_status: string;
  total_amount: string;
  created_at: string;
  items: any[];
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAdminOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully!");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
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

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        </div>
        <div className="text-gray-600">
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No orders yet
          </h2>
          <p className="text-gray-600">
            Orders will appear here when customers make purchases.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm">
                        #{order.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {order.user_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                        className={`text-sm rounded-full px-3 py-1 font-medium ${getStatusColor(
                          order.status
                        )} border-0 focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <div className="text-sm font-medium text-gray-900">
                          {parseFloat(order.total_amount).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Order Details - #{selectedOrder.id.slice(0, 8)}...
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Customer:
                  </span>
                  <p className="text-gray-900">{selectedOrder.user_email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Order Date:
                  </span>
                  <p className="text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Status:
                  </span>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Total:
                  </span>
                  <p className="text-gray-900 font-bold">
                    ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.product.image || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × $
                          {parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${parseFloat(item.total_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
