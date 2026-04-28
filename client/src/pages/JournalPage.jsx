import { ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";

const journalEntries = [
  {
    category: "Brand notes",
    title: "Why calm design converts better than louder design",
    excerpt:
      "A more premium storefront often earns trust faster because it removes visual friction before a customer even reaches checkout.",
  },
  {
    category: "Digital collection",
    title: "How we think about useful digital products",
    excerpt:
      "Printable art, interior guides, and planners work best when they solve a specific need and still feel beautiful to return to.",
  },
  {
    category: "Commerce rhythm",
    title: "What makes a boutique store feel memorable",
    excerpt:
      "It is usually the combination of tone, restraint, product framing, and a checkout flow that does not create anxiety.",
  },
];

const editorialPoints = [
  "notes on building a calmer storefront",
  "thoughts on digital and physical product positioning",
  "quiet lessons from premium-feel commerce",
];

const JournalPage = () => (
  <div className="space-y-10 pb-6">
    <section className="surface-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <span className="hero-chip">Journal</span>
          <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
            Editorial notes from inside the house.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            This is where Stilloak Studio gathers ideas around calmer commerce, better product framing, digital
            collections, and the details that make a store feel more collected than generic.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/digital" className="button-primary gap-2">
              Explore digital
              <ArrowRight size={16} />
            </Link>
            <Link to="/story" className="button-secondary">
              Read our story
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.32em] text-white/42">In this journal</p>
          <div className="mt-5 space-y-3">
            {editorialPoints.map((point) => (
              <div key={point} className="rounded-[18px] bg-white/4 px-4 py-4 text-sm text-white/72">
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="public-section">
      <div className="grid gap-5 lg:grid-cols-3">
        {journalEntries.map((entry) => (
          <article key={entry.title} className="marketing-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{entry.category}</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(28,24,20)]">
              {entry.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">{entry.excerpt}</p>
            <p className="mt-6 text-sm font-medium accent-text">Full editorial entries can grow here next.</p>
          </article>
        ))}
      </div>
    </section>

    <section className="public-section grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
      <div>
        <span className="eyebrow">From our circle</span>
        <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
          Journal is where the brand voice becomes more personal.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-7 text-muted">
          It gives you space to explain taste, buying logic, slow-living ideas, and why your products are framed the
          way they are. That helps the whole store feel more intentional.
        </p>
      </div>

      <div className="marketing-dark rounded-[32px] px-6 py-8 sm:px-8">
        <Quote size={20} style={{ color: "rgb(var(--accent-strong))" }} />
        <p className="mt-5 text-lg leading-8 text-white/80">
          A good journal is not filler content. It is one more layer of trust, taste, and brand memory.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/shop" className="button-primary">
            Browse collection
          </Link>
          <Link to="/contact" className="hero-outline-button">
            Suggest a topic
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default JournalPage;
