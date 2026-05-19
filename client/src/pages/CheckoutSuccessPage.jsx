import { CheckCircle2, Clock3, Download } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import orderService from "../services/orderService";
import { formatCurrency } from "../utils/currency";

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const { t } = useLanguage();
  const copy = t("checkout");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCheckoutStatus = async () => {
      if (!sessionId) {
        setError(copy.missingConfirmation);
        setLoading(false);
        return;
      }

      try {
        const response = await orderService.getStripeCheckoutSessionStatus(sessionId);

        if (cancelled) {
          return;
        }

        setOrder(response.order);
        setCheckoutStatus(response.checkoutStatus || "");
        setPaymentStatus(response.order?.paymentStatus || response.paymentStatus || "");

        if ((response.order?.paymentStatus || response.paymentStatus) === "paid") {
          clearCart();
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.response?.data?.message || copy.confirmFailed);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCheckoutStatus();

    return () => {
      cancelled = true;
    };
  }, [clearCart, copy.confirmFailed, copy.missingConfirmation, sessionId]);

  const handleDownloadInvoice = async () => {
    if (!order?._id) {
      return;
    }

    try {
      setDownloadingInvoice(true);
      await orderService.downloadInvoice(order._id, order.invoice?.number || `invoice-${order._id}`);
      toast.success(t("profile.invoiceDownloaded"));
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || t("profile.invoiceFailed"));
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const isPaid = paymentStatus === "paid";

  return (
    <div className="space-y-8">
      <SectionTitle eyebrow={copy.successEyebrow} title={copy.successTitle} subtitle={copy.successSubtitle} />

      <div className="panel mx-auto max-w-3xl p-8 text-center">
        {loading ? (
          <LoadingSpinner label={copy.confirming} />
        ) : error ? (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <Clock3 size={34} />
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">{copy.failedTitle}</h2>
            <p className="mt-4 text-muted">{error}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/profile" className="button-secondary">
                {copy.goToProfile}
              </Link>
              <Link to="/checkout" className="button-primary">
                {copy.backToCheckout}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              {isPaid ? <CheckCircle2 size={36} /> : <Clock3 size={36} />}
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">
              {isPaid ? copy.paymentAccepted : copy.paymentProcessing}
            </h2>
            <p className="mt-4 text-muted">{isPaid ? copy.paidText : copy.processingText}</p>

            {order && (
              <div className="soft-card mt-8 rounded-[28px] p-6 text-left">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">{copy.order}</p>
                    <p className="mt-2 font-display text-2xl font-bold">
                      {order.invoice?.number || `#${order._id.slice(-6).toUpperCase()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">{copy.amount}</p>
                    <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">{copy.status}</p>
                    <p className="mt-2 font-semibold">
                      {copy.checkoutStatuses[checkoutStatus] || checkoutStatus || copy.checkoutStatuses.checking}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">{copy.payment}</p>
                    <p className="mt-2 font-semibold">
                      {copy.paymentStatuses[paymentStatus] || paymentStatus || copy.paymentStatuses.pending}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">{copy.items}</p>
                    <p className="mt-2 font-semibold">{order.items?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/profile" className="button-primary">
                {copy.goToProfile}
              </Link>
              <Link to="/shop" className="button-secondary">
                {copy.continueShopping}
              </Link>
              {order?._id && isPaid && (
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="button-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={16} />
                  {downloadingInvoice ? t("common.states.generating") : t("common.buttons.downloadPdf")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
