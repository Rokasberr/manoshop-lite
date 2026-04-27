import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import SectionTitle from "../components/SectionTitle";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency";

const CartPage = () => {
  const { cartItems, subtotal, updateQuantity, removeFromCart } = useCart();
  const shipping = subtotal >= 100 ? 0 : 6.99;
  const tax = subtotal * 0.21;
  const total = subtotal + shipping + tax;

  if (!cartItems.length) {
    return (
      <EmptyState
        title="Krepšelis dar tuščias"
        description="Pridėk bent vieną produktą, kad galėtum tęsti checkout procesą."
        actionLabel="Pradėti apsipirkti"
      />
    );
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="cart"
        title="Tavo krepšelis realiu laiku"
        subtitle="Keisk kiekius, pašalink prekes ir matyk sumą iš karto per Context API."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.product} className="panel flex flex-col gap-4 p-5 sm:flex-row">
              <img
                src={item.image}
                alt={item.name}
                className="h-28 w-full rounded-[24px] object-cover sm:w-32"
              />

              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link to={`/products/${item.product}`} className="font-display text-2xl font-bold">
                      {item.name}
                    </Link>
                    <p className="mt-2 text-sm text-muted">{item.category}</p>
                  </div>
                  <p className="font-display text-2xl font-bold">{formatCurrency(item.price)}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold">Kiekis</label>
                    <input
                      className="input-field w-24"
                      type="number"
                      min="1"
                      max={item.stock || 99}
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.product, Number(event.target.value))}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product)}
                    className="text-sm font-semibold text-red-500"
                  >
                    Pašalinti
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="panel h-fit p-6">
          <p className="eyebrow">summary</p>
          <h2 className="mt-4 font-display text-3xl font-bold">Užsakymo suvestinė</h2>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Prekės</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Pristatymas</span>
              <span>{shipping === 0 ? "Nemokamas" : formatCurrency(shipping)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">PVM 21%</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="soft-border-top pt-4">
              <div className="flex items-center justify-between font-display text-2xl font-bold">
                <span>Viso</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <Link to="/checkout" className="button-primary mt-8 w-full">
            Tęsti į checkout
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
