import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Link } from "react-router-dom";

import AdminPageHeader from "./AdminPageHeader";
import DashboardMetricCard from "./DashboardMetricCard";
import DashboardOrdersTable from "./DashboardOrdersTable";
import DashboardRevenueChart from "./DashboardRevenueChart";
import { formatCurrency } from "../../utils/currency";

const getDailyRevenueSeries = (orders) => {
  const days = 7;
  const formatter = new Intl.DateTimeFormat("en", { weekday: "short" });
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (days - index - 1));

    const total = orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getDate() === date.getDate()
        );
      })
      .reduce((sum, order) => sum + order.totalPrice, 0);

    return {
      label: formatter.format(date),
      value: total,
    };
  });
};

const AdminDashboardOverview = ({ dashboardData, previewMode = false }) => {
  const totalRevenue = dashboardData.orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const averageOrderValue = dashboardData.orders.length ? totalRevenue / dashboardData.orders.length : 0;
  const pendingOrders = dashboardData.orders.filter((order) => order.status === "pending").length;
  const lowStock = dashboardData.products.filter((product) => product.stock <= 5).length;
  const customerCount = dashboardData.users.filter((user) => user.role !== "admin").length;
  const chartPoints = getDailyRevenueSeries(dashboardData.orders);
  const tableRows = dashboardData.orders.slice(0, 8).map((order) => ({
    id: order._id,
    customer: order.user?.name || "Customer",
    email: order.user?.email || "-",
    orderCode: `#${order._id.slice(-6).toUpperCase()}`,
    items: order.items.length,
    date: new Date(order.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status: order.status,
    total: order.totalPrice,
  }));

  const statCards = [
    {
      label: "Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      meta: `Avg. order value ${formatCurrency(averageOrderValue)}`,
      accent: "bg-sky-50 text-sky-600",
    },
    {
      label: "Orders",
      value: dashboardData.orders.length,
      icon: ShoppingCart,
      meta: `${pendingOrders} pending fulfillment`,
      accent: "bg-violet-50 text-violet-600",
    },
    {
      label: "Customers",
      value: customerCount,
      icon: Users,
      meta: `${dashboardData.users.length} total user accounts`,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Catalog",
      value: dashboardData.productTotal,
      icon: Package,
      meta: `${lowStock} products low on stock`,
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow={previewMode ? "Dashboard preview" : "Revenue dashboard"}
        title="A clean control center for your commerce operations"
        description="Monitor top-line revenue, fulfillment health, customer activity, and recent orders from one responsive Stripe-style workspace."
        secondaryAction={
          previewMode ? { to: "/", label: "Back to site" } : { to: "/admin/products", label: "Manage products" }
        }
        primaryAction={previewMode ? undefined : { to: "/admin/orders", label: "View orders" }}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <DashboardMetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            meta={card.meta}
            icon={card.icon}
            accent={card.accent}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <DashboardRevenueChart points={chartPoints} />

        <div className="dashboard-panel p-6">
          <p className="text-sm font-medium text-slate-500">Operational snapshot</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">What needs attention</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Pending orders</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{pendingOrders}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Orders waiting for fulfillment or status updates.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Low stock products</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{lowStock}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Inventory items at or below the low-stock threshold.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Quick links</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={previewMode ? "/admin-preview" : "/admin/products"} className="dashboard-button-secondary">
                  {previewMode ? "Preview mode" : "Products"}
                </Link>
                <Link to={previewMode ? "/admin-preview" : "/admin/orders"} className="dashboard-button-secondary">
                  {previewMode ? "Static data" : "Orders"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardOrdersTable rows={tableRows} />
    </div>
  );
};

export default AdminDashboardOverview;
