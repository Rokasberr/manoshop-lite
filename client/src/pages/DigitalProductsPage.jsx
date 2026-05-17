import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  FileSpreadsheet,
  FileText,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import { digitalProducts } from "../constants/digitalProducts";
import { useAuth } from "../context/AuthContext";
import { hasActiveMembership, isAdminUser, normalizePlan } from "../utils/membership";

const downloadablePlans = ["basic", "personal", "private_business"];

const formatIcons = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
};

const getDownloadName = (url) => url.split("/").pop();

const canDownloadDigitalProducts = (user) =>
  isAdminUser(user) ||
  (hasActiveMembership(user) && downloadablePlans.includes(normalizePlan(user?.subscription?.plan)));

const FormatBadge = ({ format }) => {
  const Icon = formatIcons[format] || FileText;

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-[#d6c38b]/35 bg-[#f2d99a]/14 px-3 py-1 text-xs font-bold text-[#f8e6b1]">
      <Icon size={14} />
      {format}
    </span>
  );
};

const DownloadButton = ({ href, children, variant = "primary" }) => {
  const className =
    variant === "primary"
      ? "button-primary min-h-[3rem] gap-2 px-4"
      : "inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.075] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#e2ca91]/35 hover:bg-[#e2ca91]/12";

  return (
    <a href={href} download={getDownloadName(href)} className={className}>
      <ArrowDownToLine size={16} />
      {children}
    </a>
  );
};

const LockedDownloads = ({ isLoggedIn }) => (
  <div className="mt-auto rounded-lg border border-white/10 bg-black/24 p-4">
    <p className="flex gap-2 text-sm font-semibold leading-6 text-white">
      <LockKeyhole className="mt-0.5 shrink-0 text-[#f2d99a]" size={16} />
      Prisijunkite arba susikurkite paskyrą, kad galėtumėte atsisiųsti failus
    </p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <Link to="/login" className="button-primary min-h-[3rem] px-4">
        Prisijunkite, kad atsisiųstumėte
      </Link>
      <Link to="/register" state={{ selectedPlan: "basic" }} className="hero-outline-button min-h-[3rem] px-4">
        Susikurti paskyrą
      </Link>
    </div>
    {isLoggedIn && (
      <Link to="/pricing" className="mt-3 inline-flex text-sm font-semibold text-[#f2d99a]">
        Pasirinkti Demo versiją
      </Link>
    )}
  </div>
);

const ProductCard = ({ product, canDownload, isLoggedIn }) => (
  <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-[0_26px_72px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:border-[#e2ca91]/28">
    <div className="h-1 bg-gradient-to-r from-[#e2ca91] via-[#75b896] to-transparent" />
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="rounded-lg border border-[#e2ca91]/26 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
          {product.category}
        </span>
        <div className="flex flex-wrap gap-2">
          {product.formats.map((format) => (
            <FormatBadge key={format} format={format} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-display text-2xl font-bold leading-tight text-white">{product.title}</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#f2d99a]/82">{product.subtitle}</p>
        <p className="mt-4 text-sm leading-7 text-white/68">{product.description}</p>
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-black/18 p-4">
        <p className="text-xs font-bold uppercase text-white/48">Kas įtraukta</p>
        <ul className="mt-4 space-y-3">
          {product.includedItems.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-white/72">
              <BadgeCheck className="mt-0.5 shrink-0 text-[#9ad7b1]" size={17} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-sm leading-6 text-white/58">{product.premiumCtaText}</p>

      <div className="mt-auto pt-6">
        {canDownload ? (
          <>
            <span className="mb-3 inline-flex rounded-lg border border-[#9ad7b1]/30 bg-[#9ad7b1]/10 px-3 py-1 text-xs font-bold text-[#bff0cf]">
              Įtraukta į jūsų planą
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <DownloadButton href={product.pdfDownloadUrl}>Atsisiųsti PDF</DownloadButton>
              <DownloadButton href={product.excelDownloadUrl} variant="secondary">
                Atsisiųsti Excel
              </DownloadButton>
            </div>
          </>
        ) : (
          <LockedDownloads isLoggedIn={isLoggedIn} />
        )}
      </div>
    </div>
  </article>
);

const DigitalProductsPage = () => {
  const { user, isCheckingAuth } = useAuth();
  const publicProducts = digitalProducts.filter((product) => product.isPublic);
  const canDownload = canDownloadDigitalProducts(user);

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
              Premium PDF gidai ir Excel šablonai aiškesniems sprendimams.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Peržiūrėkite StillOak Studio sistemas finansams, planavimui, verslo idėjoms ir turiniui. Atsisiuntimai prieinami prisijungus ir pasirinkus Demo versiją arba aukštesnį planą.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#download-library" className="button-primary gap-2">
                Peržiūrėti produktus
                <ArrowRight size={16} />
              </a>
              <Link to={user ? "/pricing" : "/register"} state={!user ? { selectedPlan: "basic" } : undefined} className="hero-outline-button gap-2">
                Pasirinkti Demo versiją
                <Sparkles size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
            <p className="text-sm font-semibold text-white">Prieiga</p>
            <div className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                ["Produktai", publicProducts.length],
                ["PDF", canDownload ? "Atviri" : "Užrakinta"],
                ["Excel", canDownload ? "Atviri" : "Užrakinta"],
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

      <section id="download-library" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Produktų biblioteka</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Digital Products</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Svečiai gali peržiūrėti produktus. Failų atsisiuntimui reikia paskyros ir aktyvios Demo versijos, Asmeninio arba Privataus verslo plano.
            </p>
          </div>
          <div className="soft-pill rounded-lg px-4 py-3 text-sm font-semibold text-muted">
            {canDownload ? "Atsisiuntimai įjungti" : "Prisijunkite atsisiuntimui"}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#071310] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.22)] sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicProducts.map((product) => (
              <ProductCard key={product.id} product={product} canDownload={canDownload} isLoggedIn={Boolean(user)} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/24 bg-[#071310] p-6 text-white shadow-[0_28px_82px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(226,202,145,0.14),transparent_34%),linear-gradient(135deg,rgba(16,38,31,0.92),rgba(7,19,16,0.98))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              StillOak Studio narystė
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Norite daugiau premium įrankių?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              Demo versija suteikia prieigą prie atrinktų PDF ir Excel failų. Atrakinkite Asmeninį planą, jei norite daugiau struktūruotų gidų, šablonų ir premium nario zonos galimybių.
            </p>
          </div>
          <Link to="/pricing" className="button-primary shrink-0 gap-2">
            Atrakinti Asmeninį planą
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DigitalProductsPage;
