import { CheckCircle2, Clock3, Download } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import { useCart } from "../context/CartContext";
import orderService from "../services/orderService";
import { formatCurrency } from "../utils/currency";

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
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
        setError("Trūksta Stripe session ID.");
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
          setError(loadError.response?.data?.message || "Nepavyko patvirtinti Stripe mokėjimo.");
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
  }, [clearCart, sessionId]);

  const handleDownloadInvoice = async () => {
    if (!order?._id) {
      return;
    }

    try {
      setDownloadingInvoice(true);
      await orderService.downloadInvoice(order._id, order.invoice?.number || `invoice-${order._id}`);
      toast.success("PDF sąskaita atsisiųsta.");
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || "Nepavyko atsisiųsti sąskaitos.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const isPaid = paymentStatus === "paid";

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="stripe checkout"
        title="Mokėjimo būsena"
        subtitle="Patikrinome Stripe sesiją ir sinchronizavome jos rezultatą su tavo užsakymu."
      />

      <div className="panel mx-auto max-w-3xl p-8 text-center">
        {loading ? (
          <LoadingSpinner label="Tikriname Stripe mokėjimą..." />
        ) : error ? (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <Clock3 size={34} />
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">Nepavyko patvirtinti apmokėjimo</h2>
            <p className="mt-4 text-muted">{error}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/profile" className="button-secondary">
                Eiti į profilį
              </Link>
              <Link to="/checkout" className="button-primary">
                Grįžti į checkout
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              {isPaid ? <CheckCircle2 size={36} /> : <Clock3 size={36} />}
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">
              {isPaid ? "Mokėjimas priimtas" : "Mokėjimas dar apdorojamas"}
            </h2>
            <p className="mt-4 text-muted">
              {isPaid
                ? "Stripe pažymėjo sesiją kaip apmokėtą, todėl užsakymas jau išsaugotas tavo istorijoje."
                : "Sesija užbaigta, bet apmokėjimo būsena dar nėra galutinė. Po kelių sekundžių patikrink profilį dar kartą."}
            </p>

            {order && (
              <div className="soft-card mt-8 rounded-[28px] p-6 text-left">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">order</p>
                    <p className="mt-2 font-display text-2xl font-bold">
                      {order.invoice?.number || `#${order._id.slice(-6).toUpperCase()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">total</p>
                    <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">checkout</p>
                    <p className="mt-2 font-semibold capitalize">{checkoutStatus || "unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">payment</p>
                    <p className="mt-2 font-semibold capitalize">{paymentStatus || "pending"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">items</p>
                    <p className="mt-2 font-semibold">{order.items?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/profile" className="button-primary">
                Eiti į profilį
              </Link>
              <Link to="/shop" className="button-secondary">
                Tęsti pirkimą
              </Link>
              {order?._id && isPaid && (
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="button-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={16} />
                  {downloadingInvoice ? "Generuojama..." : "Atsisiųsti PDF"}
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
