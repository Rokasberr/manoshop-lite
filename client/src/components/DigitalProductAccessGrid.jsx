import {
  ArrowDownToLine,
  BadgeCheck,
  FileSpreadsheet,
  FileText,
  LockKeyhole,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { digitalProducts } from "../constants/digitalProducts";
import { hasActiveMembership, isAdminUser, normalizePlan, planDisplayNames } from "../utils/membership";

const planRank = {
  free: 0,
  basic: 1,
  personal: 2,
  private_business: 3,
};

const filterOptions = ["Visi", "Finansai", "Planavimas", "Verslas", "Marketingas"];

const accessLabels = {
  basic: "Demo",
  personal: "Asmeninis",
  private_business: "Verslas",
};

const formatIcons = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
};

const getDownloadName = (url) => url?.split("/").pop() || "";
const getRequiredPlan = (product) => normalizePlan(product.accessPlan || product.requiredPlan || "basic");

export const canAccessDigitalProduct = (user, product) => {
  if (isAdminUser(user)) {
    return true;
  }

  if (!hasActiveMembership(user)) {
    return false;
  }

  const currentPlan = normalizePlan(user?.subscription?.plan || "free");
  return (planRank[currentPlan] || 0) >= (planRank[getRequiredPlan(product)] || 0);
};

const FormatBadge = ({ format }) => {
  const Icon = formatIcons[format] || FileText;
  const label = format === "XLSX" ? "Excel" : format;

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-[#d6c38b]/35 bg-[#f2d99a]/14 px-3 py-1 text-xs font-bold text-[#f8e6b1]">
      <Icon size={14} />
      {label}
    </span>
  );
};

const AccessBadge = ({ plan }) => (
  <span className="inline-flex items-center rounded-lg border border-[#9ad7b1]/25 bg-[#9ad7b1]/10 px-3 py-1 text-xs font-bold uppercase text-[#bff0cf]">
    {accessLabels[plan] || planDisplayNames[plan] || "Narystė"}
  </span>
);

const FeatureBadge = ({ children }) => (
  <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.075] px-3 py-1 text-xs font-bold text-white/78">
    {children}
  </span>
);

const ProductDetail = ({ label, value }) => (
  <div className="rounded-lg border border-white/10 bg-black/16 px-3 py-2.5">
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/38">{label}</p>
    <p className="mt-1 text-sm font-semibold leading-5 text-white/78">{value}</p>
  </div>
);

const DownloadButton = ({ href, children, variant = "primary" }) => {
  if (!href) {
    return (
      <span className="inline-flex min-h-[3rem] items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-center text-sm font-semibold leading-5 text-white/48">
        Failas netrukus bus pasiekiamas
      </span>
    );
  }

  const className =
    variant === "primary"
      ? "button-primary min-h-[3rem] justify-center gap-2 px-4"
      : "inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.075] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#e2ca91]/35 hover:bg-[#e2ca91]/12";

  return (
    <a href={href} download={getDownloadName(href)} className={className}>
      <ArrowDownToLine size={16} />
      {children}
    </a>
  );
};

const LockedDownloads = ({ isLoggedIn }) => (
  <div className="rounded-lg border border-white/10 bg-black/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
    <p className="flex gap-2 text-sm font-semibold leading-6 text-white">
      <LockKeyhole className="mt-0.5 shrink-0 text-[#f2d99a]" size={16} />
      Atrakinkite šį produktą
    </p>
    <p className="mt-2 text-sm leading-6 text-white/62">
      Šis produktas prieinamas aukštesnio plano nariams. Pasirinkite planą, kuris geriausiai atitinka jūsų tikslus.
    </p>
    <div className="mt-4">
      <Link
        to={isLoggedIn ? "/pricing" : "/register"}
        state={!isLoggedIn ? { selectedPlan: "basic" } : undefined}
        className="button-primary min-h-[3rem] w-full justify-center px-4"
      >
        Peržiūrėti planus
      </Link>
    </div>
  </div>
);

