import { ArrowRight, Download, LayoutPanelTop, Palette, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

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

const teaserPanels = [
  {
    eyebrow: "Planned release",
    title: "Printable bundles and premium PDF guides",
    text: "The first release is being curated to open as one cleaner shelf instead of scattered individual product drops.",
  },
  {
    eyebrow: "What will be inside",
    title: "Poster sets, room guides, planners",
    text: "The collection is meant to feel editorial and intentional, with fewer but stronger digital products from day one.",
  },
  {
    eyebrow: "Current status",
    title: "Temporarily staged under Launch Soon",
    text: "For now, the digital layer stays in preview mode while the files, bundles, and launch flow are tightened.",
  },
];

const teaserProducts = [
  "Calm Home Poster Bundle",
  "The Atelier Living Room Guide",
  "Sunday Reset Ritual Planner",
];

const launchSignals = [
  "Protected account download flow",
  "Bundle logic for higher-margin offers",
  "Cleaner release sequence before opening the shelf",
];

const DigitalLandingPage = () => {
  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">Digital collection</span>
              <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.92] sm:text-6xl lg:text-7xl">
                Instant digital products for calmer rooms and clearer routines.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Ši kolekcija skirta PDF gidams, printable rinkiniams ir planavimo įrankiams, kurie jaučiasi
                kaip natūrali tavo brand&apos;o tąsa, o ne atsitiktinis priedas prie fizinio shop&apos;o.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
                Pilna Digital Collection šiuo metu perkelta į atskirą <span className="font-semibold text-white/80">Launch soon</span> sluoksnį,
                kad atsidarytų tik tada, kai visa patirtis bus iki galo paruošta.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/launch-soon" className="button-primary gap-2">
                  View launch status
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
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Launch mode</p>
                  <h3 className="mt-4 font-display text-3xl font-bold">The shelf is visible as a teaser for now</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    Instead of exposing half-ready product pages, the digital layer is temporarily shown as a curated
                    preview until launch day.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <p className="text-xs text-white/45">Status</p>
                      <p className="mt-2 font-display text-2xl font-bold">Launch soon</p>
                    </div>
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <p className="text-xs text-white/45">Focus</p>
                      <p className="mt-2 font-display text-2xl font-bold">Better first release</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">What is being prepared</p>
                    <div className="mt-4 space-y-3">
                      {launchSignals.map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm text-white/74">
                          <Download size={16} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Preview titles</p>
                    <div className="mt-4 grid gap-3">
                      {teaserProducts.map((product, index) => (
                        <div
                          key={product}
                          className="flex items-center justify-between rounded-[18px] bg-white/4 px-4 py-3 text-sm"
                        >
                          <span>{product}</span>
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
            <span className="eyebrow">Teaser only</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">The digital shelf is visible as a promise, not a live catalog.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Instead of showing clickable product cards right now, this section stays in teaser mode and points people
              into the launch-soon layer until the collection is fully ready.
            </p>
          </div>
          <Link to="/launch-soon" className="button-secondary">
            Open launch soon
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {teaserPanels.map((panel) => (
            <div key={panel.title} className="marketing-card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{panel.eyebrow}</p>
              <h3 className="mt-4 font-display text-3xl font-bold text-[rgb(28,24,20)]">{panel.title}</h3>
              <p className="mt-4 text-base leading-7 text-muted">{panel.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="eyebrow">What will open later</span>
              <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">The first release is planned to open as one tighter edit.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                The goal is to launch with stronger bundles, cleaner product framing, and a better instant-download
                experience instead of opening the shelf too early.
              </p>
            </div>
            <div className="grid gap-3">
              {teaserProducts.map((product) => (
                <div
                  key={product}
                  className="rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-4 text-sm text-[rgb(98,87,74)]"
                >
                  {product}
                </div>
              ))}
            </div>
          </div>
        </div>
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
            <div className="rounded-[24px] bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">Bundle idea</p>
              <h3 className="mt-4 font-display text-3xl font-bold">Home Edit Bundle</h3>
              <p className="mt-3 text-sm leading-6 text-white/74">
                Poster bundle + living room guide framed as one cleaner room reset offer.
              </p>
              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="font-semibold text-[rgb(227,196,149)]">Launch soon</p>
                <span className="text-sm font-medium text-white/72">Teaser</span>
              </div>
            </div>

            <div className="rounded-[24px] bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">Bundle idea</p>
              <h3 className="mt-4 font-display text-3xl font-bold">Calm Living Bundle</h3>
              <p className="mt-3 text-sm leading-6 text-white/74">
                Poster bundle + guide + planner shaped as a fuller digital lifestyle layer.
              </p>
              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="font-semibold text-[rgb(227,196,149)]">Launch soon</p>
                <span className="text-sm font-medium text-white/72">Teaser</span>
              </div>
            </div>
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
                <Link to="/launch-soon" className="button-primary">
                  Open launch soon
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
