import { ArrowRight, FileText, PackageCheck, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

import { STORE_PURCHASES_PAUSED, STORE_PURCHASES_PAUSED_MESSAGE } from "../constants/storefront";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency";
import { getPrimaryProductImage } from "../utils/productVisuals";

const getAvailabilityText = ({ product, isDigital, isUnavailable }) => {
  if (STORE_PURCHASES_PAUSED) {
    return "Pardavimas netrukus";
  }

  if (isDigital) {
    return "Skaitmeninis resursas po įsigijimo";
  }

  if (isUnavailable) {
    return "Šiuo metu nepasiekiama";
  }

  return `Yra sandėlyje: ${product.stock} vnt.`;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isDigital = product.productType === "digital";
  const isUnavailable = STORE_PURCHASES_PAUSED || (!isDigital && product.stock === 0);
  const productImage = getPrimaryProductImage(product);
  const TypeIcon = isDigital ? FileText : PackageCheck;

  return (
    <article className="panel flex h-full flex-col overflow-hidden">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-[4/4.6] overflow-hidden bg-[rgb(var(--surface-soft))]">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-semibold text-muted">
              StillOak Studio produktas
            </div>
          )}

          <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-lg bg-black/62 px-3 py-1 text-xs font-semibold text-white">
              {product.category}
            </span>
            <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
              {isDigital ? "Skaitmeninis" : "Fizinis"}
            </span>
            {product.featured && (
              <span
                className="rounded-lg px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: "rgb(var(--accent))" }}
              >
                Atrinkta
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase leading-5 text-muted">
              <TypeIcon size={14} className="shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
              {isDigital ? "Skaitmeninis resursas" : "Fizinis produktas"}
            </p>
            <h2 className="mt-3 break-words font-display text-2xl font-bold leading-tight">{product.name}</h2>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-semibold uppercase text-muted">Kaina</p>
            <p className="mt-1 font-display text-2xl font-bold">{formatCurrency(product.price)}</p>
          </div>
        </div>

        <p
          className="mt-4 text-sm leading-7 text-muted"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
          }}
        >
          {product.description}
        </p>

        <div className="mt-5 rounded-lg bg-[rgb(var(--surface-soft))] px-4 py-3">
          <p className="text-xs font-semibold uppercase leading-5 text-muted">
            {getAvailabilityText({ product, isDigital, isUnavailable })}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {isDigital
              ? "Skaitmeniniai resursai pasiekiami po įsigijimo, jei taikoma."
              : "Aiškus pristatymas ir užsakymo informacija po pirkimo."}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={isUnavailable}
            title={STORE_PURCHASES_PAUSED ? STORE_PURCHASES_PAUSED_MESSAGE : undefined}
            className="button-primary min-h-[48px] flex-1 gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={16} className="shrink-0" />
            {STORE_PURCHASES_PAUSED ? "Netrukus" : isUnavailable ? "Išparduota" : "Į krepšelį"}
          </button>
          <Link to={`/products/${product._id}`} className="button-secondary min-h-[48px] gap-2">
            Peržiūrėti
            <ArrowRight size={15} className="shrink-0" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
