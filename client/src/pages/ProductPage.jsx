import { CheckCircle2, FileText, Minus, PackageCheck, Plus, ShieldCheck, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Seo from "../components/Seo";
import { STORE_PURCHASES_PAUSED, STORE_PURCHASES_PAUSED_MESSAGE } from "../constants/storefront";
import { useCart } from "../context/CartContext";
import productService from "../services/productService";
import { formatCurrency } from "../utils/currency";
import { getProductDisplayImages } from "../utils/productVisuals";

const getAvailabilityText = ({ product, isDigital }) => {
  if (STORE_PURCHASES_PAUSED) {
    return "Pardavimas netrukus";
  }

  if (isDigital) {
    return "Skaitmeninis resursas po įsigijimo, jei taikoma";
  }

  if (product.stock > 0) {
    return `Yra sandėlyje: ${product.stock} vnt.`;
  }

  return "Šiuo metu nepasiekiama";
};

const getDeliveryText = (isDigital) =>
  isDigital
    ? "Skaitmeniniai resursai pasiekiami po įsigijimo, jei taikoma. Prieigos informacija pateikiama paskyroje arba pirkimo komunikacijoje."
    : "Pristatymo eiga ir užsakymo informacija pateikiama aiškiai pirkimo metu ir po užsakymo.";

const getIncludedItems = (product, isDigital) => {
  if (isDigital) {
    return [
      product.digitalAsset?.storagePath
        ? "Priskirtas skaitmeninis resursas pagal produkto aprašymą"
        : "Skaitmeninio resurso prieiga, jei priskirta produktui",
      "Pirkimo įrašas ir sąskaita paskyroje",
      "Aiški naudojimo ir pristatymo kryptis po įsigijimo",
    ];
  }

  return [
    "Fizinis produktas pagal katalogo aprašymą",
    "Užsakymo ir pristatymo informacija",
    "Pirkimo įrašas ir sąskaita paskyroje",
  ];
};

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const displayImages = getProductDisplayImages(product);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
        setSelectedImage(getProductDisplayImages(data)[0] || "");
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
  const TypeIcon = isDigital ? FileText : PackageCheck;
  const maxQuantity = isDigital ? 10 : product.stock;
  const isUnavailable = STORE_PURCHASES_PAUSED || (!isDigital && product.stock === 0);
  const includedItems = getIncludedItems(product, isDigital);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr]">
      <Seo
        title={product.name}
        description={product.description || "Stilloak Studio product with clear purchase and account access."}
        path={`/products/${id}`}
        image={displayImages[0]}
        type="product"
      />
      <div className="space-y-4">
        <div className="panel overflow-hidden bg-[rgb(var(--surface-soft))]">
          {selectedImage ? (
            <img src={selectedImage} alt={product.name} className="aspect-[4/4.4] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/4.4] w-full items-center justify-center px-8 text-center text-sm font-semibold text-muted">
              StillOak Studio produktas
            </div>
          )}
        </div>

        {displayImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {displayImages.map((image) => (
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

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            "Saugus apmokėjimas",
            "Aiškus pristatymas",
            "Skaitmeniniai resursai pasiekiami po įsigijimo, jei taikoma",
          ].map((item) => (
            <div key={item} className="marketing-mini-card">
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-6 sm:p-8">
        <Link to="/digital-products" className="eyebrow">
          Grįžti į produktus
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-black/70 px-3 py-1 text-xs font-semibold text-white">
            {product.category}
          </span>
          <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[rgb(var(--text))]">
            {isDigital ? "Skaitmeninis resursas" : "Fizinis produktas"}
          </span>
          {product.featured && (
            <span className="rounded-lg px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: "rgb(var(--accent))" }}>
              Atrinkta
            </span>
          )}
        </div>

        <h1 className="mt-5 break-words font-display text-4xl font-bold leading-tight sm:text-5xl">{product.name}</h1>
        <p className="mt-4 text-base leading-8 text-muted sm:text-lg">{product.description}</p>

        <div className="mt-8 rounded-lg bg-[rgb(var(--surface-soft))] p-5">
          <div className="flex items-start gap-4">
            <TypeIcon size={20} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase leading-5 text-muted">Produkto vertė</p>
              <p className="mt-2 text-sm leading-7 text-muted">
                Tai {isDigital ? "skaitmeninis StillOak Studio resursas" : "fizinis StillOak Studio produktas"}{" "}
                {product.category} kategorijoje. Jis skirtas pirkėjui, kuris nori aiškiai atrinkto, naudingo sprendimo
                be demo katalogo triukšmo.
              </p>
            </div>
          </div>
        </div>

        <div className="soft-card-strong mt-6 rounded-lg p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Kaina</p>
              <p className="mt-2 font-display text-4xl font-bold">{formatCurrency(product.price)}</p>
            </div>
            <p className="max-w-xs text-sm leading-6 text-muted">{getAvailabilityText({ product, isDigital })}</p>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="soft-pill flex w-full items-center justify-between rounded-lg px-2 py-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
                className="h-11 w-11 rounded-lg"
              >
                <Minus size={16} className="mx-auto" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((currentQuantity) => Math.min(maxQuantity, currentQuantity + 1))
                }
                className="h-11 w-11 rounded-lg"
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
              className="button-primary min-h-[52px] flex-1 gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart size={16} />
              {STORE_PURCHASES_PAUSED ? "Netrukus" : isUnavailable ? "Išparduota" : "Į krepšelį"}
            </button>
          </div>
        </div>

        {STORE_PURCHASES_PAUSED && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {STORE_PURCHASES_PAUSED_MESSAGE}
          </div>
        )}

        <div className="premium-divider mt-8 pt-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Kas įeina</p>
              <div className="mt-4 space-y-3">
                {includedItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent))" }} />
                    <p className="text-sm leading-6 text-muted">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted">Pristatymas ir prieiga</p>
              <p className="mt-4 text-sm leading-7 text-muted">{getDeliveryText(isDigital)}</p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Saugus apmokėjimas, aiški užsakymo informacija ir skaitmeniniai resursai po įsigijimo, jei taikoma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
