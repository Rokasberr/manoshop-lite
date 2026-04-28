import { ArrowRight, Download, LayoutPanelTop, Palette, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import productService from "../services/productService";
import { formatCurrency } from "../utils/currency";

const fallbackProducts = [
  {
    _id: "digital-fallback-1",
    name: "Calm Home Poster Bundle",
    description: "Printable wall art set for bedrooms, living rooms, and slower interiors.",
    price: 24,
    category: "Digital Products",
    images: [],
  },
  {
    _id: "digital-fallback-2",
    name: "The Atelier Living Room Guide",
    description: "A premium PDF guide to palette, layout, texture, and visual calm.",
    price: 29,
    category: "Digital Products",
    images: [],
  },
  {
    _id: "digital-fallback-3",
    name: "Sunday Reset Ritual Planner",
    description: "A gentle weekly planning and reflection tool for calmer routines.",
    price: 16,
    category: "Digital Products",
    images: [],
  },
];

const ritualCards = [
  {
    icon: LayoutPanelTop,
    title: "Download without waiting",
    description: "No shipping, no warehouse, no parcel delays. Payment unlocks the file in your account.",
  },
  {
    icon: Palette,
    title: "Built for your visual world",
    description: "Printable art, interior guides, and planners designed to match the same quiet premium brand.",
  },
  {
    icon: Sparkles,
    title: "High margin, clean offer",
    description: "A digital layer lets you sell instantly and bundle beautifully without physical logistics.",
  },
];

const steps = [
  {
    step: "01",
    title: "Choose",
    description: "Select a printable bundle, PDF guide, or planning tool that fits the mood you want to create.",
  },
  {
    step: "02",
    title: "Pay",
    description: "Complete checkout securely with Stripe just like any other premium product in the store.",
  },
  {
    step: "03",
    title: "Download",
    description: "Your file appears inside your profile after payment, ready to download whenever you need it.",
  },
];

const DigitalLandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDigitalProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await productService.listProducts({
          productType: "digital",
          limit: 6,
          sort: "latest",
        });

        setProducts(data.products || []);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko užkrauti digital kolekcijos.");
      } finally {
        setLoading(false);
      }
    };

    loadDigitalProducts();
  }, []);

  const featuredProducts = products.length ? products.slice(0, 3) : fallbackProducts;
  const leadProduct = featuredProducts[0];

  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">Digital atelier</span>
              <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.92] sm:text-6xl lg:text-7xl">
                Instant digital products for calmer rooms and clearer routines.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Ši kolekcija skirta PDF gidams, printable rinkiniams ir planavimo įrankiams, kurie jaučiasi
                kaip natūrali tavo brand&apos;o tąsa, o ne atsitiktinis priedas prie fizinio shop&apos;o.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/digital/collection" className="button-primary gap-2">
                  Browse digital products
                  <ArrowRight size={16} />
                </Link>
                <Link to="/pricing" className="hero-outline-button">
                  View bundles & membership
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Format</p>
                <p className="mt-3 font-display text-3xl font-bold">PDF</p>
                <p className="mt-2 text-sm text-white/60">Printable guides, planners, and digital bundles.</p>
              </div>
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Access</p>
                <p className="mt-3 font-display text-3xl font-bold">Instant</p>
                <p className="mt-2 text-sm text-white/60">Protected downloads appear in the buyer profile after payment.</p>
              </div>
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Brand fit</p>
                <p className="mt-3 font-display text-3xl font-bold">Curated</p>
                <p className="mt-2 text-sm text-white/60">Designed to feel editorial, warm, and intentionally premium.</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="hero-screen relative w-full max-w-[620px]">
              <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Digital collection</p>
                  <p className="text-xs text-white/50">Printable art, guides, planners</p>
                </div>
                <span className="hero-chip">Instant download</span>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Lead product</p>
                  <h3 className="mt-4 font-display text-3xl font-bold">{leadProduct.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{leadProduct.description}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <p className="text-xs text-white/45">Delivery</p>
                      <p className="mt-2 font-display text-2xl font-bold">Account download</p>
                    </div>
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <p className="text-xs text-white/45">From</p>
                      <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(leadProduct.price)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">What buyers get</p>
                    <div className="mt-4 space-y-3">
                      {[
                        "Protected download access",
                        "Receipt and order archive",
                        "No physical shipping needed",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm text-white/74">
                          <Download size={16} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Collection mood</p>
                    <div className="mt-4 grid gap-3">
                      {featuredProducts.slice(1, 3).map((product, index) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between rounded-[18px] bg-white/4 px-4 py-3 text-sm"
                        >
                          <span>{product.name}</span>
                          <span className="text-white/45">0{index + 2}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute -right-3 top-10 hidden h-28 w-28 rounded-full blur-3xl lg:block"
              style={{ backgroundColor: "rgb(var(--accent) / 0.18)" }}
            />
          </div>
        </div>
      </section>

      <section className="public-section grid gap-4 sm:grid-cols-3">
        {ritualCards.map((card) => (
          <div key={card.title} className="marketing-mini-card">
            <card.icon size={22} style={{ color: "rgb(var(--accent))" }} />
            <h2 className="mt-5 font-display text-2xl font-bold">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
          </div>
        ))}
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">Featured downloads</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Start with a small digital collection.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Čia yra pirmi skaitmeniniai produktai, kuriuos gali paversti aukštos maržos sluoksniu virš fizinio
              shop&apos;o: printable plakatai, PDF gidai ir ritual planneriai.
            </p>
          </div>
          <Link to="/digital/collection" className="button-secondary">
            View full digital collection
          </Link>
        </div>

        {loading ? (
          <div className="mt-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-5 text-red-600">{error}</div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={product._id.startsWith("digital-fallback-") ? "/digital/collection" : `/products/${product._id}`}
                className="marketing-card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_85px_rgba(31,26,20,0.08)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,rgba(245,239,231,0.95),rgba(233,223,210,0.75))]">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-end justify-between p-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted">Digital product</p>
                        <p className="mt-3 font-display text-4xl font-bold text-[rgb(34,28,22)]">{product.name}</p>
                      </div>
                      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[rgb(34,28,22)]">
                        PDF
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-2xl font-bold">{product.name}</p>
                    <span className="premium-tag">Digital</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-semibold">{formatCurrency(product.price)}</span>
                    <span className="text-sm font-medium accent-text">View product</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="public-section">
        <div className="text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">A cleaner purchase flow for digital goods.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">
            Visa patirtis remiasi tuo pačiu tavo checkout, bet rezultatas pirkėjui daug greitesnis: jokios logistikos,
            tik iškart atrakintas turinys paskyroje.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="mx-auto timeline-dot">{step.step}</div>
              <h3 className="mt-5 font-display text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <span className="hero-chip">Bundle potential</span>
            <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">
              This is where higher-margin bundles start to make sense.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/68">
              Skaitmeniniai produktai leidžia tau parduoti ne tik atskirą failą, bet ir aiškią patirtį:
              posteriai + interjero gidas + planneris viename premium pakete.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Home Edit Bundle",
                price: "€39–49",
                text: "Poster bundle + living room guide for a quiet but practical room refresh.",
              },
              {
                title: "Calm Living Bundle",
                price: "€49–59",
                text: "Poster bundle + guide + planner for a fuller digital product stack.",
              },
            ].map((bundle) => (
              <div key={bundle.title} className="rounded-[24px] bg-white/6 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Bundle idea</p>
                <h3 className="mt-4 font-display text-3xl font-bold">{bundle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/74">{bundle.text}</p>
                <p className="mt-6 font-semibold text-[rgb(227,196,149)]">{bundle.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-6 text-[rgb(29,24,19)] sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
                Ready to launch
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold">Open the digital shelf and start building it product by product.</h3>
              <p className="mt-2 text-sm text-[rgb(98,87,74)]">
                Begin with three signature products, then expand into themed bundles and guided collections.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/digital/collection" className="button-primary">
                Browse digital products
              </Link>
              <Link to="/admin/products" className="button-secondary">
                Add products in admin
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DigitalLandingPage;
