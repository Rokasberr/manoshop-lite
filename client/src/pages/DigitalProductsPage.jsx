import { ArrowRight, CheckCircle2, FileSpreadsheet, ShieldCheck, Sparkles, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import DigitalProductAccessGrid from "../components/DigitalProductAccessGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import { digitalProducts } from "../constants/digitalProducts";
import { useAuth } from "../context/AuthContext";
import adminDigitalProductService from "../services/adminDigitalProductService";
import digitalProductService from "../services/digitalProductService";

const trustItems = ["Saugus pirkimas", "Atsisiuntimas po apmokėjimo", "Paruošta naudoti"];

const valueProps = [
  {
    title: "Aiški struktūra",
    text: "Kiekvienas modelis turi paruoštus lapus, pavyzdinius duomenis ir aiškų darbo ritmą.",
  },
  {
    title: "Lengva pradėti",
    text: "Atsidarote failą, pakeičiate pavyzdinius skaičius savo duomenimis ir iškart matote rezultatus.",
  },
  {
    title: "Premium dizainas",
    text: "Šablonai sukurti taip, kad būtų malonu naudoti kasdien ir patogu pristatyti sau aiškią apžvalgą.",
  },
  {
    title: "Praktiški įrankiai",
    text: "Finansų, taupymo ir savaitės planavimo sistemos orientuotos į realius sprendimus, ne triukšmą.",
  },
];

const faqItems = [
  {
    question: "Ar failą gausiu iškart po apmokėjimo?",
    answer:
      "Po sėkmingo apmokėjimo produktas priskiriamas jūsų paskyrai. Prisijungę matysite atsisiuntimo mygtuką prie įsigyto produkto.",
  },
  {
    question: "Ar reikia Excel programos?",
    answer:
      "Rekomenduojame naudoti Microsoft Excel. Failai yra .xlsx formato ir neturi makrokomandų ar išorinių duomenų jungčių.",
  },
  {
    question: "Ar tai vienkartinis pirkimas?",
    answer:
      "Taip. Skaitmeniniai produktai perkami atskirai nuo narystės, o atsisiuntimas aktyvuojamas konkrečiam įsigytam produktui.",
  },
  {
    question: "Ar galiu naudoti asmeniškai?",
    answer:
      "Taip. Produktai skirti asmeniniam naudojimui: finansams, taupymo tikslams, savaitei ir kasdieniams planavimo sprendimams tvarkyti.",
  },
];

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
      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/[0.28] bg-[#071310] p-5 text-white shadow-[0_38px_110px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(31,26,23,0.94),rgba(7,19,16,0.96)_56%,rgba(5,10,9,1))]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 z-0 h-px bg-gradient-to-r from-transparent via-[#e2ca91]/[0.72] to-transparent" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.46fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-[#e2ca91]/[0.42] bg-[#e2ca91]/[0.16] px-3 py-1 text-xs font-bold uppercase text-[#f8e6b1]">
              <Sparkles size={14} />
              Premium Excel katalogas
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
              Skaitmeniniai įrankiai finansams, taupymui ir produktyvumui
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/[0.86] sm:text-lg">
              Paruošti naudoti Excel šablonai, kurie padeda aiškiau planuoti pinigus, tikslus ir savaitės darbus.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/[0.78]">
              Produktus galite peržiūrėti viešai. Norint įsigyti ir atsisiųsti failus, reikia prisijungti arba susikurti paskyrą.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {trustItems.map((item) => (
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

          <div className="rounded-lg border border-white/[0.16] bg-white/[0.1] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileSpreadsheet size={17} className="text-[#f2d99a]" />
              Premium katalogas
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                ["Produktai", publicProducts.length],
                ["Formatas", "Excel"],
                ["Prieiga", "Po pirkimo"],
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
            <span className="eyebrow">Produktų katalogas</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Skaitmeniniai produktai</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Trys mokami StillOak Excel produktai su aiškiais aprašymais, peržiūros vaizdais, kainomis ir saugia prieiga po apmokėjimo.
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
        {valueProps.map((item) => (
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
          <span className="eyebrow">Kodėl StillOak</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Kodėl verta naudoti StillOak šablonus?</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Šie produktai sukurti kaip praktiški darbo failai: ne teorijai, o kasdieniam naudojimui, aiškiems sprendimams ir tvarkingam progresui.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ["Vienas aiškus failas", "Kiekvienas produktas turi paruoštą struktūrą, pavyzdinius duomenis ir dashboard vaizdą."],
            ["Be sudėtingo pasiruošimo", "Nereikia kurti formulių nuo nulio. Pradedate nuo paruošto modelio ir pritaikote jį sau."],
            ["Atskirai įsigyjama", "Produktai nėra automatiškai įtraukti į Demo versiją. Perkate tik tai, ko jums reikia."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface-soft))] p-5">
              <p className="font-display text-xl font-bold">{title}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-6 shadow-[0_20px_70px_rgba(31,26,23,0.08)] sm:p-8">
        <div className="max-w-3xl">
          <span className="eyebrow">Klausimai</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Dažniausiai užduodami klausimai</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
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
              Premium resursai
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Nori daugiau premium resursų?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/[0.84] sm:text-base">
              Narystėje rasite daugiau nario įrankių, struktūruotų gidų ir premium planavimo sistemų. Skaitmeniniai produktai lieka atskirai įsigyjami, o narystė padeda dirbti su platesne StillOak Studio erdve.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/pricing" className="button-primary shrink-0 gap-2">
              Atrakinti narystę
              <UserPlus size={16} />
            </Link>
            <Link to="/pricing" className="hero-outline-button shrink-0 gap-2">
              Peržiūrėti planus
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
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f2d99a]">Admin PDF peržiūra</p>
                <h3 className="mt-1 font-display text-xl font-bold">{adminPreview.title}</h3>
              </div>
              <button
                type="button"
                onClick={closeAdminPreview}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.16] bg-white/[0.1] text-white/[0.86] transition hover:bg-white/[0.16] hover:text-white"
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
