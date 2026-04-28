import { CheckCircle2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useCart } from "../context/CartContext";
import { STORE_PURCHASES_PAUSED, STORE_PURCHASES_PAUSED_MESSAGE } from "../constants/storefront";
import productService from "../services/productService";
import { formatCurrency } from "../utils/currency";

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
        setSelectedImage(data.images?.[0] || "");
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Produktas nerastas.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !product) {
    return (
      <EmptyState
        title="Produkto nėra"
        description={error || "Šis produktas nepasiekiamas."}
        actionLabel="Grįžti į katalogą"
      />
    );
  }

  const isDigital = product.productType === "digital";
  const maxQuantity = isDigital ? 10 : product.stock;
  const isUnavailable = STORE_PURCHASES_PAUSED || (!isDigital && product.stock === 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="space-y-4">
        <div className="panel overflow-hidden">
          <img src={selectedImage} alt={product.name} className="aspect-[4/4.4] w-full object-cover" />
        </div>

        {product.images?.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((image) => (
              <button
                type="button"
                key={image}
                onClick={() => setSelectedImage(image)}
                className="panel overflow-hidden"
              >
                <img src={image} alt={product.name} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel p-8">
        <Link to="/shop" className="eyebrow">
          grįžti į kolekciją
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
            {product.category}
          </span>
          {product.featured && (
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: "rgb(var(--accent))" }}
            >
              Redakcijos pasirinkimas
            </span>
          )}
          {isDigital && (
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              Momentinis atsisiuntimas
            </span>
          )}
        </div>

        <h1 className="mt-5 font-display text-4xl font-bold">{product.name}</h1>
        <p className="mt-4 text-lg text-muted">
          {product.description} Šis objektas pristatomas kaip kolekcijos dalis, ne kaip generinė prekė iš demo katalogo.
        </p>

        <div className="soft-card-strong mt-8 rounded-[24px] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">kaina</p>
              <p className="mt-2 font-display text-4xl font-bold">{formatCurrency(product.price)}</p>
            </div>
            <p className="text-sm text-muted">
              {STORE_PURCHASES_PAUSED
                ? "Laikinai neaktyvu"
                : isDigital
                ? "Po apmokėjimo atsiras tavo paskyroje"
                : product.stock > 0
                  ? `Šiuo metu likę ${product.stock} vnt.`
                  : "Šiuo metu nepasiekiama"}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="soft-pill flex items-center rounded-full px-2 py-2">
              <button
                type="button"
                onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
                className="h-10 w-10 rounded-full"
              >
                <Minus size={16} className="mx-auto" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((currentQuantity) => Math.min(maxQuantity, currentQuantity + 1))
                }
                className="h-10 w-10 rounded-full"
                disabled={isUnavailable}
              >
                <Plus size={16} className="mx-auto" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => addToCart(product, quantity)}
              disabled={isUnavailable}
              title={STORE_PURCHASES_PAUSED ? STORE_PURCHASES_PAUSED_MESSAGE : undefined}
              className="button-primary gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart size={16} />
              {STORE_PURCHASES_PAUSED
                ? "Laikinai neaktyvu"
                : isUnavailable
                  ? "Išparduota"
                  : isDigital
                    ? "Pridėti skaitmeninį produktą"
                    : "Rezervuoti šį objektą"}
            </button>
          </div>
        </div>

        {STORE_PURCHASES_PAUSED && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {STORE_PURCHASES_PAUSED_MESSAGE}
          </div>
        )}

        <div className="premium-divider mt-8 pt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Saugus Stripe apmokėjimas",
              "PDF sąskaita išsaugoma tavo paskyroje",
              isDigital ? "Atsisiuntimas atsiras profilyje po apmokėjimo" : "Aiškūs pristatymo atnaujinimai po pirkimo",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="mt-1" style={{ color: "rgb(var(--accent))" }} />
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
