import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Link } from "react-router-dom";

import AdminPageHeader from "./AdminPageHeader";
import DashboardMetricCard from "./DashboardMetricCard";
import DashboardOrdersTable from "./DashboardOrdersTable";
import DashboardRevenueChart from "./DashboardRevenueChart";
import { formatCurrency } from "../../utils/currency";

const getDailyRevenueSeries = (orders) => {
  const days = 7;
  const formatter = new Intl.DateTimeFormat("lt-LT", { weekday: "short" });
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
    customer: order.user?.name || "Klientas",
    email: order.user?.email || "-",
    orderCode: `#${order._id.slice(-6).toUpperCase()}`,
    items: order.items.length,
    date: new Date(order.createdAt).toLocaleDateString("lt-LT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status: order.status,
    total: order.totalPrice,
  }));

  const statCards = [
    {
      label: "Pajamos",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      meta: `Vidutinė užsakymo vertė ${formatCurrency(averageOrderValue)}`,
      accent: "bg-sky-50 text-sky-600",
    },
    {
      label: "Užsakymai",
      value: dashboardData.orders.length,
      icon: ShoppingCart,
      meta: `${pendingOrders} laukia apdorojimo`,
      accent: "bg-violet-50 text-violet-600",
    },
    {
      label: "Klientai",
      value: customerCount,
      icon: Users,
      meta: `${dashboardData.users.length} paskyros iš viso`,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Katalogas",
      value: dashboardData.productTotal,
      icon: Package,
      meta: `${lowStock} produktai su mažu likučiu`,
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow={previewMode ? "Valdymo peržiūra" : "Pajamų suvestinė"}
        title="Švarus valdymo centras komercijos operacijoms"
        description="Stebėk pajamas, užsakymų eigą, klientų aktyvumą ir naujausius pirkimus vienoje aiškioje darbo erdvėje."
        secondaryAction={
          previewMode ? { to: "/", label: "Grįžti į svetainę" } : { to: "/admin/products", label: "Valdyti produktus" }
        }
        primaryAction={previewMode ? undefined : { to: "/admin/orders", label: "Peržiūrėti užsakymus" }}
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
          <p className="text-sm font-medium text-slate-500">Operacijų vaizdas</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Kam reikia dėmesio</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Laukiantys užsakymai</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{pendingOrders}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Užsakymai, kuriems reikia apdorojimo arba būsenos atnaujinimo.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Mažas likutis</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{lowStock}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Produktai, kurių likutis jau pasiekė žemą ribą.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Greitos nuorodos</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={previewMode ? "/admin-preview" : "/admin/products"} className="dashboard-button-secondary">
                  {previewMode ? "Peržiūros režimas" : "Produktai"}
                </Link>
                <Link to={previewMode ? "/admin-preview" : "/admin/orders"} className="dashboard-button-secondary">
                  {previewMode ? "Pavyzdiniai duomenys" : "Užsakymai"}
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
