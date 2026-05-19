import { ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import { useLanguage } from "../context/LanguageContext";
import orderService from "../services/orderService";

const CheckoutCancelPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { t } = useLanguage();
  const copy = t("checkout");
  const [loading, setLoading] = useState(Boolean(orderId));
  const [message, setMessage] = useState(copy.cancelDefault);

  useEffect(() => {
    let cancelled = false;

    const cancelCheckout = async () => {
      if (!orderId) {
        return;
      }

      try {
        await orderService.cancelStripeCheckout(orderId);

        if (!cancelled) {
          setMessage(copy.cancelUpdated);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.response?.data?.message || copy.cancelFailed);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    cancelCheckout();

    return () => {
      cancelled = true;
    };
  }, [copy.cancelFailed, copy.cancelUpdated, orderId]);

  return (
    <div className="space-y-8">
      <SectionTitle eyebrow={copy.cancelEyebrow} title={copy.cancelTitle} subtitle={copy.cancelSubtitle} />

      <div className="panel mx-auto max-w-3xl p-8 text-center">
        {loading ? (
          <LoadingSpinner label={copy.canceling} />
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <RotateCcw size={34} />
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">{copy.incompleteTitle}</h2>
            <p className="mt-4 text-muted">{message}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/checkout" className="button-primary gap-2">
                <ArrowLeft size={16} />
                {copy.backToCheckout}
              </Link>
              <Link to="/cart" className="button-secondary">
                {copy.viewCart}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutCancelPage;