const DigitalProductCard = ({ product, user }) => {
  const canDownload = canAccessDigitalProduct(user, product);
  const requiredPlan = getRequiredPlan(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-[0_26px_72px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:border-[#e2ca91]/28 md:min-h-[620px]">
      <div className="h-1 bg-gradient-to-r from-[#e2ca91] via-[#75b896] to-transparent" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg border border-[#e2ca91]/26 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              {product.category}
            </span>
            <AccessBadge plan={requiredPlan} />
          </div>
          <div className="flex flex-wrap gap-2">
            {product.formats.map((format) => (
              <FormatBadge key={format} format={format} />
            ))}
            {product.excelFeatures?.map((feature) => (
              <FeatureBadge key={feature}>{feature}</FeatureBadge>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-2xl font-bold leading-tight text-white">{product.title}</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#f2d99a]/82">{product.subtitle}</p>
          <p className="mt-4 text-sm leading-7 text-white/68">{product.description}</p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <ProductDetail label="Versija" value={product.version || "1.0"} />
          <ProductDetail label="Formatai" value="PDF + XLSX" />
          <ProductDetail label="Excel" value="Su formulėmis" />
          <ProductDetail label="Atnaujinta" value={product.lastUpdated || "2026"} />
          <ProductDetail label="Prieiga" value={accessLabels[requiredPlan] || planDisplayNames[requiredPlan] || "Narystė"} />
          <ProductDetail label="Trukmė" value={product.estimatedUseTime || "20-40 min."} />
          <ProductDetail label="Lygis" value={product.difficultyLevel || "Lengvas"} />
          <ProductDetail label="Failai" value={product.fileNotes || "PDF gidas ir Excel modelis paruošti naudojimui."} />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/18 p-4">
            <p className="text-xs font-bold uppercase text-white/48">Excel funkcijos</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(product.dashboardMetrics || product.excelFeatures || []).slice(0, 5).map((item) => (
                <span key={item} className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/18 p-4">
            <p className="text-xs font-bold uppercase text-white/48">PDF gidas</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(product.pdfFeatures || []).slice(0, 4).map((item) => (
                <span key={item} className="rounded-lg border border-[#e2ca91]/20 bg-[#e2ca91]/10 px-3 py-1 text-xs font-semibold text-[#f2d99a]">
                  {item}
                </span>
              ))}
            </div>
          </div>
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

        <div className="mt-4 rounded-lg border border-white/10 bg-black/18 p-4">
          <p className="text-xs font-bold uppercase text-white/48">Kaip naudoti</p>
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
            <>
              <p className="mb-3 text-xs font-bold uppercase text-white/42">
                Reikia plano: {planDisplayNames[requiredPlan] || "narystė"}
              </p>
              <LockedDownloads isLoggedIn={Boolean(user)} />
            </>
          )}
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
        ? "Netrukus šioje vietoje matysite savo skaitmeninius produktus, šablonus ir nario įrankius."
        : "Šioje kategorijoje produktų dar nėra. Pasirinkite kitą filtrą arba grįžkite į visą biblioteką."}
    </p>
  </div>
);

const DigitalProductAccessGrid = ({ products = digitalProducts, user }) => {
  const [activeFilter, setActiveFilter] = useState("Visi");
  const filteredProducts = useMemo(
    () => (activeFilter === "Visi" ? products : products.filter((product) => product.category === activeFilter)),
    [activeFilter, products]
  );

  if (!products.length) {
    return <FilteredEmptyState activeFilter="Visi" />;
  }

  return (
    <div className="space-y-5">
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <DigitalProductCard key={product.id} product={product} user={user} />
          ))}
        </div>
      ) : (
        <FilteredEmptyState activeFilter={activeFilter} />
      )}
    </div>
  );
};

export default DigitalProductAccessGrid;
