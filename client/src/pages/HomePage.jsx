import { ArrowRight, CheckCircle2, FileSpreadsheet, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import MembershipPricingShowcase from "../components/MembershipPricingShowcase";
import Seo from "../components/Seo";
import { getLocalizedDigitalProducts } from "../constants/digitalProducts";
import { getLocalizedSubscriptionPlans } from "../constants/subscriptionPlans";
import { useLanguage } from "../context/LanguageContext";

const HomePage = () => {
  const { language, t } = useLanguage();
  const copy = t("home");
  const products = getLocalizedDigitalProducts(language).slice(0, 3);
  const plans = getLocalizedSubscriptionPlans(language);

  return (
    <div className="space-y-8 pb-8">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Stilloak Studio",
          url: "https://www.stilloak-studio.com/",
          description: copy.seoDescription,
        }}
      />

      <section className="marketing-dark relative isolate overflow-hidden rounded-lg px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(226,202,145,0.18),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(164,220,190,0.14),transparent_32%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-center">
          <div>
            <span className="hero-chip">{copy.heroEyebrow}</span>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/76 sm:text-lg">
              {copy.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/digital-products" className="button-primary min-h-[52px] gap-2">
                {copy.primaryCta}
                <ArrowRight size={16} />
              </Link>
              <Link to="/pricing" className="hero-outline-button min-h-[52px] gap-2">
                {copy.secondaryCta}
                <Sparkles size={16} />
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {copy.trustRow.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/78">
                  <ShieldCheck size={14} className="text-[rgb(var(--accent-strong))]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/20">
            <div className="rounded-lg bg-[rgb(248_250_246/0.96)] p-4 text-[rgb(var(--text))]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-strong))]">
                {copy.heroCardEyebrow}
              </p>
              <div className="mt-5 grid gap-3">
                {copy.heroCards.map((card) => (
                  <div key={card.title} className="rounded-lg border border-[rgb(var(--line))] bg-white px-4 py-4 shadow-sm">
                    <p className="font-display text-xl font-bold">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <MembershipPricingShowcase headingLevel="h2" />

      <section className="public-section">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="eyebrow">{copy.digitalEyebrow}</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{copy.digitalTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{copy.digitalText}</p>
          </div>
          <Link to="/digital-products" className="button-primary">
            {copy.digitalButton}
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] shadow-[0_18px_54px_rgba(31,26,23,0.08)]">
              <img
                src={product.imageUrl}
                alt={product.imageAlt || `${product.title} preview`}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover object-top"
              />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="eyebrow">{product.category}</span>
                  <span className="font-display text-xl font-bold">{product.priceLabel}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold leading-tight">{product.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{product.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(product.badges || []).slice(0, 3).map((badge) => (
                    <span key={badge} className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface-soft))] px-2.5 py-1 text-xs font-semibold text-muted">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5 shadow-[0_18px_54px_rgba(31,26,23,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--accent-strong))]">{plan.badge}</p>
            <h2 className="mt-3 font-display text-2xl font-bold">{plan.name}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{plan.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-6 shadow-[0_20px_70px_rgba(31,26,23,0.08)]">
          <span className="eyebrow">{copy.whyEyebrow}</span>
          <h2 className="mt-4 font-display text-3xl font-bold">{copy.whyTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-muted">{copy.whyText}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {copy.whyItems.map((item) => (
            <article key={item.title} className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5">
              <CheckCircle2 size={18} className="text-[rgb(var(--accent-strong))]" />
              <h3 className="mt-4 font-display text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-6 shadow-[0_20px_70px_rgba(31,26,23,0.08)] sm:p-8">
        <span className="eyebrow">{copy.howEyebrow}</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{copy.howTitle}</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {copy.howSteps.map((step, index) => (
            <article key={step.title} className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface-soft))] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.12)] text-sm font-bold text-[rgb(var(--accent-strong))]">
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {copy.faqItems.map((item) => (
          <article key={item.question} className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5">
            <h3 className="font-display text-xl font-bold">{item.question}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
          </article>
        ))}
      </section>

      <section className="marketing-dark rounded-lg px-6 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="hero-chip">{copy.finalEyebrow}</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{copy.finalTitle}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">{copy.finalText}</p>
          </div>
          <Link to="/digital-products" className="button-primary gap-2">
            <FileSpreadsheet size={16} />
            {copy.finalCta}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
