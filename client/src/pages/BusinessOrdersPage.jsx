import { BarChart3, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/admin/StatusBadge";
import businessService from "../services/businessService";
import orderService from "../services/orderService";
import { formatCurrency } from "../utils/currency";

const BusinessOrdersPage = ({ mode = "orders" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState("");

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
      orders.filter((order) => order.paymentStatus === "paid").reduce(
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
  const pendingOrdersCount = orders.filter((order) => order.paymentStatus && order.paymentStatus !== "paid").length;

  const handleDownloadInvoice = async (order) => {
    try {
      setDownloadingInvoiceId(order._id);
      await orderService.downloadInvoice(order._id, order.invoice?.number || `invoice-${order._id}`);
      toast.success("PDF saskaita atsisiusta.");
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || "Nepavyko atsisiusti PDF saskaitos.");
    } finally {
      setDownloadingInvoiceId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-5 sm:p-7">
        <span className="signal-pill">{isEarnings ? "Earnings" : "Orders"}</span>
        <h1 className="mt-4 break-words font-display text-3xl font-bold leading-tight sm:text-5xl">
          {isEarnings ? "Pajamu ir commission apzvalga" : "Store uzsakymai"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Skaiciavimai rodo tik apmoketus uzsakymus. Pending, failed, canceled ir refunded checkout irasai lieka lenteleje kaip eiga, bet nera traukiami i pajamas.
        </p>
        <p className="mt-3 max-w-3xl text-xs font-semibold uppercase leading-5 text-muted">
          Ismokejimai MVP etape yra rankinis procesas, be automatiniu payout veiksmu.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Patvirtintos pajamos", totals.revenue],
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
          {pendingOrdersCount ? (
            <div className="border-b px-5 py-4 text-sm leading-6 text-muted" style={{ borderColor: "rgb(var(--line) / 0.72)" }}>
              {pendingOrdersCount} neapmoketi arba neuzbaigti uzsakymai rodomi audito lenteleje, bet neitraukti i pajamu korteles.
            </div>
          ) : null}
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
                  <th className="p-4 font-semibold">Saskaita</th>
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
                    <td className="p-4">
                      {order.paymentStatus === "paid" ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(order)}
                          disabled={downloadingInvoiceId === order._id}
                          className="button-secondary gap-2 px-3 py-2 disabled:opacity-60"
                        >
                          <Download size={14} />
                          {downloadingInvoiceId === order._id ? "Siunciama..." : "PDF"}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold uppercase text-muted">po apmokejimo</span>
                      )}
                    </td>
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
