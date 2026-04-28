import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { STORE_PURCHASES_PAUSED, STORE_PURCHASES_PAUSED_MESSAGE } from "../constants/storefront";
import orderService from "../services/orderService";
import { formatCurrency } from "../utils/currency";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Lithuania",
    phone: "",
    paymentMethod: "card",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setFormData((currentData) => ({ ...currentData, fullName: user.name }));
    }
  }, [user]);

  const hasDigitalProducts = cartItems.some((item) => item.productType === "digital");
  const requiresShipping = cartItems.some((item) => item.productType !== "digital");
  const physicalSubtotal = cartItems
    .filter((item) => item.productType !== "digital")
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (hasDigitalProducts) {
      setFormData((currentData) => ({ ...currentData, paymentMethod: "card" }));
    }
  }, [hasDigitalProducts]);

  if (!cartItems.length) {
    return (
      <EmptyState
        title="Checkout negalimas"
        description="Pirmiausia įsidėk produktų į krepšelį."
        actionLabel="Eiti į parduotuvę"
      />
    );
  }

  if (STORE_PURCHASES_PAUSED) {
    return (
      <EmptyState
        title="Checkout laikinai sustabdytas"
        description={STORE_PURCHASES_PAUSED_MESSAGE}
        actionLabel="Grįžti į launch soon"
        actionTo="/launch-soon"
      />
    );
  }

  const shipping = requiresShipping ? (physicalSubtotal >= 100 ? 0 : 6.99) : 0;
  const tax = subtotal * 0.21;
  const total = subtotal + shipping + tax;

  const handleChange = (field, value) => {
    setFormData((currentData) => ({ ...currentData, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.fullName.trim() ||
      (requiresShipping &&
        (!formData.address.trim() ||
          !formData.city.trim() ||
          !formData.postalCode.trim() ||
          !formData.country.trim()))
    ) {
      setError(
        requiresShipping
          ? "Užpildyk visus privalomus pristatymo laukus."
          : "Užpildyk pirkėjo vardą ir pavardę."
      );
      return;
    }

    if (hasDigitalProducts && formData.paymentMethod !== "card") {
      setError("Skaitmeniniams produktams šiuo metu galimas tik atsiskaitymas kortele.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: formData.fullName.trim(),
          address: requiresShipping ? formData.address.trim() : "",
          city: requiresShipping ? formData.city.trim() : "",
          postalCode: requiresShipping ? formData.postalCode.trim() : "",
          country: requiresShipping ? formData.country.trim() : "",
          phone: formData.phone.trim(),
        },
        paymentMethod: formData.paymentMethod,
      };

      if (formData.paymentMethod === "card") {
        const session = await orderService.createStripeCheckoutSession(orderPayload);

        if (!session?.url) {
          throw new Error("Stripe checkout nuoroda negauta.");
        }

        window.location.assign(session.url);
        return;
      }

      const order = await orderService.createOrder(orderPayload);

      try {
        await orderService.downloadInvoice(order._id, order.invoice?.number || `invoice-${order._id}`);
      } catch (_invoiceError) {
        toast.error("Užsakymas sukurtas, bet PDF sąskaitos atsisiųsti nepavyko.");
      }

      clearCart();
      toast.success("Užsakymas sukurtas, sąskaita sugeneruota.");
      navigate("/profile");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Nepavyko sukurti užsakymo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="checkout"
        title="Pabaik užsakymą be trinties"
        subtitle="Forma validuojama klientinėje pusėje, serveris perskaičiuoja sumas, o mokėjimui kortele naudosime Stripe Checkout."
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form className="panel space-y-5 p-6" onSubmit={handleSubmit}>
          <h2 className="font-display text-3xl font-bold">
            {requiresShipping ? "Pristatymo informacija" : "Pirkėjo informacija"}
          </h2>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {!requiresShipping && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Šiame užsakyme yra tik skaitmeniniai produktai, todėl pristatymo adreso nereikia. Po apmokėjimo
              atsisiuntimai atsiras tavo profilyje.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">Vardas ir pavardė</label>
              <input
                className="input-field"
                value={formData.fullName}
                onChange={(event) => handleChange("fullName", event.target.value)}
              />
            </div>

            {requiresShipping && (
              <>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">Adresas</label>
                  <input
                    className="input-field"
                    value={formData.address}
                    onChange={(event) => handleChange("address", event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Miestas</label>
                  <input
                    className="input-field"
                    value={formData.city}
                    onChange={(event) => handleChange("city", event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Pašto kodas</label>
                  <input
                    className="input-field"
                    value={formData.postalCode}
                    onChange={(event) => handleChange("postalCode", event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Šalis</label>
                  <input
                    className="input-field"
                    value={formData.country}
                    onChange={(event) => handleChange("country", event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Telefonas</label>
                  <input
                    className="input-field"
                    value={formData.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">Mokėjimo būdas</label>
              {hasDigitalProducts ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Skaitmeniniams produktams naudojamas tik atsiskaitymas kortele per Stripe.
                </div>
              ) : (
                <select
                  className="select-field"
                  value={formData.paymentMethod}
                  onChange={(event) => handleChange("paymentMethod", event.target.value)}
                >
                  <option value="card">Kortelė (Stripe)</option>
                  <option value="bank-transfer">Bankinis pavedimas</option>
                  <option value="cash-on-delivery">Apmokėti pristatymo metu</option>
                </select>
              )}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="button-primary w-full">
            {submitting
              ? "Tvirtinama..."
              : formData.paymentMethod === "card"
                ? "Tęsti į Stripe"
                : "Patvirtinti užsakymą"}
          </button>
        </form>

        <aside className="panel h-fit p-6">
          <p className="eyebrow">order summary</p>
          <h2 className="mt-4 font-display text-3xl font-bold">Galutinė suma</h2>

          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-2xl object-cover" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                    {item.productType === "digital" && (
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Digital</p>
                    )}
                  </div>
                </div>
                <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
              </div>
            ))}
          </div>

          <div className="soft-border-top mt-6 space-y-3 pt-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Prekės</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Pristatymas</span>
              <span>
                {!requiresShipping ? "Netaikoma" : shipping === 0 ? "Nemokamas" : formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">PVM</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex items-center justify-between font-display text-2xl font-bold">
              <span>Viso</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
