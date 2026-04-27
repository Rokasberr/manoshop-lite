import { useEffect, useState } from "react";

import LoadingSpinner from "../../components/LoadingSpinner";
import AdminDashboardOverview from "../../components/admin-dashboard/AdminDashboardOverview";
import orderService from "../../services/orderService";
import productService from "../../services/productService";
import userService from "../../services/userService";

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    products: [],
    orders: [],
    users: [],
    productTotal: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsResponse, ordersResponse, usersResponse] = await Promise.all([
          productService.listProducts({ page: 1, limit: 100 }),
          orderService.getAdminOrders(),
          userService.listUsers(),
        ]);

        setDashboardData({
          products: productsResponse.products,
          orders: ordersResponse,
          users: usersResponse,
          productTotal: productsResponse.pagination.total,
        });
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko užkrauti admin duomenų.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return <div className="panel p-6 text-red-500">{error}</div>;
  }

  return <AdminDashboardOverview dashboardData={dashboardData} />;
};

export default AdminDashboardPage;
