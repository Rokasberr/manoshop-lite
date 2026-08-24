import { Download, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import StatusBadge from "../components/admin/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import authService from "../services/authService";
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

const passwordCopy = {
  title: "Paskyros saugumas",
  text: "Pakeitus slaptažodį visos aktyvios sesijos bus atjungtos.",
  currentPassword: "Dabartinis slaptažodis",
  newPassword: "Naujas slaptažodis",
  confirmPassword: "Pakartok naują slaptažodį",
  submit: "Pakeisti slaptažodį",
  loading: "Keičiama...",
  required: "Užpildyk visus slaptažodžio laukus.",
  length: "Naujas slaptažodis turi būti 6-128 simbolių.",
  mismatch: "Nauji slaptažodžiai nesutampa.",
  success: "Slaptažodis pakeistas. Prisijunk iš naujo.",
  fail: "Slaptažodžio pakeisti nepavyko.",
};

const paidPlanIds = new Set(["personal", "private_business"]);
const problemStatuses = new Set(["past_due", "unpaid", "incomplete", "incomplete_expired", "paused", "inactive"]);

const getSubscriptionStatusLabel = (status = "") => {
  const labels = {
    active: "Aktyvi",
    trialing: "Bandomasis laikotarpis",
    past_due: "Reikia sutvarkyti mokėjimą",
    unpaid: "Neapmokėta",
    canceled: "Atšaukta",
    incomplete: "Mokėjimas neužbaigtas",
    incomplete_expired: "Mokėjimo patvirtinimas pasibaigė",
    paused: "Pristabdyta",
    inactive: "Neaktyvi",
  };

  return labels[status] || "Neaktyvi";
};

const getInvoiceStatusLabel = (status = "") => {
  const labels = {
    paid: "Apmokėta",
    open: "Laukiama apmokėjimo",
    draft: "Ruošiama",
    void: "Anuliuota",
    uncollectible: "Neišieškoma",
  };

  return labels[status] || "Būsena nepatikslinta";
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, logout } = useAuth();
  const { language, t } = useLanguage();
  const copy = t("profile");
  const [orders, setOrders] = useState([]);
  const [subscriptionInvoices, setSubscriptionInvoices] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [invoiceError, setInvoiceError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState("");
  const [downloadingDigitalKey, setDownloadingDigitalKey] = useState("");
  const [syncingMembership, setSyncingMembership] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const normalizedRole = normalizeUserRole(user);
  const profileRole = isAdminUser(user)
    ? "admin"
    : canAccessBusinessStudio(user?.subscription?.plan)
      ? "seller"
      : normalizedRole;
  const subscription = user?.subscription || {};
  const planId = normalizePlan(subscription.plan || "free");
  const hasStripePaidPlan = subscription.provider === "stripe" && paidPlanIds.has(planId);
  const hasPaymentIssue = hasStripePaidPlan && problemStatuses.has(subscription.status);
  const hasScheduledCancel =
    hasStripePaidPlan &&
    (subscription.status === "active" || subscription.status === "trialing") &&
    Boolean(subscription.cancelAtPeriodEnd);

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

  useEffect(() => {
    let cancelled = false;

    const loadSubscriptionInvoices = async () => {
      try {
        setInvoiceLoading(true);
        setInvoiceError("");
        const data = await billingService.getSubscriptionInvoices();

        if (!cancelled) {
          setSubscriptionInvoices(Array.isArray(data.invoices) ? data.invoices : []);
        }
      } catch (_loadError) {
        if (!cancelled) {
          setInvoiceError("Prenumeratos sąskaitų šiuo metu nepavyko užkrauti.");
          setSubscriptionInvoices([]);
        }
      } finally {
        if (!cancelled) {
          setInvoiceLoading(false);
        }
      }
    };

    loadSubscriptionInvoices();

    return () => {
      cancelled = true;
    };
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
    if (syncingMembership) {
      return;
    }

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

  const handleOpenPortal = async () => {
    if (openingPortal) {
      return;
    }

    try {
      setOpeningPortal(true);
      const result = await billingService.createPortalSession();

      if (!result?.url) {
        throw new Error("Missing portal URL");
      }

      window.location.assign(result.url);
    } catch (_portalError) {
      toast.error("Prenumeratos savitarnos šiuo metu nepavyko atidaryti.");
      setOpeningPortal(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (changingPassword) {
      return;
    }

    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError(passwordCopy.required);
      return;
    }

    if (passwordForm.newPassword.length < 6 || passwordForm.newPassword.length > 128) {
      setPasswordError(passwordCopy.length);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(passwordCopy.mismatch);
      return;
    }

    try {
      setChangingPassword(true);
      const result = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      const message = result.message || passwordCopy.success;
      setPasswordSuccess(message);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await logout({ skipServer: true });
      navigate("/login", { replace: true, state: { message } });
    } catch (changeError) {
      const backendMessage = changeError.response?.data?.message;
      const safeBackendMessage =
        changeError.response?.status < 500 && typeof backendMessage === "string" ? backendMessage : "";
      setPasswordError(safeBackendMessage || passwordCopy.fail);
    } finally {
      setChangingPassword(false);
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
            </div>
          </div>

          <div className="panel p-6">
            <p className="eyebrow">{copy.membership}</p>
            <h2 className="mt-4 font-display text-3xl font-bold">
              {t(`common.plans.${normalizePlan(user?.subscription?.plan) || "free"}`)} {copy.planSuffix}
            </h2>
            <p className="mt-2 text-muted">
              {copy.status}:{" "}
              <span className="font-semibold text-current">
                {getSubscriptionStatusLabel(subscription.status)}
              </span>
            </p>
            <p className="mt-2 text-muted">
              {copy.provider}:{" "}
              <span className="font-semibold text-current">
                {copy.subscriptionProviders[subscription.provider] || copy.subscriptionProviders.internal}
              </span>
            </p>
            {subscription.currentPeriodEnd && (
              <p className="mt-2 text-muted">
                {hasScheduledCancel ? "Galioja iki" : copy.renewsUntil}:{" "}
                <span className="font-semibold text-current">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(language)}
                </span>
              </p>
            )}
            {hasScheduledCancel && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                Prenumerata bus atšaukta laikotarpio pabaigoje
                {subscription.currentPeriodEnd
                  ? `: ${new Date(subscription.currentPeriodEnd).toLocaleDateString(language)}.`
                  : "."}
              </div>
            )}
            {hasPaymentIssue && (
              <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                Mokama prieiga pristabdyta, kol mokėjimas bus sutvarkytas.
              </div>
            )}
            {hasStripePaidPlan ? (
              <button
                type="button"
                onClick={handleOpenPortal}
                disabled={openingPortal}
                className="button-primary mt-6 w-full max-w-full justify-center gap-2 whitespace-normal disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <ExternalLink size={16} />
                {openingPortal
                  ? "Atidaroma..."
                  : hasPaymentIssue
                    ? "Sutvarkyti mokėjimą"
                    : "Valdyti prenumeratą ir sąskaitas"}
              </button>
            ) : (
              <Link to="/pricing" className="button-secondary mt-6 inline-flex w-full justify-center whitespace-normal sm:w-auto">
                {t("common.buttons.managePlan")}
              </Link>
            )}
            {hasActiveMembership(user) && (
              <Link to="/members/savings-studio" className="button-secondary mt-4 inline-flex w-full justify-center whitespace-normal sm:w-auto">
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

          <form className="panel min-w-0 space-y-4 p-6" onSubmit={handleChangePassword}>
            <div>
              <p className="eyebrow">{passwordCopy.title}</p>
              <p className="mt-3 text-sm text-muted">{passwordCopy.text}</p>
            </div>

            {passwordError && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                {passwordSuccess}
              </div>
            )}

            <div>
              <label htmlFor="profile-current-password" className="mb-2 block text-sm font-semibold">
                {passwordCopy.currentPassword}
              </label>
              <input
                id="profile-current-password"
                name="currentPassword"
                className="input-field"
                type="password"
                autoComplete="current-password"
                required
                value={passwordForm.currentPassword}
                onChange={(event) => handlePasswordChange("currentPassword", event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="profile-new-password" className="mb-2 block text-sm font-semibold">
                {passwordCopy.newPassword}
              </label>
              <input
                id="profile-new-password"
                name="newPassword"
                className="input-field"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
                value={passwordForm.newPassword}
                onChange={(event) => handlePasswordChange("newPassword", event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="profile-confirm-password" className="mb-2 block text-sm font-semibold">
                {passwordCopy.confirmPassword}
              </label>
              <input
                id="profile-confirm-password"
                name="confirmPassword"
                className="input-field"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
                value={passwordForm.confirmPassword}
                onChange={(event) => handlePasswordChange("confirmPassword", event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="button-primary w-full max-w-full justify-center whitespace-normal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingPassword ? passwordCopy.loading : passwordCopy.submit}
            </button>
          </form>
        </div>

        <div className="space-y-6">
        <div className="panel min-w-0 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Prenumeratos mokėjimai</p>
              <h2 className="mt-4 font-display text-3xl font-bold">Sąskaitų santrauka</h2>
            </div>
            {hasStripePaidPlan && (
              <button
                type="button"
                onClick={handleOpenPortal}
                disabled={openingPortal}
                className="button-secondary w-full max-w-full justify-center gap-2 whitespace-normal disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <ExternalLink size={16} />
                {openingPortal ? "Atidaroma..." : "Atidaryti Stripe Portal"}
              </button>
            )}
          </div>

          {invoiceLoading ? (
            <LoadingSpinner />
          ) : invoiceError ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              {invoiceError}
            </div>
          ) : !subscriptionInvoices.length ? (
            <p className="mt-6 text-sm text-muted">
              Prenumeratos sąskaitų dar nėra. Kortelės, plano ir pilnų sąskaitų valdymas vyksta per Stripe Customer Portal.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {subscriptionInvoices.map((invoice, invoiceIndex) => (
                <div key={`${invoice.number || invoice.date || "invoice"}-${invoiceIndex}`} className="soft-card min-w-0 rounded-[24px] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">{invoice.number || "Stripe sąskaita"}</p>
                      <p className="mt-1 text-sm text-muted">
                        {invoice.date ? new Date(invoice.date).toLocaleDateString(language) : "Data nepatikslinta"}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                      <p className="mt-1 text-sm text-muted">{getInvoiceStatusLabel(invoice.status)}</p>
                    </div>
                  </div>
                  {(invoice.hostedInvoiceUrl || invoice.invoicePdf) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {invoice.hostedInvoiceUrl && (
                        <a className="button-secondary gap-2" href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                          <ExternalLink size={16} />
                          Peržiūrėti sąskaitą
                        </a>
                      )}
                      {invoice.invoicePdf && (
                        <a className="button-secondary gap-2" href={invoice.invoicePdf} target="_blank" rel="noreferrer">
                          <Download size={16} />
                          PDF sąskaita
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
                actionLabel={copy.viewProducts}
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
    </div>
  );
};

export default ProfilePage;
