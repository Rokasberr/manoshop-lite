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
import { useLanguage } from "../context/LanguageContext";
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
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-[#e2ca91]/[0.34] bg-[#e2ca91]/[0.14] px-2.5 py-1 text-[11px] font-bold text-[#f8e6b1]">
      <Icon className="shrink-0" size={13} />
      <span className="min-w-0 whitespace-normal">{label}</span>
    </span>
  );
};

const FeatureBadge = ({ children }) => (
  <span className="inline-flex min-w-0 items-center rounded-lg border border-white/[0.16] bg-white/[0.1] px-2.5 py-1 text-[11px] font-bold text-white/[0.86]">
    {children}
  </span>
);

const ProductStatusBadge = ({ user, isPurchased }) => {
  const { t } = useLanguage();

  if (isPurchased) {
    return (
      <span className="inline-flex items-center rounded-lg border border-[#9ad7b1]/[0.45] bg-[#9ad7b1]/[0.16] px-2.5 py-1 text-[11px] font-bold text-[#d7f8df]">
        {t("common.productLabels.purchased")}
      </span>
    );
  }

  if (!user) {
    return (
      <span className="inline-flex items-center rounded-lg border border-[#e2ca91]/[0.42] bg-[#e2ca91]/[0.16] px-2.5 py-1 text-[11px] font-bold text-[#f8e6b1]">
        {t("common.productLabels.registrationRequired")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-lg border border-white/[0.16] bg-white/[0.1] px-2.5 py-1 text-[11px] font-bold text-white/[0.86]">
      {t("common.productLabels.availableToBuy")}
    </span>
  );
};

const ProductPreview = ({ product }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const { t } = useLanguage();

  if (!product.imageUrl || hasImageError) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,rgba(226,202,145,0.16),rgba(126,143,117,0.2),rgba(7,19,16,0.98))] px-6 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f2d99a]">StillOak Studio</p>
          <p className="mt-3 font-display text-2xl font-bold leading-tight text-white">{product.title}</p>
          <p className="mt-2 text-sm leading-6 text-white/[0.78]">{t("common.productLabels.premiumExcelProduct")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[16/10] overflow-hidden bg-[#071310]">
      <img
        src={product.imageUrl}
        alt={product.imageAlt || `${product.title} preview`}
        loading="lazy"
        onError={() => setHasImageError(true)}
        className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.025]"
      />
    </div>
  );
};

const FileUnavailable = () => {
  const { t } = useLanguage();

  return (
    <span className="inline-flex min-h-[3rem] items-center justify-center rounded-lg border border-white/[0.16] bg-white/[0.08] px-4 py-3 text-center text-sm font-semibold leading-5 text-white/[0.76]">
      {t("common.states.fileSoon")}
    </span>
  );
};

const DownloadButton = ({ disabled, isLoading, onClick, children, variant = "primary" }) => {
  const { t } = useLanguage();
  const className =
    variant === "primary"
      ? "button-primary min-h-[3rem] justify-center gap-2 px-4 disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-lg border border-white/[0.18] bg-white/[0.1] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#e2ca91]/[0.48] hover:bg-[#e2ca91]/[0.16] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button type="button" onClick={onClick} disabled={disabled || isLoading} className={`${className} w-full max-w-full whitespace-normal text-center`}>
      <ArrowDownToLine className="shrink-0" size={16} />
      <span className="min-w-0 whitespace-normal">{isLoading ? t("common.states.preparing") : children}</span>
    </button>
  );
};

