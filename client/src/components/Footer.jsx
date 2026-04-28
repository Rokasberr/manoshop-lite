import { Link } from "react-router-dom";
import { clientCareLinks, houseLinks, serviceLinks } from "../content/infoPages";

const footerColumns = [
  {
    title: "House",
    items: houseLinks,
  },
  {
    title: "Services",
    items: serviceLinks,
  },
  {
    title: "Client care",
    items: clientCareLinks,
  },
];

const Footer = () => (
  <footer className="surface-dark mt-10 rounded-[38px] px-6 py-8 sm:px-8 lg:px-10">
    <div className="rounded-[30px] bg-white/6 px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
            Enter the house
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold">Ready for a calmer, more premium storefront?</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/66">
            Collection, membership, checkout and account history dabar jau kalba viena ramesne, labiau prabangia kalba.
          </p>
        </div>
        <Link to="/shop" className="button-primary">
          Explore pieces
        </Link>
      </div>
    </div>

    <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.1fr]">
      <div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
            }}
          >
            SS
          </div>
          <div>
            <p className="font-display text-xl font-bold">Stilloak Studio</p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/36">curated living</p>
          </div>
        </div>
        <p className="mt-5 max-w-xs text-sm leading-7 text-white/62">
          Savings Studio padeda aiškiau valdyti išlaidas, sekti biudžetus ir ramiau judėti link taupymo tikslų vienoje apgalvotoje nario erdvėje.
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
          Contact
        </Link>
        <div className="mt-4 space-y-3 text-sm text-white/58">
          <a href="mailto:hello@stilloakstudio.com" className="block transition hover:text-white">
            hello@stilloakstudio.com
          </a>
          <p>+370 600 12345</p>
          <p>Vilnius, Lithuania</p>
          <p>Mon - Fri 9:00 - 18:00</p>
        </div>
        <Link to="/contact" className="mt-5 inline-flex text-sm font-medium accent-text transition hover:opacity-80">
          Visit contact page
        </Link>
      </div>
    </div>

    <div className="mt-10 border-t border-white/8 pt-5 text-sm text-white/44">
      © 2026 Stilloak Studio. All rights reserved.
    </div>
  </footer>
);

export default Footer;
