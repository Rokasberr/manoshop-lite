import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import StatusBadge from "../components/admin/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import billingService from "../services/billingService";
import orderService from "../services/orderService";
import {
  canAccessBusinessStudio,
  hasActiveMembership,
  isAdminUser,
  normalizePlan,
  normalizeUserRole,
} from "../utils/membership";
import { formatCurrency } from "../utils/currency";

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const { language, t } = useLanguage();
  const copy = t("profile");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState("");
  const [downloadingDigitalKey, setDownloadingDigitalKey] = useState("");
  const [syncingMembership, setSyncingMembership] = useState(false);
  const normalizedRole = normalizeUserRole(user);
  const profileRole = isAdminUser(user)
    ? "admin"
    : canAccessBusinessStudio(user?.subscription?.plan)
      ? "seller"
      : normalizedRole;

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderService.getUserOrders();
        setOrders(data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || copy.ordersFailed);
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
      toast.success(copy.invoiceDownloaded);
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || copy.invoiceFailed);
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
      toast.success(copy.digitalDownloaded);
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || copy.digitalFailed);
    } finally {
      setDownloadingDigitalKey("");
    }
  };

  const handleSyncStripeMembership = async () => {
    try {
      setSyncingMembership(true);
      const result = await billingService.syncStripeMembership();
      await refreshProfile();

      if (
        result.subscription?.provider === "stripe" &&
        hasActiveMembership({ ...(user || {}), subscription: result.subscription })
      ) {
        toast.success(copy.membershipUpdated);
        return;
      }

      toast(copy.membershipNotFound);
    } catch (syncError) {
      toast.error(syncError.response?.data?.message || copy.membershipUpdateFailed);
    } finally {
      setSyncingMembership(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow={copy.eyebrow}
        title={t("profile.greeting", { name: user?.name?.split(" ")[0] || copy.fallbackName })}
        subtitle={copy.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="panel p-6">
            <p className="eyebrow">{copy.account}</p>
            <h2 className="mt-4 font-display text-3xl font-bold">{user?.name}</h2>
            <p className="mt-2 text-muted">{user?.email}</p>
            <div className="soft-card mt-6 rounded-[24px] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{copy.role}</p>
              <p className="mt-2 font-display text-2xl font-bold">
                {copy.roles[profileRole] || copy.roles.customer}
              </p>
              <span
                className="mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{
                  borderColor: "rgb(var(--line) / 0.82)",
                  color: "rgb(var(--accent-strong))",
                }}
              >
                {copy.backendRole}: {normalizedRole}
              </span>
            </div>
          </div>

          <div className="panel p-6">
            <p className="eyebrow">{copy.membership}</p>
            <h2 className="mt-4 font-display text-3xl font-bold">
              {t(`common.plans.${normalizePlan(user?.subscription?.plan) || "free"}`)} {copy.planSuffix}
            </h2>
            <p className="mt-2 text-muted">
              {copy.status}:{" "}
              <span className="font-semibold capitalize text-current">
                {copy.subscriptionStatuses[user?.subscription?.status] || user?.subscription?.status || copy.subscriptionStatuses.inactive}
              </span>
            </p>
            <p className="mt-2 text-muted">
              {copy.provider}:{" "}
              <span className="font-semibold capitalize text-current">
                {copy.subscriptionProviders[user?.subscription?.provider] || user?.subscription?.provider || copy.subscriptionProviders.internal}
              </span>
            </p>
            {user?.subscription?.currentPeriodEnd && (
              <p className="mt-2 text-muted">
                {copy.renewsUntil}:{" "}
                <span className="font-semibold text-current">
                  {new Date(user.subscription.currentPeriodEnd).toLocaleDateString(language)}
                </span>
              </p>
            )} 
            <Link to="/pricing" className="button-secondary mt-6 inline-flex">
              {t("common.buttons.managePlan")}
            </Link>
            {hasActiveMembership(user) && (
              <Link to="/members/savings-studio" className="button-primary mt-4 inline-flex">
                {t("common.buttons.openStudio")}
              </Link>
            )}
            {!hasActiveMembership(user) && (
              <button
                type="button"
                onClick={handleSyncStripeMembership}
                disabled={syncingMembership}
                className="button-primary mt-4 inline-flex disabled:cursor-not-allowed disabled:opacity-60"
              >
                {syncingMembership ? t("common.states.checking") : t("common.buttons.checkMembership")}
              </button>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
            <p className="eyebrow">{copy.orders}</p>
              <h2 className="mt-4 font-display text-3xl font-bold">{copy.orderArchive}</h2>
            </div>
            <p className="text-sm text-muted">{copy.total}: {orders.length}</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="mt-6 text-red-500">{error}</div>
          ) : !orders.length ? (
            <div className="mt-6">
              <EmptyState
                title={copy.noOrdersTitle}
                description={copy.noOrdersText}
                actionLabel={copy.viewCollection}
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
                        {new Date(order.createdAt).toLocaleDateString(language)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">{copy.items}</p>
                      <p className="mt-2 font-semibold">{order.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">{copy.payment}</p>
                      <p className="mt-2 font-semibold">{copy.paymentMethods[order.paymentMethod] || order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">{copy.status}</p>
                      <div className="mt-2">
                        <StatusBadge status={order.paymentStatus || "pending"} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">{copy.amount}</p>
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
                      {downloadingInvoiceId === order._id ? t("common.states.generating") : t("common.buttons.downloadPdf")}
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
                            ? t("common.states.downloading")
                            : item.digitalAsset?.downloadLabel || `${t("common.buttons.downloadExcel")} ${item.name}`}
                        </button>
                      );
                    })}
                    {!!digitalItems.length && order.paymentStatus !== "paid" && (
                      <p className="text-sm text-muted">
                        {copy.downloadsAfterPayment}
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
