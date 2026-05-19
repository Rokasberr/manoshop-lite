import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const copy = t("footer");
  const footerColumns = [
    {
      title: copy.columns.house,
      items: [
        { label: copy.links.memberAreas, to: "/pricing#funkcijos" },
        { label: copy.links.membership, to: "/pricing" },
        { label: copy.links.journal, to: "/journal" },
        { label: copy.links.collection, to: "/shop" },
      ],
    },
    {
      title: copy.columns.services,
      items: [
        { label: copy.links.secureCheckout, to: "/secure-checkout" },
        { label: copy.links.receiptArchive, to: "/receipt-archive" },
        { label: copy.links.memberPricing, to: "/member-pricing" },
        { label: copy.links.privateSupport, to: "/private-support" },
      ],
    },
    {
      title: copy.columns.clientCare,
      items: [
        { label: copy.links.shipping, to: "/shipping" },
        { label: copy.links.returns, to: "/returns" },
        { label: copy.links.privacy, to: "/privacy" },
        { label: copy.links.terms, to: "/terms" },
      ],
    },
  ];

  return (
    <footer className="surface-dark mx-4 mb-6 mt-8 max-w-7xl px-5 py-8 sm:mx-6 sm:px-8 lg:mx-auto lg:px-10">
      <div className="border-b border-white/10 pb-8">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: "rgb(var(--accent-strong))" }}>
              {copy.ctaEyebrow}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">{copy.ctaTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/66">
              {copy.ctaText}
            </p>
          </div>
          <Link to="/pricing" className="button-primary">
            {copy.ctaButton}
          </Link>
        </div>
      </div>

      <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.85fr_0.85fr_0.85fr_1.1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg shadow-[0_12px_28px_rgba(26,79,64,0.18)]">
              <img
                src="/favicon.svg"
                alt="Stilloak Studio"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-display text-xl font-bold">Stilloak Studio</p>
              <p className="text-xs uppercase text-white/36">{copy.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-7 text-white/62">
            {copy.summary}
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="font-semibold text-white">{column.title}</p>
            <div className="mt-4 space-y-3 text-sm text-white/58">
              {column.items.map((item) =>
                item.to ? (
                  <Link key={item.label} to={item.to} className="block transition hover:text-white">
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} className="block transition hover:text-white">
                    {item.label}
                  </a>
                )
              )}
            </div>
          </div>
        ))}

        <div>
          <Link to="/contact" className="font-semibold text-white transition hover:text-white/80">
            {copy.columns.contact}
          </Link>
          <div className="mt-4 space-y-3 text-sm text-white/58">
            <a href="mailto:hello@stilloak-studio.com" className="block transition hover:text-white">
              hello@stilloak-studio.com
            </a>
            <p>+370 600 12345</p>
            <p>{copy.links.location}</p>
            <p>{copy.links.hours}</p>
          </div>
          <Link to="/contact" className="mt-5 inline-flex text-sm font-medium accent-text transition hover:opacity-80">
            {copy.links.visitContact}
          </Link>
        </div>
      </div>

      <div className="mt-9 border-t border-white/8 pt-5 text-sm text-white/44">
        © 2026 Stilloak Studio. {copy.links.rights}
      </div>
    </footer>
  );
};

export default Footer;
