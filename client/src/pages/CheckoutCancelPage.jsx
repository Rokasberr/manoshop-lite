import { ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import orderService from "../services/orderService";

const CheckoutCancelPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [loading, setLoading] = useState(Boolean(orderId));
  const [message, setMessage] = useState(
    "Stripe checkout nebuvo užbaigtas. Tavo krepšelis liko nepaliestas."
  );

  useEffect(() => {
    let cancelled = false;

    const cancelCheckout = async () => {
      if (!orderId) {
        return;
      }

      try {
        await orderService.cancelStripeCheckout(orderId);

        if (!cancelled) {
          setMessage("Mokėjimo sesija atšaukta, o rezervuotas likutis grąžintas atgal.");
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.response?.data?.message || "Sesijos atšaukti nepavyko, bet gali bandyti iš naujo.");
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
  }, [orderId]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="payment canceled"
        title="Stripe mokėjimas atšauktas"
        subtitle="Jei apsigalvojai, gali grįžti į checkout ir pabandyti dar kartą su tuo pačiu krepšeliu."
      />

      <div className="panel mx-auto max-w-3xl p-8 text-center">
        {loading ? (
          <LoadingSpinner label="Atšaukiame Stripe sesiją..." />
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <RotateCcw size={34} />
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">Mokėjimas neužbaigtas</h2>
            <p className="mt-4 text-muted">{message}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/checkout" className="button-primary gap-2">
                <ArrowLeft size={16} />
                Grįžti į checkout
              </Link>
              <Link to="/cart" className="button-secondary">
                Peržiūrėti krepšelį
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutCancelPage;
