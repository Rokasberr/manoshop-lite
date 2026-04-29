import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import StatusBadge from "../components/admin/StatusBadge";
import { useAuth } from "../context/AuthContext";
import billingService from "../services/billingService";
import orderService from "../services/orderService";
import { hasActiveMembership } from "../utils/membership";
import { formatCurrency } from "../utils/currency";

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState("");
  const [downloadingDigitalKey, setDownloadingDigitalKey] = useState("");
  const [syncingMembership, setSyncingMembership] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderService.getUserOrders();
        setOrders(data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko užkrauti užsakymų.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleDownloadInvoice = async (order) => {
    try {
      setDownloadingInvoiceId(order._id);
      await orderService.downloadInvoice(
        order._id,
        order.invoice?.number || `invoice-${order._id}`
      );
      toast.success("PDF sąskaita atsisiųsta.");
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || "Nepavyko atsisiųsti sąskaitos.");
    } finally {
      setDownloadingInvoiceId("");
    }
  };

  const handleDownloadDigitalProduct = async (order, item) => {
    const downloadKey = `${order._id}:${item.product}`;

    try {
      setDownloadingDigitalKey(downloadKey);
      await orderService.downloadDigitalProduct(
        order._id,
        item.product,
        item.digitalAsset?.fileName || `${item.name}.pdf`
      );
      toast.success("Skaitmeninis failas atsisiųstas.");
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || "Nepavyko atsisiųsti skaitmeninio failo.");
    } finally {
      setDownloadingDigitalKey("");
    }
  };

  const handleSyncStripeMembership = async () => {
    try {
      setSyncingMembership(true);
      const result = await billingService.syncStripeMembership();
      await refreshProfile();

      if (result.subscription?.provider === "stripe" && hasActiveMembership({ ...user, subscription: result.subscription })) {
        toast.success("Narystė atnaujinta iš Stripe.");
        return;
      }

      toast("Stripe sinchronizacija baigta, bet aktyvi narystė dar nerasta.");
    } catch (syncError) {
      toast.error(syncError.response?.data?.message || "Nepavyko atnaujinti narystės iš Stripe.");
    } finally {
      setSyncingMembership(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="profile"
        title={`Sveikas, ${user?.name?.split(" ")[0] || "vartotojau"}`}
        subtitle="Čia matai savo prenumeratos planą, sąskaitas ir užsakymų istoriją vienoje vietoje."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="panel p-6">
            <p className="eyebrow">account</p>
            <h2 className="mt-4 font-display text-3xl font-bold">{user?.name}</h2>
            <p className="mt-2 text-muted">{user?.email}</p>
            <div className="soft-card mt-6 rounded-[24px] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">role</p>
              <p className="mt-2 font-display text-2xl font-bold capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="panel p-6">
            <p className="eyebrow">subscription</p>
            <h2 className="mt-4 font-display text-3xl font-bold capitalize">
              {user?.subscription?.plan || "free"} plan
            </h2>
            <p className="mt-2 text-muted">
              Status:{" "}
              <span className="font-semibold capitalize text-current">
                {user?.subscription?.status || "inactive"}
              </span>
            </p>
            <p className="mt-2 text-muted">
              Provider:{" "}
              <span className="font-semibold capitalize text-current">
                {user?.subscription?.provider || "internal"}
              </span>
            </p>
            {user?.subscription?.currentPeriodEnd && (
              <p className="mt-2 text-muted">
                Renew/ends:{" "}
                <span className="font-semibold text-current">
                  {new Date(user.subscription.currentPeriodEnd).toLocaleDateString("lt-LT")}
                </span>
              </p>
            )} 
            <Link to="/pricing" className="button-secondary mt-6 inline-flex">
              Manage plan
            </Link>
            {hasActiveMembership(user) && (
              <Link to="/members/savings-studio" className="button-primary mt-4 inline-flex">
                Open Stilloak
              </Link>
            )}
            {!hasActiveMembership(user) && (
              <button
                type="button"
                onClick={handleSyncStripeMembership}
                disabled={syncingMembership}
                className="button-primary mt-4 inline-flex disabled:cursor-not-allowed disabled:opacity-60"
              >
                {syncingMembership ? "Tikrinama..." : "Atnaujinti narystę iš Stripe"}
              </button>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">orders</p>
              <h2 className="mt-4 font-display text-3xl font-bold">Užsakymų istorija</h2>
            </div>
            <p className="text-sm text-muted">Viso: {orders.length}</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="mt-6 text-red-500">{error}</div>
          ) : !orders.length ? (
            <div className="mt-6">
              <EmptyState
                title="Dar nėra užsakymų"
                description="Kai tik sukursi pirmą užsakymą, jis atsiras čia."
                actionLabel="Pereiti į shop"
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="soft-card rounded-[24px] p-5">
                  {(() => {
                    const digitalItems = order.items.filter(
                      (item) => item.productType === "digital" && item.digitalAsset?.storagePath
                    );

                    return (
                      <>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-xl font-bold">
                        {order.invoice?.number || `#${order._id.slice(-6).toUpperCase()}`}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {new Date(order.createdAt).toLocaleDateString("lt-LT")}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">items</p>
                      <p className="mt-2 font-semibold">{order.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">payment</p>
                      <p className="mt-2 font-semibold capitalize">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">payment status</p>
                      <div className="mt-2">
                        <StatusBadge status={order.paymentStatus || "pending"} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">total</p>
                      <p className="mt-2 font-semibold">{formatCurrency(order.totalPrice)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={downloadingInvoiceId === order._id}
                      className="button-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download size={16} />
                      {downloadingInvoiceId === order._id ? "Generuojama..." : "Atsisiųsti PDF"}
                    </button>
                    {digitalItems.map((item) => {
                      const downloadKey = `${order._id}:${item.product}`;

                      return (
                        <button
                          key={downloadKey}
                          type="button"
                          onClick={() => handleDownloadDigitalProduct(order, item)}
                          disabled={order.paymentStatus !== "paid" || downloadingDigitalKey === downloadKey}
                          className="button-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Download size={16} />
                          {downloadingDigitalKey === downloadKey
                            ? "Atsiunčiama..."
                            : item.digitalAsset?.downloadLabel || `Atsisiųsti ${item.name}`}
                        </button>
                      );
                    })}
                    {!!digitalItems.length && order.paymentStatus !== "paid" && (
                      <p className="text-sm text-muted">
                        Atsisiuntimai atrakinsis po sėkmingo apmokėjimo.
                      </p>
                    )}
                  </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
