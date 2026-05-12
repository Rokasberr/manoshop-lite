import { ExternalLink, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import businessService from "../services/businessService";
import { formatCurrency } from "../utils/currency";
import { getPrimaryProductImage } from "../utils/productVisuals";

const BusinessProductsPage = ({ mode = "catalog" }) => {
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const [resaleProducts, myStore] = await Promise.all([
          businessService.getResaleProducts(),
          businessService.getMyStore(),
        ]);
        setProducts(resaleProducts);
        setStore(myStore);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko uzkrauti produktu.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Krauname produktus..." />;
  }

  if (error) {
    return <EmptyState title="Produktu nepavyko uzkrauti" description={error} actionLabel="Grizti" actionTo="/business" />;
  }

  const selectedIds = new Set((store?.selectedProducts || []).map((product) => product._id || product));
  const visibleProducts = mode === "selected" ? products.filter((product) => selectedIds.has(product._id)) : products;

  return (
    <div className="space-y-6">
      <section className="panel p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="signal-pill">{mode === "selected" ? "Mano produktai" : "Digital Products"}</span>
            <h1 className="mt-4 break-words font-display text-3xl font-bold leading-tight sm:text-5xl">
              {mode === "selected" ? "Tavo store pasirinkti produktai" : "Perpardavimui leidziamas katalogas"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Kataloge rodomi tik aktyvus skaitmeniniai produktai, kuriu `allowedForResale` yra true.
            </p>
          </div>
          <Link to="/business/site-builder" className="button-primary justify-center gap-2">
            Tvarkyti Site Builder
            <ExternalLink size={16} />
          </Link>
        </div>
      </section>

      {visibleProducts.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => {
            const isSelected = selectedIds.has(product._id);

            return (
              <article key={product._id} className="marketing-card min-w-0 overflow-hidden p-0">
                <img src={getPrimaryProductImage(product) || "/stilloak/collection/digital-bundle.svg"} alt={product.title || product.name} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="break-words font-display text-2xl font-bold leading-tight">{product.title || product.name}</h2>
                    {isSelected && <PackageCheck size={20} style={{ color: "rgb(var(--accent-strong))" }} />}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">{product.description}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="signal-pill">{formatCurrency(product.price)}</span>
                    <span className="signal-pill">Commission {product.commissionRate || 0}%</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title={mode === "selected" ? "Dar nepasirinkai produktu" : "Katalogas tuscias"}
          description={mode === "selected" ? "Atidaryk Site Builder ir pazymek produktus, kuriuos nori rodyti store." : "Admin dar nepridejo perpardavimui leidziamu produktu."}
          actionLabel="Atidaryti Site Builder"
          actionTo="/business/site-builder"
        />
      )}
    </div>
  );
};

export default BusinessProductsPage;
