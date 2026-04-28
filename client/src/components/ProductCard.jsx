import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isDigital = product.productType === "digital";
  const isUnavailable = !isDigital && product.stock === 0;

  return (
    <div className="panel overflow-hidden">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-[4/4.5] overflow-hidden">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
              {product.category}
            </span>
            {product.featured && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: "rgb(var(--accent))" }}
              >
                Editor's pick
              </span>
            )}
            {isDigital && (
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-900">
                Digital
              </span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent px-5 pb-5 pt-12 text-white">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/62">Curated piece</p>
            <p className="mt-2 font-display text-3xl font-bold">{product.name}</p>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm leading-6 text-muted">{product.description}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">from</p>
            <p className="mt-1 font-display text-2xl font-bold">{formatCurrency(product.price)}</p>
            <p className="mt-1 text-xs text-muted">
              {isDigital ? "Instant download after payment" : `Stock ${product.stock}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={isUnavailable}
            className="button-primary gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={16} />
            {isUnavailable ? "Sold out" : isDigital ? "Add download" : "Reserve piece"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
