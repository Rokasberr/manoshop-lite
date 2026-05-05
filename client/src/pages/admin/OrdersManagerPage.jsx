import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminPageHeader from "../../components/admin-dashboard/AdminPageHeader";
import StatusBadge from "../../components/admin/StatusBadge";
import orderService from "../../services/orderService";
import { formatCurrency } from "../../utils/currency";

const statusOptions = ["pending", "shipped", "delivered"];
const statusOptionLabels = {
  pending: "Laukiama",
  shipped: "Išsiųsta",
  delivered: "Pristatyta",
};

const paymentMethodLabels = {
  card: "Kortelė",
  stripe: "Kortelė",
  "bank-transfer": "Bankinis pavedimas",
  "cash-on-delivery": "Apmokėjimas pristatymo metu",
};

const OrdersManagerPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState("");
  const [processingPaymentId, setProcessingPaymentId] = useState("");

  const replaceOrder = (nextOrder) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order._id === nextOrder._id ? nextOrder : order))
    );
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAdminOrders();
      setOrders(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Nepavyko užkrauti užsakymų.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingStatusId(orderId);
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      replaceOrder(updatedOrder);
      toast.success("Užsakymo statusas atnaujintas.");
    } catch (updateError) {
      toast.error(updateError.response?.data?.message || "Nepavyko atnaujinti statuso.");
    } finally {
      setUpdatingStatusId("");
    }
  };

  const handleRefund = async (orderId) => {
    try {
      setProcessingPaymentId(orderId);
      const response = await orderService.refundOrderPayment(orderId);
      replaceOrder(response.order);
      toast.success("Grąžinimas išsiųstas mokėjimų partneriui.");
    } catch (refundError) {
      toast.error(refundError.response?.data?.message || "Nepavyko atlikti grąžinimo.");
    } finally {
      setProcessingPaymentId("");
    }
  };

  const handleCancelPayment = async (orderId) => {
    try {
      setProcessingPaymentId(orderId);
      const response = await orderService.adminCancelOrderPayment(orderId);
      replaceOrder(response.order);
      toast.success("Mokėjimas atšauktas.");
    } catch (cancelError) {
      toast.error(cancelError.response?.data?.message || "Nepavyko atšaukti mokėjimo.");
    } finally {
      setProcessingPaymentId("");
    }
  };

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow="Užsakymų operacijos"
        title="Stebėk ir atnaujink užsakymus vienoje eilėje"
        description="Peržiūrėk naujausius pirkimus, siuntimo būseną ir apdorojimą vienoje aiškioje vietoje."
      />

      <div className="dashboard-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="dashboard-eyebrow">Užsakymų apžvalga</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Visi užsakymai</h2>
          </div>
          <p className="text-sm text-slate-500">Iš viso: {orders.length}</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="mt-6 text-red-500">{error}</div>
        ) : !orders.length ? (
          <div className="mt-6">
            <EmptyState
              title="Užsakymų kol kas nėra"
              description="Kai tik klientas atliks pirkimą, jis bus rodomas čia."
              actionLabel="Atnaujinti puslapį"
              actionTo="/admin/orders"
            />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-4 pr-4 font-medium">Užsakymas</th>
                  <th className="pb-4 pr-4 font-medium">Klientas</th>
                  <th className="pb-4 pr-4 font-medium">Data</th>
                  <th className="pb-4 pr-4 font-medium">Suma</th>
                  <th className="pb-4 pr-4 font-medium">Apmokėjimas</th>
                  <th className="pb-4 pr-4 font-medium">Būsena</th>
                  <th className="pb-4 pr-4 font-medium">Mokėjimo veiksmai</th>
                  <th className="pb-4 font-medium">Atnaujinti</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const paymentStatus = order.paymentStatus || "pending";
                  const canRefund = order.paymentMethod === "stripe" && paymentStatus === "paid";
                  const canCancelPayment =
                    !["paid", "refunded", "canceled"].includes(paymentStatus);
                  const disableFulfillmentUpdate = ["refunded", "canceled", "failed"].includes(paymentStatus);

                  return (
                    <tr key={order._id} className="border-b border-slate-100 align-top last:border-b-0">
                      <td className="py-4 pr-4">
                        <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="mt-1 text-slate-500">{order.items.length} prekės</p>
                        <p className="mt-1 text-slate-500">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-semibold">{order.user?.name || "Klientas"}</p>
                        <p className="mt-1 text-slate-500">{order.user?.email || "-"}</p>
                      </td>
                      <td className="py-4 pr-4">{new Date(order.createdAt).toLocaleDateString("lt-LT")}</td>
                      <td className="py-4 pr-4 font-semibold">{formatCurrency(order.totalPrice)}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={order.paymentStatus || "pending"} />
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex min-w-44 flex-col gap-2">
                          <button
                            type="button"
                            disabled={!canRefund || processingPaymentId === order._id}
                            onClick={() => handleRefund(order._id)}
                            className="button-secondary justify-center disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processingPaymentId === order._id && canRefund ? "Grąžinama..." : "Grąžinti"}
                          </button>
                          <button
                            type="button"
                            disabled={!canCancelPayment || processingPaymentId === order._id}
                            onClick={() => handleCancelPayment(order._id)}
                            className="button-secondary justify-center disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processingPaymentId === order._id && canCancelPayment ? "Atšaukiama..." : "Atšaukti mokėjimą"}
                          </button>
                        </div>
                      </td>
                      <td className="py-4">
                        <select
                          className="select-field min-w-40"
                          value={order.status}
                          disabled={disableFulfillmentUpdate || updatingStatusId === order._id}
                          onChange={(event) => handleStatusChange(order._id, event.target.value)}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {statusOptionLabels[status] || status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagerPage;
