import {
  ArrowDownToLine,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Eye,
  FileSpreadsheet,
  FileText,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { digitalProducts } from "../constants/digitalProducts";
import { isAdminUser } from "../utils/membership";

const formatIcons = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
};

const defaultTrustBadges = ["Saugus pirkimas", "Skaitmeninis atsisiuntimas", "Prieiga po apmokėjimo"];

const getFormatLabel = (formats = []) =>
  formats.map((format) => (format === "XLSX" ? "Excel" : format)).join(" + ") || "Excel";

const FormatBadge = ({ format }) => {
  const Icon = formatIcons[format] || FileText;
  const label = format === "XLSX" ? "Excel" : format;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ca91]/26 bg-[#e2ca91]/10 px-2.5 py-1 text-[11px] font-bold text-[#f8e6b1]">
      <Icon size={13} />
      {label}
    </span>
  );
};

const FeatureBadge = ({ children }) => (
  <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[11px] font-bold text-white/72">
    {children}
  </span>
);

const ProductStatusBadge = ({ user, isPurchased }) => {
  if (isPurchased) {
    return (
      <span className="inline-flex items-center rounded-lg border border-[#9ad7b1]/35 bg-[#9ad7b1]/12 px-2.5 py-1 text-[11px] font-bold text-[#c6f4d3]">
        Įsigyta
      </span>
    );
  }

  if (!user) {
    return (
      <span className="inline-flex items-center rounded-lg border border-[#e2ca91]/32 bg-[#e2ca91]/12 px-2.5 py-1 text-[11px] font-bold text-[#f2d99a]">
        Reikalinga registracija
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.075] px-2.5 py-1 text-[11px] font-bold text-white/72">
      Galima įsigyti
    </span>
  );
};

const ProductPreview = ({ product }) => {
  const [hasImageError, setHasImageError] = useState(false);

  if (!product.imageUrl || hasImageError) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,rgba(226,202,145,0.16),rgba(126,143,117,0.2),rgba(7,19,16,0.98))] px-6 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f2d99a]">StillOak Studio</p>
          <p className="mt-3 font-display text-2xl font-bold leading-tight text-white">{product.title}</p>
          <p className="mt-2 text-sm leading-6 text-white/62">Premium Excel produktas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[16/10] overflow-hidden bg-[#071310]">
      <img
        src={product.imageUrl}
        alt={`${product.title} peržiūra`}
        loading="lazy"
        onError={() => setHasImageError(true)}
        className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.025]"
      />
    </div>
  );
};

const FileUnavailable = () => (
  <span className="inline-flex min-h-[3rem] items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-center text-sm font-semibold leading-5 text-white/50">
    Failas netrukus bus pasiekiamas
  </span>
);

const DownloadButton = ({ disabled, isLoading, onClick, children, variant = "primary" }) => {
  const className =
    variant === "primary"
      ? "button-primary min-h-[3rem] justify-center gap-2 px-4 disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.075] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#e2ca91]/35 hover:bg-[#e2ca91]/12 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button type="button" onClick={onClick} disabled={disabled || isLoading} className={className}>
      <ArrowDownToLine size={16} />
      {isLoading ? "Ruošiama..." : children}
    </button>
  );
};

const getDownloadOptions = (product) =>
  [
    {
      format: "pdf",
      fileName: product.pdfFileName,
      label: "Atsisiųsti PDF",
      variant: "secondary",
    },
    {
      format: "excel",
      fileName: product.excelFileName,
      label: "Atsisiųsti Excel",
      variant: "primary",
    },
  ].filter((option) => option.fileName);

