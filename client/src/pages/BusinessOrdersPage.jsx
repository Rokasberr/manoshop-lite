import { BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/admin/StatusBadge";
import businessService from "../services/businessService";
import { formatCurrency } from "../utils/currency";

const BusinessOrdersPage = ({ mode = "orders" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setOrders(await businessService.getMyOrders());
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko uzkrauti uzsakymu.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const totals = useMemo(
    () =>
      orders.reduce(
        (summary, order) => ({
          revenue: summary.revenue + Number(order.price || order.totalPrice || 0),
          platformCommission: summary.platformCommission + Number(order.platformCommission || 0),
          sellerEarnings: summary.sellerEarnings + Number(order.sellerEarnings || 0),
        }),
        { revenue: 0, platformCommission: 0, sellerEarnings: 0 }
      ),
    [orders]
  );

  if (loading) {
    return <LoadingSpinner fullScreen label="Krauname duomenis..." />;
  }

  if (error) {
    return <EmptyState title="Duomenu nepavyko uzkrauti" description={error} actionLabel="Grizti" actionTo="/business" />;
  }

  const isEarnings = mode === "earnings";

  return (
    <div className="space-y-6">
      <section className="panel p-5 sm:p-7">
        <span className="signal-pill">{isEarnings ? "Earnings" : "Orders"}</span>
        <h1 className="mt-4 break-words font-display text-3xl font-bold leading-tight sm:text-5xl">
          {isEarnings ? "Pajamu ir commission apzvalga" : "Store uzsakymai"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Skaiciavimai ateina is backend: produkto kaina, commissionRate, platformCommission ir sellerEarnings nera imami is frontend.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Bendra suma", totals.revenue],
          ["Stilloak commission", totals.platformCommission],
          ["Seller earnings", totals.sellerEarnings],
        ].map(([label, value]) => (
          <article key={label} className="marketing-card p-5">
            <BarChart3 size={20} style={{ color: "rgb(var(--accent-strong))" }} />
            <p className="mt-4 text-sm font-semibold text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{formatCurrency(value)}</p>
          </article>
        ))}
      </section>

      {orders.length ? (
        <section className="panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
                  <th className="p-4 font-semibold">Produktas</th>
                  <th className="p-4 font-semibold">Pirkejas</th>
                  <th className="p-4 font-semibold">Kaina</th>
                  <th className="p-4 font-semibold">Commission</th>
                  <th className="p-4 font-semibold">Seller earnings</th>
                  <th className="p-4 font-semibold">Mokejimas</th>
                  <th className="p-4 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b align-top last:border-b-0" style={{ borderColor: "rgb(var(--line) / 0.55)" }}>
                    <td className="p-4 font-semibold">{order.product?.title || order.product?.name || order.items?.[0]?.name || "Produktas"}</td>
                    <td className="p-4 text-muted">{order.buyerEmail || order.customerEmail || "-"}</td>
                    <td className="p-4">{formatCurrency(order.price || order.totalPrice)}</td>
                    <td className="p-4">{formatCurrency(order.platformCommission)} ({order.commissionRate || 0}%)</td>
                    <td className="p-4 font-semibold">{formatCurrency(order.sellerEarnings)}</td>
                    <td className="p-4"><StatusBadge status={order.paymentStatus || "pending"} /></td>
                    <td className="p-4 text-muted">{new Date(order.createdAt).toLocaleDateString("lt-LT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState title="Uzsakymu dar nera" description="Kai klientas pirks per tavo store, uzsakymas atsiras cia." actionLabel="Atidaryti Site Builder" actionTo="/business/site-builder" />
      )}
    </div>
  );
};

export default BusinessOrdersPage;
