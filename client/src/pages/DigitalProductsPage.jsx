import { ArrowRight, ShoppingBag, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import DigitalProductAccessGrid from "../components/DigitalProductAccessGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import { digitalProducts } from "../constants/digitalProducts";
import { useAuth } from "../context/AuthContext";
import adminDigitalProductService from "../services/adminDigitalProductService";
import digitalProductService from "../services/digitalProductService";

const DigitalProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isCheckingAuth } = useAuth();
  const publicProducts = useMemo(() => digitalProducts.filter((product) => product.isPublic), []);
  const [purchasedProductIds, setPurchasedProductIds] = useState([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);
  const [purchaseLoadingId, setPurchaseLoadingId] = useState("");
  const [downloadLoadingKey, setDownloadLoadingKey] = useState("");
  const [adminPreview, setAdminPreview] = useState(null);
  const [adminPreviewLoadingId, setAdminPreviewLoadingId] = useState("");
  const [adminDownloadLoadingKey, setAdminDownloadLoadingKey] = useState("");

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
          toast.error("Nepavyko atnaujinti įsigytų produktų.");
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

    if (purchaseState === "success") {
      toast.success("Apmokėjimas priimtas. Atsisiuntimai pasirodys, kai pirkimas bus patvirtintas.");
      setSearchParams({}, { replace: true });
    }

    if (purchaseState === "cancel") {
      toast("Pirkimas atšauktas. Produktą galite įsigyti vėliau.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
      setPurchaseLoadingId(product.id);
      const session = await digitalProductService.createCheckoutSession(product.id);

      if (session.alreadyPurchased) {
        setPurchasedProductIds((currentIds) =>
          currentIds.includes(product.id) ? currentIds : [...currentIds, product.id]
        );
        toast.success("Šis produktas jau įsigytas.");
        return;
      }

      window.location.assign(session.url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko paruošti produkto pirkimo.");
    } finally {
      setPurchaseLoadingId("");
    }
  };

  const handleDownload = async (product, format) => {
    const fileName = format === "pdf" ? product.pdfFileName : product.excelFileName;

    if (!fileName) {
      toast("Failas netrukus bus pasiekiamas.");
      return;
    }

    try {
      setDownloadLoadingKey(`${product.id}:${format}`);
      await digitalProductService.downloadProductFile(product.id, format, fileName);
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko atsisiųsti failo.");
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
      toast("Failas netrukus bus pasiekiamas.");
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
      toast.error(error.response?.data?.message || "Nepavyko atidaryti PDF peržiūros.");
    } finally {
      setAdminPreviewLoadingId("");
    }
  };

  const handleAdminDownload = async (product, format) => {
    const fileName = format === "pdf" ? product.pdfFileName : product.excelFileName;

    if (!fileName) {
      toast("Failas netrukus bus pasiekiamas.");
      return;
    }

    try {
      setAdminDownloadLoadingKey(`${product.id}:${format}`);
      await adminDigitalProductService.downloadFile(product.id, format, fileName);
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko atsisiųsti failo.");
    } finally {
      setAdminDownloadLoadingKey("");
    }
  };

  if (isCheckingAuth) {
    return <LoadingSpinner fullScreen label="Krauname skaitmeninius produktus..." />;
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/18 bg-[#071310] p-5 text-white shadow-[0_38px_110px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,38,31,0.9),rgba(7,19,16,0.97)_58%,rgba(5,10,9,1))]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e2ca91]/60 to-transparent" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.46fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              Skaitmeniniai produktai
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
              Skaitmeniniai produktai
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Premium PDF gidai, Excel modeliai ir praktinės sistemos finansams, planavimui, verslui ir augimui.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
              Produktus galite peržiūrėti viešai. Norint įsigyti ir atsisiųsti failus, reikia prisijungti arba susikurti paskyrą.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#product-catalog" className="button-primary gap-2">
                Peržiūrėti katalogą
                <ArrowRight size={16} />
              </a>
              {!user && (
                <Link to="/register" state={{ from: "/digital-products" }} className="hero-outline-button gap-2">
                  Prisiregistruoti ir įsigyti
                  <UserPlus size={16} />
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
            <p className="text-sm font-semibold text-white">Katalogo būsena</p>
            <div className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                ["Produktai", publicProducts.length],
                ["Įsigyta", user ? purchasedProductIds.length : 0],
                ["Formatas", "PDF + Excel"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-xs font-bold uppercase text-white/44">{label}</p>
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
            <span className="eyebrow">Produktų katalogas</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Skaitmeniniai produktai</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Peržiūrėkite produktų aprašymus, kainas, formatus ir įtrauktas dalis. Atsisiuntimai atsiranda tik įsigijus pasirinktą produktą.
            </p>
          </div>
          <div className="soft-pill rounded-lg px-4 py-3 text-sm font-semibold text-muted">
            {user
              ? isLoadingPurchases
                ? "Tikriname pirkinius..."
                : `${purchasedProductIds.length} iš ${publicProducts.length} įsigyta`
              : "Prisiregistruokite, kad galėtumėte įsigyti"}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#071310] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.22)] sm:p-5">
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

      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/24 bg-[#071310] p-6 text-white shadow-[0_28px_82px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(226,202,145,0.14),transparent_34%),linear-gradient(135deg,rgba(16,38,31,0.92),rgba(7,19,16,0.98))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              Saugi produkto prieiga
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Įsigykite tik tai, ko reikia.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              Skaitmeniniai produktai yra atskiri PDF gidai ir Excel modeliai. Demo versija skirta Saving Studio pradžiai, o produktų failai atsiveria tik po individualaus įsigijimo.
            </p>
          </div>
          {user ? (
            <a href="#product-catalog" className="button-primary shrink-0 gap-2">
              Grįžti į katalogą
              <ShoppingBag size={16} />
            </a>
          ) : (
            <Link to="/register" state={{ from: "/digital-products" }} className="button-primary shrink-0 gap-2">
              Sukurti paskyrą
              <UserPlus size={16} />
            </Link>
          )}
        </div>
      </section>

      {adminPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/12 bg-[#071310] text-white shadow-[0_32px_110px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f2d99a]">Admin PDF peržiūra</p>
                <h3 className="mt-1 font-display text-xl font-bold">{adminPreview.title}</h3>
              </div>
              <button
                type="button"
                onClick={closeAdminPreview}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white/74 transition hover:bg-white/12 hover:text-white"
                aria-label="Uždaryti PDF peržiūrą"
              >
                <X size={18} />
              </button>
            </div>
            <iframe title={`${adminPreview.title} PDF`} src={adminPreview.url} className="h-[75vh] w-full bg-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalProductsPage;
