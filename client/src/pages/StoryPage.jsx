import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const storyPillars = [
  {
    title: "Curated, not crowded",
    text: "We prefer smaller edits, clearer decisions, and products that feel selected instead of endlessly stacked.",
  },
  {
    title: "Useful beauty",
    text: "Everything should carry visual calm and real function, whether it is a physical object or a digital tool.",
  },
  {
    title: "Slow confidence",
    text: "We design the whole experience to feel composed, from the homepage and checkout to the profile archive.",
  },
];

const storyMoments = [
  "The brand began as a move away from demo-shop energy and toward a quieter editorial commerce feeling.",
  "Every layer of the store is meant to feel more collected: product pages, member access, receipts, and digital delivery.",
  "The goal is not more noise. It is a better rhythm, stronger trust, and a calmer first impression.",
];

const StoryPage = () => (
  <div className="space-y-10 pb-6">
    <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="hero-chip">Our story</span>
          <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
            Stilloak Studio was built to feel calmer than the average storefront.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            We wanted something more refined than a standard catalog, but still practical enough to support real
            buying, real delivery, and real return visits. The result is a boutique-feel space for curated living,
            digital goods, and quieter commerce.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="button-primary gap-2">
              Explore the collection
              <ArrowRight size={16} />
            </Link>
            <Link to="/digital" className="hero-outline-button">
              Enter digital
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {storyPillars.map((pillar) => (
            <div key={pillar.title} className="metric-card">
              <Sparkles size={18} style={{ color: "rgb(var(--accent-strong))" }} />
              <p className="mt-4 font-display text-2xl font-bold">{pillar.title}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">{pillar.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="public-section grid gap-8 lg:grid-cols-[0.84fr_1.16fr]">
      <div>
        <span className="eyebrow">Why it exists</span>
        <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
          A house brand mindset, not a template mindset.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-7 text-muted">
          Stilloak Studio grew out of a simple idea: buying can feel softer, more trustworthy, and more visually
          composed without becoming complicated. We care as much about the tone of the experience as the products
          themselves.
        </p>
      </div>

      <div className="grid gap-4">
        {storyMoments.map((moment) => (
          <div key={moment} className="marketing-card p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent))" }} />
              <p className="text-base leading-7 text-muted">{moment}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="public-section">
      <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
        <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
          What we believe
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(29,24,19)]">
          The best premium feeling usually comes from better editing, not more decoration.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(98,87,74)]">
          That applies to objects, interfaces, copy, and checkout. When every layer is a little more intentional,
          the whole store feels lighter and more trustworthy.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/pricing" className="button-primary">
            View membership
          </Link>
          <Link to="/contact" className="button-secondary">
            Contact the studio
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default StoryPage;
