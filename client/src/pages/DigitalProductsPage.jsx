import { ArrowRight, CheckCircle2, FileSpreadsheet, ShieldCheck, Sparkles, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import DigitalProductAccessGrid from "../components/DigitalProductAccessGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import Seo from "../components/Seo";
import { getLocalizedDigitalProducts } from "../constants/digitalProducts";
import { useAuth } from "../context/AuthContext";
import { useCookieConsent } from "../context/CookieConsentContext";
import { useLanguage } from "../context/LanguageContext";
import adminDigitalProductService from "../services/adminDigitalProductService";
import digitalProductService from "../services/digitalProductService";
import { applyTrackingConsent, trackAdConversion } from "../utils/analytics";
import { createCheckoutAttemptKey } from "../utils/checkoutAttempt";

const DigitalProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isCheckingAuth } = useAuth();
  const { categories } = useCookieConsent();
  const { language, t } = useLanguage();
  const copy = t("digitalProductsPage");
  const localizedProducts = useMemo(() => getLocalizedDigitalProducts(language), [language]);
  const publicProducts = useMemo(() => localizedProducts.filter((product) => product.isPublic), [localizedProducts]);
  const [purchasedProductIds, setPurchasedProductIds] = useState([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);
  const [purchaseLoadingId, setPurchaseLoadingId] = useState("");
  const [downloadLoadingKey, setDownloadLoadingKey] = useState("");
  const [pendingDigitalProduct, setPendingDigitalProduct] = useState(null);
  const [acceptedImmediateAccess, setAcceptedImmediateAccess] = useState(false);
  const [checkoutAttemptKey, setCheckoutAttemptKey] = useState("");
  const [adminPreview, setAdminPreview] = useState(null);
  const [adminPreviewLoadingId, setAdminPreviewLoadingId] = useState("");
  const [adminDownloadLoadingKey, setAdminDownloadLoadingKey] = useState("");
  const trackedDigitalPurchaseConversion = useRef("");

  useEffect(() => {
    let isMounted = true;

    const loadPurchases = async () => {
      if (!user) {
        setPurchasedProductIds([]);
        return;
      }

      try {
        setIsLoadingPurchases(true);
        const data = await digitalProductService.getPurchases();

        if (isMounted) {
          setPurchasedProductIds(data.purchasedProductIds || []);
        }
      } catch (_error) {
        if (isMounted) {
          toast.error(t("common.toast.purchasesFailed"));
        }
      } finally {
        if (isMounted) {
          setIsLoadingPurchases(false);
        }
      }
    };

    loadPurchases();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const purchaseState = searchParams.get("purchase");
    const purchasedProductId = searchParams.get("product") || "";

    if (purchaseState === "success") {
      const purchasedProduct = publicProducts.find((product) => product.id === purchasedProductId);

      if (categories.marketing && trackedDigitalPurchaseConversion.current !== purchasedProductId) {
        applyTrackingConsent(categories);
        trackAdConversion({
          eventName: `digital_product_${purchasedProductId || "unknown"}`,
          value: Number(purchasedProduct?.priceCents || 0) / 100,
          currency: "EUR",
          transactionId: `digital:${purchasedProductId || "unknown"}`,
        });
        trackedDigitalPurchaseConversion.current = purchasedProductId;
      }

      toast.success(copy.purchaseSuccess);
      setSearchParams({}, { replace: true });
    }

    if (purchaseState === "cancel") {
      toast(copy.purchaseCancel);
      setSearchParams({}, { replace: true });
    }
  }, [categories, copy.purchaseCancel, copy.purchaseSuccess, publicProducts, searchParams, setSearchParams]);

  useEffect(
    () => () => {
      if (adminPreview?.url) {
        window.URL.revokeObjectURL(adminPreview.url);
      }
    },
    [adminPreview]
  );

  const handlePurchase = async (product) => {
    if (!user) {
      navigate("/register", {
        state: { from: "/digital-products", purchaseProductId: product.id },
      });
      return;
    }

    try {
      const attemptKey = createCheckoutAttemptKey();
      setCheckoutAttemptKey(attemptKey);
      setPendingDigitalProduct(product);
      setAcceptedImmediateAccess(false);
    } catch (error) {
      toast.error(error.message || t("common.toast.purchaseReadyFailed"));
    }
  };

  const handleConfirmDigitalPurchase = async () => {
    if (!pendingDigitalProduct || purchaseLoadingId) {
      return;
    }

    if (!acceptedImmediateAccess) {
      toast.error("Prieš pirkimą reikia atskiro skaitmeninio turinio sutikimo.");
      return;
    }

    if (!checkoutAttemptKey) {
      toast.error("Nepavyko saugiai paruosti checkout bandymo. Uzdaryk langa ir bandyk dar karta.");
      return;
    }

    try {
      setPurchaseLoadingId(pendingDigitalProduct.id);
      const session = await digitalProductService.createCheckoutSession(pendingDigitalProduct.id, {
        acceptedDigitalContentImmediateAccess: true,
        attemptKey: checkoutAttemptKey,
      });

      if (session.alreadyPurchased) {
        setPurchasedProductIds((currentIds) =>
          currentIds.includes(pendingDigitalProduct.id) ? currentIds : [...currentIds, pendingDigitalProduct.id]
        );
        toast.success(t("common.toast.purchaseAlreadyOwned"));
        setPendingDigitalProduct(null);
        setCheckoutAttemptKey("");
        return;
      }

      window.location.assign(session.url);
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.toast.purchaseReadyFailed"));
    } finally {
      setPurchaseLoadingId("");
    }
  };

  const handleDownload = async (product, format) => {
    const fileName = format === "pdf" ? product.pdfFileName : product.excelFileName;

    if (!fileName) {
      toast(t("common.toast.fileSoon"));
      return;
    }

    try {
      setDownloadLoadingKey(`${product.id}:${format}`);
      await digitalProductService.downloadProductFile(product.id, format, fileName);
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.toast.downloadFailed"));
    } finally {
      setDownloadLoadingKey("");
    }
  };

  const closeAdminPreview = () => {
    if (adminPreview?.url) {
      window.URL.revokeObjectURL(adminPreview.url);
    }

    setAdminPreview(null);
  };

  const handleAdminPreview = async (product) => {
    if (!product.pdfFileName) {
      toast(t("common.toast.fileSoon"));
      return;
    }

    try {
      setAdminPreviewLoadingId(product.id);
      const url = await adminDigitalProductService.createPdfPreviewUrl(product.id);

      setAdminPreview({
        title: product.title,
        url,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.toast.previewFailed"));
    } finally {
      setAdminPreviewLoadingId("");
    }
  };

  const handleAdminDownload = async (product, format) => {
    const fileName = format === "pdf" ? product.pdfFileName : product.excelFileName;

    if (!fileName) {
      toast(t("common.toast.fileSoon"));
      return;
    }

    try {
      setAdminDownloadLoadingKey(`${product.id}:${format}`);
      await adminDigitalProductService.downloadFile(product.id, format, fileName);
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.toast.downloadFailed"));
    } finally {
      setAdminDownloadLoadingKey("");
    }
  };

  if (isCheckingAuth) {
    return <LoadingSpinner fullScreen label={copy.loading} />;
  }

  return (
    <div className="space-y-10">
      <Seo
        title={copy.seoTitle || copy.heroTitle}
        description={copy.seoDescription || copy.heroSubtitle}
        path="/digital-products"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: copy.heroTitle,
          description: copy.heroSubtitle,
          url: "https://www.stilloak-studio.com/digital-products",
        }}
      />

      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/[0.28] bg-[#071310] p-5 text-white shadow-[0_38px_110px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(31,26,23,0.94),rgba(7,19,16,0.96)_56%,rgba(5,10,9,1))]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 z-0 h-px bg-gradient-to-r from-transparent via-[#e2ca91]/[0.72] to-transparent" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.46fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-[#e2ca91]/[0.42] bg-[#e2ca91]/[0.16] px-3 py-1 text-xs font-bold uppercase text-[#f8e6b1]">
              <Sparkles size={14} />
              {copy.heroBadge}
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/[0.86] sm:text-lg">
              {copy.heroSubtitle}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/[0.78]">
              {copy.heroNote}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {copy.trustItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.16] bg-white/[0.1] px-3 py-2 text-xs font-semibold text-white/[0.86]"
                >
                  <ShieldCheck size={14} className="text-[#9ad7b1]" />
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#product-catalog" className="button-primary gap-2">
                {copy.viewCatalog}
                <ArrowRight size={16} />
              </a>
              {!user && (
                <Link to="/register" state={{ from: "/digital-products" }} className="hero-outline-button gap-2">
                  {copy.registerAndBuy}
                  <UserPlus size={16} />
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.16] bg-white/[0.1] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileSpreadsheet size={17} className="text-[#f2d99a]" />
              {copy.catalogCardTitle}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                [copy.statProducts, publicProducts.length],
                [copy.statFormat, "Excel"],
                [copy.statAccess, copy.afterPurchase],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/[0.16] bg-black/[0.28] p-4">
                  <p className="text-xs font-bold uppercase text-white/[0.68]">{label}</p>
                  <p className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="product-catalog" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">{copy.catalogEyebrow}</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{copy.catalogTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              {copy.catalogText}
            </p>
          </div>
          <div className="soft-pill rounded-lg px-4 py-3 text-sm font-semibold text-muted">
            {user
              ? isLoadingPurchases
                ? copy.checkingPurchases
                : t("digitalProductsPage.purchasedCount", { count: purchasedProductIds.length, total: publicProducts.length })
              : copy.guestCatalogCta}
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.16] bg-[#071310] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.22)] sm:p-5">
          <DigitalProductAccessGrid
            products={publicProducts}
            user={user}
            purchasedProductIds={purchasedProductIds}
            onPurchase={handlePurchase}
            onDownload={handleDownload}
            onAdminPreview={handleAdminPreview}
            onAdminDownload={handleAdminDownload}
            purchaseLoadingId={purchaseLoadingId}
            downloadLoadingKey={downloadLoadingKey}
            adminPreviewLoadingId={adminPreviewLoadingId}
            adminDownloadLoadingKey={adminDownloadLoadingKey}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.valueProps.map((item) => (
          <article
            key={item.title}
            className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5 shadow-[0_18px_50px_rgba(31,26,23,0.08)]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e2ca91]/[0.38] bg-[#e2ca91]/[0.16] text-[#8a6d2d]">
              <CheckCircle2 size={18} />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold leading-tight">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-6 shadow-[0_20px_70px_rgba(31,26,23,0.08)] sm:p-8">
        <div className="max-w-3xl">
          <span className="eyebrow">{copy.whyEyebrow}</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{copy.whyTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {copy.whyText}
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {copy.whyCards.map((item) => (
            <div key={item.title} className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface-soft))] p-5">
              <p className="font-display text-xl font-bold">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-6 shadow-[0_20px_70px_rgba(31,26,23,0.08)] sm:p-8">
        <div className="max-w-3xl">
          <span className="eyebrow">{copy.faqEyebrow}</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{copy.faqTitle}</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.faqItems.map((item) => (
            <article key={item.question} className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface-soft))] p-5">
              <h3 className="font-display text-xl font-bold leading-tight">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/[0.34] bg-[#071310] p-6 text-white shadow-[0_28px_82px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(226,202,145,0.14),transparent_34%),linear-gradient(135deg,rgba(16,38,31,0.92),rgba(7,19,16,0.98))]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-lg border border-[#e2ca91]/[0.42] bg-[#e2ca91]/[0.16] px-3 py-1 text-xs font-bold uppercase text-[#f8e6b1]">
              {copy.ctaEyebrow}
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              {copy.ctaTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/[0.84] sm:text-base">
              {copy.ctaText}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/pricing" className="button-primary shrink-0 gap-2">
              {t("common.buttons.unlockMembership")}
              <UserPlus size={16} />
            </Link>
            <Link to="/pricing" className="hero-outline-button shrink-0 gap-2">
              {t("common.buttons.viewPlans")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {adminPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/[0.18] bg-[#071310] text-white shadow-[0_32px_110px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.16] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f2d99a]">{copy.adminPreview}</p>
                <h3 className="mt-1 font-display text-xl font-bold">{adminPreview.title}</h3>
              </div>
              <button
                type="button"
                onClick={closeAdminPreview}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.16] bg-white/[0.1] text-white/[0.86] transition hover:bg-white/[0.16] hover:text-white"
                aria-label={copy.closePdfPreview}
              >
                <X size={18} />
              </button>
            </div>
            <iframe title={`${adminPreview.title} PDF`} src={adminPreview.url} className="h-[75vh] w-full bg-white" />
          </div>
        </div>
      )}
      {pendingDigitalProduct ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="digital-consent-title"
            className="w-full max-w-2xl rounded-lg border border-white/[0.18] bg-[#071310] p-5 text-white shadow-[0_32px_110px_rgba(0,0,0,0.45)] sm:p-6"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f2d99a]">Skaitmeninio turinio sutikimas</p>
            <h2 id="digital-consent-title" className="mt-3 font-display text-3xl font-bold">
              {pendingDigitalProduct.title}
            </h2>
            <div className="mt-5 grid gap-3 text-sm leading-6 text-white/[0.78]">
              <p>
                Kaina: <strong className="text-[#f8e6b1]">{pendingDigitalProduct.priceLabel}</strong>
              </p>
              <p>
                Formatas: <strong className="text-white">{(pendingDigitalProduct.formats || ["XLSX"]).join(" + ")}</strong>.
                Pagrindinės savybės: {pendingDigitalProduct.description}
              </p>
              <p>
                Prieš mokėjimą perskaityk{" "}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#f8e6b1]">
                  Naudojimo sąlygas
                </Link>
                ,{" "}
                <Link to="/digital-content-terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#f8e6b1]">
                  Skaitmeninio turinio sąlygas
                </Link>{" "}
                ir{" "}
                <Link to="/refund-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#f8e6b1]">
                  grąžinimo tvarką
                </Link>
                .
              </p>
            </div>
            <label className="mt-5 flex items-start gap-3 rounded-lg border border-white/[0.16] bg-white/[0.08] p-4 text-sm leading-6 text-white/[0.82]">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 rounded border-white/[0.24] accent-[#e2ca91] focus:outline-none focus:ring-2 focus:ring-[#e2ca91]"
                checked={acceptedImmediateAccess}
                onChange={(event) => setAcceptedImmediateAccess(event.target.checked)}
              />
              <span>
                Aiškiai sutinku, kad skaitmeninis turinys būtų pradėtas teikti iškart po sėkmingo mokėjimo, ir suprantu,
                kad pradėjus teikimą galiu prarasti teisę atsisakyti nuotolinės sutarties, kiek tai leidžia taikoma teisė.
              </span>
            </label>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setPendingDigitalProduct(null); setCheckoutAttemptKey(""); }} className="hero-outline-button">
                Grįžti
              </button>
              <button
                type="button"
                onClick={handleConfirmDigitalPurchase}
                disabled={!acceptedImmediateAccess || purchaseLoadingId === pendingDigitalProduct.id}
                className="button-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {purchaseLoadingId === pendingDigitalProduct.id
                  ? "Ruošiamas checkout..."
                  : `Pirkti ir mokėti ${pendingDigitalProduct.priceLabel}`}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default DigitalProductsPage;
