import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { ordersAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: any[];
  growth: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {


    const fetchDashboardData = async () => {
      try {
        const { total_orders, total_revenue, pending_orders, growth, recent_orders } = await ordersAPI.getAdminDashboard(); // This returns { count, next, previous, results }
        setStats({ growth, pendingOrders: pending_orders, recentOrders: recent_orders, totalOrders: total_orders, totalRevenue: total_revenue });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your admin panel. Monitor and manage your e-commerce store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.totalRevenue.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pendingOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Growth</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.growth || "12"}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/products"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Package className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-600">
                  Add, edit, or remove products
                </p>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-600">
                  View and update order status
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {stats?.recentOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${order.status === "pending"
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
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
