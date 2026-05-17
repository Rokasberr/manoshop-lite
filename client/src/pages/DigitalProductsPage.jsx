import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  FileSpreadsheet,
  FileText,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { digitalProducts } from "../constants/digitalProducts";

const formatIcons = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
};

const getDownloadName = (url) => url.split("/").pop();

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

const ProductCard = ({ product }) => (
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
        <p className="text-xs font-bold uppercase text-white/48">What's included</p>
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

      <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
        <DownloadButton href={product.pdfDownloadUrl}>Download PDF</DownloadButton>
        <DownloadButton href={product.excelDownloadUrl} variant="secondary">
          Download Excel
        </DownloadButton>
      </div>
    </div>
  </article>
);

const DigitalProductsPage = () => {
  const publicProducts = digitalProducts.filter((product) => product.isPublic);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/18 bg-[#071310] p-5 text-white shadow-[0_38px_110px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,38,31,0.9),rgba(7,19,16,0.97)_58%,rgba(5,10,9,1))]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e2ca91]/60 to-transparent" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.46fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              Public digital products
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
              Premium guides and working templates for clearer decisions.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Download polished StillOak Studio systems for money, planning, business validation, and content. Every product includes a PDF guide and a practical Excel template.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#download-library" className="button-primary gap-2">
                Browse downloads
                <ArrowRight size={16} />
              </a>
              <Link to="/pricing" className="hero-outline-button gap-2">
                Unlock membership
                <Sparkles size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
            <p className="text-sm font-semibold text-white">Included today</p>
            <div className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                ["Products", publicProducts.length],
                ["Formats", "PDF"],
                ["Templates", "XLSX"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-xs font-bold uppercase text-white/44">{label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="download-library" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Download library</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Digital Products</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Public resources designed to feel clear, useful, and ready to put to work immediately.
            </p>
          </div>
          <div className="soft-pill rounded-lg px-4 py-3 text-sm font-semibold text-muted">
            No login required
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#071310] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.22)] sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/24 bg-[#071310] p-6 text-white shadow-[0_28px_82px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(226,202,145,0.14),transparent_34%),linear-gradient(135deg,rgba(16,38,31,0.92),rgba(7,19,16,0.98))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              StillOak Studio membership
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Want more premium tools, guides, and templates?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              Unlock the StillOak Studio membership area to access deeper resources, private tools, structured guides, and premium digital systems.
            </p>
          </div>
          <Link to="/pricing" className="button-primary shrink-0 gap-2">
            Unlock membership
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DigitalProductsPage;