const getDownloadOptions = (product, t) =>
  [
    {
      format: "pdf",
      fileName: product.pdfFileName,
      label: t("common.buttons.downloadPdf"),
      variant: "secondary",
    },
    {
      format: "excel",
      fileName: product.excelFileName,
      label: t("common.buttons.downloadExcel"),
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
  const { t } = useLanguage();
  const ctaLabels = product.ctaLabels || {};
  const downloadOptions = getDownloadOptions(product, t);

  if (isAdminUser(user)) {
    return (
      <div className="space-y-3">
        {product.pdfFileName && (
          <button
            type="button"
            onClick={() => onAdminPreview?.(product)}
            disabled={adminPreviewLoadingId === product.id}
            className="inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-lg border border-[#e2ca91]/[0.42] bg-[#e2ca91]/[0.16] px-4 py-3 text-sm font-semibold text-[#f8e6b1] transition duration-200 hover:-translate-y-0.5 hover:border-[#e2ca91]/[0.6] hover:bg-[#e2ca91]/[0.22] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Eye size={16} />
            {adminPreviewLoadingId === product.id ? t("common.states.preparing") : t("digitalProductsPage.adminPreview")}
          </button>
        )}

        {downloadOptions.length ? (
          <div className={`grid min-w-0 gap-3 ${downloadOptions.length > 1 ? "grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]" : ""}`}>
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
      <div className="rounded-lg border border-white/[0.16] bg-black/[0.32] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <p className="flex gap-2 text-sm font-semibold leading-6 text-white">
          <LockKeyhole className="mt-0.5 shrink-0 text-[#f2d99a]" size={16} />
          {t("digitalProductsPage.guestCatalogCta")}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/[0.78]">
          {t("common.productLabels.downloadAfterPayment")}
        </p>
        <Link
          to="/register"
          state={{ from: "/digital-products", purchaseProductId: product.id }}
          className="button-primary mt-4 min-h-[3rem] w-full justify-center gap-2 px-4"
        >
          <UserPlus size={16} />
          {ctaLabels.guest || t("common.buttons.registerAndBuy")}
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
        {purchaseLoadingId === product.id ? t("common.states.preparing") : ctaLabels.purchase || t("common.buttons.buyNow")}
      </button>
    );
  }

  return downloadOptions.length ? (
    <div className={`grid min-w-0 gap-3 ${downloadOptions.length > 1 ? "grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]" : ""}`}>
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
    <div className="min-w-0 rounded-lg border border-white/[0.16] bg-black/[0.26] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/[0.68]">{title}</p>
      <ul className="mt-4 space-y-3">
        {items.slice(0, limit).map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-white/[0.84]">
            <CheckCircle2 className={`mt-0.5 shrink-0 ${iconClass}`} size={16} />
                <span className="min-w-0">{item}</span>
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
  const { t } = useLanguage();
  const isPurchased = purchasedProductIds.includes(product.id);
  const featureBadges = Array.from(
    new Set(product.badges || product.excelFeatures || [])
  ).filter((feature) => !["Excel", "PDF", product.category].includes(feature));
  const includedItems = product.whatsIncluded || product.includedItems || [];
  const trustBadges = product.trustBadges || defaultTrustBadges;

  return (
    <article className="group flex h-full min-w-0 max-w-full flex-col rounded-lg border border-white/[0.16] bg-[#0b1714] text-white shadow-[0_28px_80px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:border-[#e2ca91]/[0.42]">
      <div className="relative border-b border-white/[0.14]">
        <ProductPreview product={product} />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ca91]/[0.46] bg-[#071310]/[0.92] px-3 py-1 text-xs font-bold text-[#f8e6b1] shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur">
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
          <span className="rounded-lg border border-[#e2ca91]/[0.36] bg-[#e2ca91]/[0.14] px-3 py-1 text-xs font-bold uppercase text-[#f8e6b1]">
            {product.category}
          </span>
          {(product.formats || []).map((format) => (
            <FormatBadge key={format} format={format} />
          ))}
          {featureBadges.slice(0, 3).map((feature) => (
            <FeatureBadge key={feature}>{feature}</FeatureBadge>
          ))}
        </div>

        <div className="mt-5 min-w-0">
          <h3 className="break-words font-display text-2xl font-bold leading-tight text-white">{product.title}</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#f8e6b1]">{product.subtitle}</p>
          <p className="mt-4 text-sm leading-7 text-white/[0.86]">{product.description}</p>
          {product.salesDescription && <p className="mt-3 text-sm leading-7 text-white/[0.76]">{product.salesDescription}</p>}
        </div>

        <div className="mt-5 grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-3">
          {[
            [t("common.productLabels.price"), product.priceLabel],
            [t("common.productLabels.format"), getFormatLabel(product.formats)],
            [t("common.productLabels.version"), product.version || "1.0"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/[0.16] bg-white/[0.09] px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/[0.64]">{label}</p>
              <p className="mt-1 break-words text-sm font-bold leading-5 text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-[#e2ca91]/[0.28] bg-[#e2ca91]/[0.13] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#f8e6b1]">{t("common.productLabels.mainBenefit")}</p>
          <ul className="mt-4 space-y-3">
            {(product.benefits || []).slice(0, 5).map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-6 text-white/[0.86]">
                <BadgeCheck className="mt-0.5 shrink-0 text-[#f2d99a]" size={17} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-2">
          <SectionList title={t("common.productLabels.whatYouGet")} items={includedItems} />
          <SectionList title={t("common.productLabels.whoFor")} items={product.targetAudience || []} tone="gold" />
        </div>

        <div className="mt-4 rounded-lg border border-white/[0.16] bg-black/[0.26] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/[0.68]">{t("common.productLabels.howItWorks")}</p>
          <ol className="mt-4 space-y-3">
            {(product.howToUseSteps || []).map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-white/[0.84]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e2ca91]/[0.38] bg-[#e2ca91]/[0.14] text-xs font-bold text-[#f8e6b1]">
                  {index + 1}
                </span>
                <span className="min-w-0">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {trustBadges.slice(0, 4).map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.16] bg-white/[0.09] px-3 py-1 text-xs font-semibold text-white/[0.78]"
            >
              <ShieldCheck size={13} className="text-[#9ad7b1]" />
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <div className="min-w-0 rounded-lg border border-white/[0.16] bg-black/[0.34] p-4">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/[0.68]">{t("common.productLabels.oneTimePrice")}</p>
                <p className="mt-1 break-words font-display text-3xl font-bold text-[#f8e6b1]">{product.priceLabel}</p>
              </div>
              <div className="w-full min-w-0 sm:max-w-[13rem]">
                {isPurchased && (
                  <span className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#9ad7b1]/[0.42] bg-[#9ad7b1]/[0.16] px-3 py-1 text-xs font-bold text-[#d7f8df]">
                    <ShoppingBag size={14} />
                    {t("common.productLabels.readyToDownload")}
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
            <p className="mt-3 text-xs font-semibold leading-5 text-white/[0.72]">
              {t("common.productLabels.downloadAfterPayment")}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

const FilteredEmptyState = ({ activeFilter }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border border-white/[0.16] bg-white/[0.09] px-5 py-12 text-center text-white shadow-[0_26px_72px_rgba(0,0,0,0.18)]">
      <p className="mx-auto max-w-xl font-display text-3xl font-bold leading-tight">{t("common.empty.title")}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/[0.78]">
        {activeFilter === "all"
          ? t("common.empty.description")
          : t("common.empty.description")}
      </p>
    </div>
  );
};

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
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all");
  const filterOptions = useMemo(
    () => [
      { value: "all", label: t("common.filters.all") },
      ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))).map((category) => ({
        value: category,
        label: category,
      })),
    ],
    [products, t]
  );
  const filteredProducts = useMemo(
    () => (activeFilter === "all" ? products : products.filter((product) => product.category === activeFilter)),
    [activeFilter, products]
  );

  if (!products.length) {
    return <FilteredEmptyState activeFilter="all" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex max-w-full gap-2 overflow-x-auto rounded-lg border border-white/[0.16] bg-white/[0.09] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`min-h-[2.75rem] shrink-0 rounded-lg px-4 text-sm font-bold transition duration-200 ${
                isActive
                  ? "bg-[#e2ca91] text-[#111815] shadow-[0_14px_30px_rgba(0,0,0,0.22)]"
                  : "text-white/[0.82] hover:bg-white/[0.12] hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {filteredProducts.length ? (
        <div className="grid min-w-0 gap-5 lg:grid-cols-3">
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