const PurchaseActions = ({
  product,
  user,
  isPurchased,
  onPurchase,
  onDownload,
  onAdminPreview,
  onAdminDownload,
  purchaseLoadingId,
  downloadLoadingKey,
  adminPreviewLoadingId,
  adminDownloadLoadingKey,
}) => {
  const ctaLabels = product.ctaLabels || {};
  const downloadOptions = getDownloadOptions(product);

  if (isAdminUser(user)) {
    return (
      <div className="space-y-3">
        {product.pdfFileName && (
          <button
            type="button"
            onClick={() => onAdminPreview?.(product)}
            disabled={adminPreviewLoadingId === product.id}
            className="inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-lg border border-[#e2ca91]/32 bg-[#e2ca91]/14 px-4 py-3 text-sm font-semibold text-[#f8e6b1] transition duration-200 hover:-translate-y-0.5 hover:border-[#e2ca91]/55 hover:bg-[#e2ca91]/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Eye size={16} />
            {adminPreviewLoadingId === product.id ? "Ruošiama..." : "Peržiūrėti PDF"}
          </button>
        )}

        {downloadOptions.length ? (
          <div className={`grid gap-3 ${downloadOptions.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {downloadOptions.map((option) => (
              <DownloadButton
                key={option.format}
                variant={option.variant}
                onClick={() => onAdminDownload?.(product, option.format)}
                isLoading={adminDownloadLoadingKey === `${product.id}:${option.format}`}
              >
                {option.label}
              </DownloadButton>
            ))}
          </div>
        ) : (
          <FileUnavailable />
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <p className="flex gap-2 text-sm font-semibold leading-6 text-white">
          <LockKeyhole className="mt-0.5 shrink-0 text-[#f2d99a]" size={16} />
          Prisiregistruokite, kad galėtumėte įsigyti
        </p>
        <p className="mt-2 text-sm leading-6 text-white/62">
          Pirkimui ir atsisiuntimui reikia paskyros. Produktą galėsite atsisiųsti po apmokėjimo.
        </p>
        <Link
          to="/register"
          state={{ from: "/digital-products", purchaseProductId: product.id }}
          className="button-primary mt-4 min-h-[3rem] w-full justify-center gap-2 px-4"
        >
          <UserPlus size={16} />
          {ctaLabels.guest || "Prisiregistruoti ir įsigyti"}
        </Link>
      </div>
    );
  }

  if (!isPurchased) {
    return (
      <button
        type="button"
        onClick={() => onPurchase?.(product)}
        disabled={purchaseLoadingId === product.id}
        className="button-primary min-h-[3rem] w-full justify-center gap-2 px-4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CreditCard size={16} />
        {purchaseLoadingId === product.id ? "Ruošiama..." : ctaLabels.purchase || "Pirkti dabar"}
      </button>
    );
  }

  return downloadOptions.length ? (
    <div className={`grid gap-3 ${downloadOptions.length > 1 ? "sm:grid-cols-2" : ""}`}>
      {downloadOptions.map((option) => (
        <DownloadButton
          key={option.format}
          variant={option.variant}
          onClick={() => onDownload?.(product, option.format)}
          isLoading={downloadLoadingKey === `${product.id}:${option.format}`}
        >
          {option.label}
        </DownloadButton>
      ))}
    </div>
  ) : (
    <FileUnavailable />
  );
};

const SectionList = ({ title, items = [], limit = 4, tone = "neutral" }) => {
  const iconClass = tone === "gold" ? "text-[#f2d99a]" : "text-[#9ad7b1]";

  return (
    <div className="rounded-lg border border-white/10 bg-black/18 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/44">{title}</p>
      <ul className="mt-4 space-y-3">
        {items.slice(0, limit).map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-white/72">
            <CheckCircle2 className={`mt-0.5 shrink-0 ${iconClass}`} size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DigitalProductCard = ({
  product,
  user,
  purchasedProductIds,
  onPurchase,
  onDownload,
  onAdminPreview,
  onAdminDownload,
  purchaseLoadingId,
  downloadLoadingKey,
  adminPreviewLoadingId,
  adminDownloadLoadingKey,
}) => {
  const isPurchased = purchasedProductIds.includes(product.id);
  const featureBadges = Array.from(
    new Set(product.badges || product.excelFeatures || [])
  ).filter((feature) => !["Excel", "PDF", product.category].includes(feature));
  const includedItems = product.whatsIncluded || product.includedItems || [];
  const trustBadges = product.trustBadges || defaultTrustBadges;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b1714] shadow-[0_28px_80px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:border-[#e2ca91]/32">
      <div className="relative border-b border-white/10">
        <ProductPreview product={product} />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ca91]/35 bg-[#071310]/86 px-3 py-1 text-xs font-bold text-[#f8e6b1] shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur">
            <Sparkles size={13} />
            {product.highlightBadge || product.category}
          </span>
        </div>
        <div className="absolute right-4 top-4">
          <ProductStatusBadge user={user} isPurchased={isPurchased} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-[#e2ca91]/26 bg-[#e2ca91]/10 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
            {product.category}
          </span>
          {(product.formats || []).map((format) => (
            <FormatBadge key={format} format={format} />
          ))}
          {featureBadges.slice(0, 3).map((feature) => (
            <FeatureBadge key={feature}>{feature}</FeatureBadge>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="font-display text-2xl font-bold leading-tight text-white">{product.title}</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#f2d99a]/82">{product.subtitle}</p>
          <p className="mt-4 text-sm leading-7 text-white/72">{product.description}</p>
          {product.salesDescription && <p className="mt-3 text-sm leading-7 text-white/58">{product.salesDescription}</p>}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Kaina", product.priceLabel],
            ["Formatas", getFormatLabel(product.formats)],
            ["Versija", product.version || "1.0"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.055] px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/38">{label}</p>
              <p className="mt-1 text-sm font-bold leading-5 text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-[#e2ca91]/18 bg-[#e2ca91]/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#f2d99a]/80">Pagrindinė nauda</p>
          <ul className="mt-4 space-y-3">
            {(product.benefits || []).slice(0, 5).map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-6 text-white/76">
                <BadgeCheck className="mt-0.5 shrink-0 text-[#f2d99a]" size={17} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <SectionList title="Kas įeina?" items={includedItems} />
          <SectionList title="Kam skirta?" items={product.targetAudience || []} tone="gold" />
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-black/18 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/44">Kaip veikia</p>
          <ol className="mt-4 space-y-3">
            {(product.howToUseSteps || []).map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-white/72">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e2ca91]/30 bg-[#e2ca91]/10 text-xs font-bold text-[#f2d99a]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {trustBadges.slice(0, 4).map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-semibold text-white/64"
            >
              <ShieldCheck size={13} className="text-[#9ad7b1]" />
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <div className="rounded-lg border border-white/10 bg-black/24 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/42">Vienkartinė kaina</p>
                <p className="mt-1 font-display text-3xl font-bold text-[#f8e6b1]">{product.priceLabel}</p>
              </div>
              <div className="sm:min-w-[13rem]">
                {isPurchased && (
                  <span className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#9ad7b1]/30 bg-[#9ad7b1]/10 px-3 py-1 text-xs font-bold text-[#bff0cf]">
                    <ShoppingBag size={14} />
                    Paruošta atsisiųsti
                  </span>
                )}
                <PurchaseActions
                  product={product}
                  user={user}
                  isPurchased={isPurchased}
                  onPurchase={onPurchase}
                  onDownload={onDownload}
                  onAdminPreview={onAdminPreview}
                  onAdminDownload={onAdminDownload}
                  purchaseLoadingId={purchaseLoadingId}
                  downloadLoadingKey={downloadLoadingKey}
                  adminPreviewLoadingId={adminPreviewLoadingId}
                  adminDownloadLoadingKey={adminDownloadLoadingKey}
                />
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-white/50">
              Atsisiuntimas aktyvuojamas po apmokėjimo. Failas pasiekiamas tik prisijungus prie paskyros.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

const FilteredEmptyState = ({ activeFilter }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.055] px-5 py-12 text-center text-white shadow-[0_26px_72px_rgba(0,0,0,0.18)]">
    <p className="mx-auto max-w-xl font-display text-3xl font-bold leading-tight">Kol kas čia nėra turinio</p>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/64">
      {activeFilter === "Visi"
        ? "Netrukus šioje vietoje matysite skaitmeninius produktus, šablonus ir nario įrankius."
        : "Šioje kategorijoje produktų dar nėra. Pasirinkite kitą filtrą arba grįžkite į visą biblioteką."}
    </p>
  </div>
);

const DigitalProductAccessGrid = ({
  products = digitalProducts,
  user,
  purchasedProductIds = [],
  onPurchase,
  onDownload,
  onAdminPreview,
  onAdminDownload,
  purchaseLoadingId = "",
  downloadLoadingKey = "",
  adminPreviewLoadingId = "",
  adminDownloadLoadingKey = "",
}) => {
  const [activeFilter, setActiveFilter] = useState("Visi");
  const filterOptions = useMemo(
    () => ["Visi", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))],
    [products]
  );
  const filteredProducts = useMemo(
    () => (activeFilter === "Visi" ? products : products.filter((product) => product.category === activeFilter)),
    [activeFilter, products]
  );

  if (!products.length) {
    return <FilteredEmptyState activeFilter="Visi" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.055] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`min-h-[2.75rem] shrink-0 rounded-lg px-4 text-sm font-bold transition duration-200 ${
                isActive
                  ? "bg-[#e2ca91] text-[#111815] shadow-[0_14px_30px_rgba(0,0,0,0.22)]"
                  : "text-white/66 hover:bg-white/10 hover:text-white"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {filteredProducts.length ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <DigitalProductCard
              key={product.id}
              product={product}
              user={user}
              purchasedProductIds={purchasedProductIds}
              onPurchase={onPurchase}
              onDownload={onDownload}
              onAdminPreview={onAdminPreview}
              onAdminDownload={onAdminDownload}
              purchaseLoadingId={purchaseLoadingId}
              downloadLoadingKey={downloadLoadingKey}
              adminPreviewLoadingId={adminPreviewLoadingId}
              adminDownloadLoadingKey={adminDownloadLoadingKey}
            />
          ))}
        </div>
      ) : (
        <FilteredEmptyState activeFilter={activeFilter} />
      )}
    </div>
  );
};

export default DigitalProductAccessGrid;
