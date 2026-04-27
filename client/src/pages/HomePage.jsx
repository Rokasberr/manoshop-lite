import {
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import productService from "../services/productService";
import { formatCurrency } from "../utils/currency";

const experiencePillars = [
  {
    icon: Sparkles,
    title: "Curated selection",
    description: "Mažesnės, labiau apgalvotos kolekcijos vietoje chaotiško katalogo įspūdžio.",
  },
  {
    icon: Truck,
    title: "White-glove delivery",
    description: "Aiškus checkout, švelni komunikacija ir tvarkingas užsakymo kelias nuo krepšelio iki pristatymo.",
  },
  {
    icon: ShieldCheck,
    title: "Confident checkout",
    description: "Stripe mokėjimai, saugūs užsakymai ir ramybė klientui be triukšmingų demo signalų.",
  },
  {
    icon: PackageCheck,
    title: "Private order archive",
    description: "Profilio erdvė su istorija, sąskaitomis ir užsakymų valdymu vienoje elegantiškoje vietoje.",
  },
];

const ritualSteps = [
  {
    step: "01",
    title: "Discover",
    description: "Naršyk sezoninį editą ir atrask riboto kiekio objektus, atrinktus ramesniam gyvenimo ritmui.",
  },
  {
    step: "02",
    title: "Reserve",
    description: "Pasirink norimą objektą, kiekį ir susidėk jį į krepšelį be skubos ar agresyvių pardavimo triukų.",
  },
  {
    step: "03",
    title: "Checkout",
    description: "Apmokėjimas kortele per Stripe arba alternatyvus apmokėjimo būdas, kai nori daugiau lankstumo.",
  },
  {
    step: "04",
    title: "Receive",
    description: "Gauk aiškų užsakymo įrašą, PDF sąskaitą ir švarią istoriją savo paskyroje.",
  },
];

const testimonials = [
  {
    quote:
      "Pagaliau parduotuvė, kuri atrodo labiau kaip boutique house, o ne techninis demo su produktų lentele.",
    name: "Emilija K.",
    role: "Interior stylist",
  },
  {
    quote:
      "Mums patiko ramus tonas, švari tipografija ir tai, kad checkout kelias vis dar išliko labai aiškus.",
    name: "Tomas B.",
    role: "Creative director",
  },
  {
    quote:
      "Klientams daug lengviau pasitikėti, kai visa patirtis nuo homepage iki sąskaitos atrodo nuosekliai premium.",
    name: "Greta V.",
    role: "Brand consultant",
  },
];

const atmospherePills = [
  "Small-batch pieces",
  "Member circle access",
  "Secure Stripe checkout",
  "Receipt archive included",
  "Designed for slower living",
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const data = await productService.listProducts({
          featured: true,
          limit: 4,
          sort: "latest",
        });
        setFeaturedProducts(data.products);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko užkrauti kolekcijos.");
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const leadProduct = featuredProducts[0];
  const supportingProducts = featuredProducts.slice(1, 4);

  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">Seasonal house edit</span>
              <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.92] sm:text-6xl lg:text-7xl">
                A calmer, more elevated way to shop beautifully useful objects.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Mano Atelier sujungia curated commerce, member-only perks ir švarų checkout kelią į vieną
                vientisą, prabangesnę patirtį. Čia mažiau triukšmo, daugiau pasitikėjimo ir daugiau noro
                sugrįžti.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className="button-primary gap-2">
                  Explore the collection
                  <ArrowRight size={16} />
                </Link>
                <Link to="/pricing" className="hero-outline-button">
                  View membership
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Signature</p>
                <p className="mt-3 font-display text-3xl font-bold">Curated</p>
                <p className="mt-2 text-sm text-white/60">Fewer pieces, better presence, stronger brand memory.</p>
              </div>
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Checkout</p>
                <p className="mt-3 font-display text-3xl font-bold">Stripe</p>
                <p className="mt-2 text-sm text-white/60">Premium payment flow that still feels effortless.</p>
              </div>
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Archive</p>
                <p className="mt-3 font-display text-3xl font-bold">Receipts</p>
                <p className="mt-2 text-sm text-white/60">Invoices, orders and account history kept beautifully tidy.</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="hero-screen relative w-full max-w-[620px]">
              <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Mano Atelier</p>
                  <p className="text-xs text-white/50">Private collection preview</p>
                </div>
                <span className="hero-chip">Circle access</span>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Lead piece</p>
                  <h3 className="mt-4 font-display text-3xl font-bold">
                    {leadProduct?.name || "Aurora Desk Lamp"}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    {leadProduct?.description ||
                      "A soft sculptural accent that gives the room a quieter kind of confidence."}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <p className="text-xs text-white/45">Member note</p>
                      <p className="mt-2 font-display text-2xl font-bold">Early access</p>
                    </div>
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <p className="text-xs text-white/45">From</p>
                      <p className="mt-2 font-display text-2xl font-bold">
                        {formatCurrency(leadProduct?.price || 89.9)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Member ritual</p>
                    <div className="mt-4 space-y-3">
                      {[
                        "Browse the current edit",
                        "Reserve with secure checkout",
                        "Receive invoice in profile",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm text-white/74">
                          <CheckCircle2 size={16} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Collection mood</p>
                    <div className="mt-4 grid gap-3">
                      {supportingProducts.length
                        ? supportingProducts.map((product, index) => (
                            <div key={product._id} className="flex items-center justify-between rounded-[18px] bg-white/4 px-4 py-3 text-sm">
                              <span>{product.name}</span>
                              <span className="text-white/45">0{index + 1}</span>
                            </div>
                          ))
                        : ["Stoneware Brew Kit", "Studio Headphones X2", "Atlas Carry Backpack"].map((item, index) => (
                            <div key={item} className="flex items-center justify-between rounded-[18px] bg-white/4 px-4 py-3 text-sm">
                              <span>{item}</span>
                              <span className="text-white/45">0{index + 1}</span>
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

        <div className="mt-10">
          <p className="text-center text-xs uppercase tracking-[0.34em] text-white/42">
            The atmosphere in five notes
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {atmospherePills.map((item) => (
              <div key={item} className="logo-strip">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="public-section grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <span className="eyebrow">house philosophy</span>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
            Premium does not need to be loud to feel unmistakable.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            Vietoje tipinio demo shop įspūdžio perkėlėme visą svetainę į lėtesnę, redakcinę kryptį:
            labiau atrinkta kolekcija, ramesnė kalba, švaresnis checkout ir stipresnis prekės ženklo charakteris.
          </p>
          <Link to="/shop" className="button-primary mt-8 gap-2">
            Enter the collection
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {experiencePillars.map((pillar) => (
            <div key={pillar.title} className="marketing-mini-card">
              <pillar.icon size={22} style={{ color: "rgb(var(--accent))" }} />
              <h3 className="mt-5 font-display text-2xl font-bold">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="collections" className="public-section">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <span className="eyebrow">selected pieces</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">A quieter collection, better framed.</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted">
              Produktai išliko tie patys funkcionalumo prasme, bet jų pateikimas dabar labiau primena
              boutique kolekciją, o ne demonstracinį katalogą.
            </p>
            <Link to="/shop" className="button-secondary mt-8">
              Shop all pieces
            </Link>
          </div>

          {loading ? (
            <div className="lg:col-span-1">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="marketing-card p-6 text-red-500">{error}</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="marketing-card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_85px_rgba(31,26,20,0.08)]"
                >
                  <div className="aspect-[4/2.8] overflow-hidden">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-2xl font-bold">{product.name}</p>
                      <Star size={16} style={{ color: "rgb(var(--accent))" }} />
                    </div>
                    <p className="mt-2 text-sm uppercase tracking-[0.28em] text-muted">{product.category}</p>
                    <p className="mt-4 text-sm leading-6 text-muted">{product.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-semibold">{formatCurrency(product.price)}</span>
                      <span className="text-sm font-medium accent-text">View piece</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="public-section">
        <div className="text-center">
          <span className="eyebrow">the ritual</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">An experience designed to feel composed.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">
            Net kai po paviršiumi dirba checkout, sąskaitos ir užsakymų logika, klientui visa tai turi jaustis lengva,
            subtilu ir užtikrinta.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {ritualSteps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="mx-auto timeline-dot">{step.step}</div>
              <h3 className="mt-5 font-display text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="journal" className="surface-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <span className="hero-chip">From our circle</span>
            <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">The site now feels like a house brand, not a starter template.</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/68">
              Perkėlėme akcentą nuo techninio demonstravimo į jausmą: tekstūras, tipografiją, mažesnį triukšmą,
              stipresnį pasitikėjimą ir labiau editorial commerce ritmą.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-[24px] bg-white/6 p-5">
                <Quote size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="mt-4 text-sm leading-7 text-white/74">{testimonial.quote}</p>
                <div className="mt-6">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/42">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-6 text-[rgb(29,24,19)] sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
                Ready to continue
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold">Step into the collection with a stronger first impression.</h3>
              <p className="mt-2 text-sm text-[rgb(98,87,74)]">
                Everything from homepage mood to payment flow now supports a more premium story.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="button-primary">
                Shop now
              </Link>
              <Link to="/pricing" className="button-secondary">
                View membership
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
