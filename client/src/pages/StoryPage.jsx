import { ArrowRight, BarChart3, CheckCircle2, LockKeyhole, MailCheck, Sparkles, WalletCards } from "lucide-react";
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

const memberUnlocks = [
  {
    icon: WalletCards,
    title: "Savings Studio",
    text: "A private dashboard with budgets, goals, recurring spend, CSV import, and a calmer monthly money view.",
  },
  {
    icon: MailCheck,
    title: "AI summaries",
    text: "Weekly and monthly reports arrive in your inbox with premium commentary, risk signals, and a next-step plan.",
  },
  {
    icon: LockKeyhole,
    title: "Locked editorial layer",
    text: "Members-only Journal access, account archive, receipts, and a more private experience across the brand.",
  },
];

const memberStoryFrames = [
  {
    eyebrow: "Frame 01",
    title: "Your private member dashboard",
    subtitle: "See budgets, recurring costs, and where the month is losing control before it spills into next week.",
    metricLabel: "Money view",
    metricValue: "3 active budgets",
    bullets: ["Monthly budget pressure", "Recurring vs flexible spend", "Goal pace and savings capacity"],
  },
  {
    eyebrow: "Frame 02",
    title: "Reports that read like a coach note",
    subtitle: "Members receive weekly and monthly summaries with a premium evaluation, what works, where risk grows, and what to do next.",
    metricLabel: "Inbox layer",
    metricValue: "Weekly + monthly",
    bullets: ["AI commentary", "7-day action plan", "Top category and recurring load"],
  },
  {
    eyebrow: "Frame 03",
    title: "The locked layer after purchase",
    subtitle: "Membership unlocks Journal access, receipts, digital delivery, and a more editorial, private account experience.",
    metricLabel: "What unlocks",
    metricValue: "Journal + archive",
    bullets: ["Members-only Journal", "Receipt archive", "Digital delivery and support"],
  },
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

    <section className="public-section grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <span className="eyebrow">Member preview</span>
        <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
          A short story of what the membership actually unlocks.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          Instead of asking people to imagine the value, we show the private side of the experience: the dashboard,
          the inbox reports, and the locked editorial layer that opens after purchase.
        </p>

        <div className="mt-6 grid gap-4">
          {memberUnlocks.map(({ icon: Icon, text, title }) => (
            <div key={title} className="marketing-card p-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))]/12">
                  <Icon size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-[rgb(29,24,19)]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/pricing" className="button-primary gap-2">
            Unlock membership
            <ArrowRight size={16} />
          </Link>
          <Link to="/savings-studio" className="button-secondary">
            View public demo
          </Link>
        </div>
      </div>

      <MemberStoryReel />
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

const MemberStoryReel = () => (
  <div className="story-reel-shell relative overflow-hidden rounded-[34px] p-4 sm:p-5">
    <div className="story-reel-device relative overflow-hidden rounded-[30px] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/48">Members view</p>
          <p className="mt-2 font-display text-3xl font-bold text-white">What opens after purchase</p>
        </div>
        <span className="hero-chip">Live preview</span>
      </div>

      <div className="relative min-h-[440px]">
        {memberStoryFrames.map((frame, index) => (
          <article
            key={frame.title}
            className="story-reel-frame absolute inset-0 flex flex-col justify-between rounded-[26px] border border-white/8 bg-white/5 p-5"
            style={{ animationDelay: `${index * 4}s` }}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">{frame.eyebrow}</p>
              <h3 className="mt-3 font-display text-4xl font-bold text-white">{frame.title}</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">{frame.subtitle}</p>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.22em] text-white/48">{frame.metricLabel}</span>
                  <span className="premium-tag">{frame.metricValue}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {frame.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-4">
                      <p className="text-sm leading-6 text-white/82">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[0.66fr_0.34fr]">
                <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">Member stack</span>
                    <span className="text-xs uppercase tracking-[0.22em] text-white/42">Locked layer</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="story-reel-bar h-full rounded-full bg-[rgb(var(--accent-strong))]" />
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="story-reel-bar h-full rounded-full bg-white/65" style={{ width: "72%" }} />
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="story-reel-bar h-full rounded-full bg-white/35" style={{ width: "46%" }} />
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">You get</p>
                  <ul className="mt-3 space-y-2">
                    <li className="text-sm text-white/82">Dashboard</li>
                    <li className="text-sm text-white/82">Reports</li>
                    <li className="text-sm text-white/82">Journal</li>
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {memberStoryFrames.map((frame, index) => (
          <span
            key={frame.title}
            className="story-reel-progress h-1.5 overflow-hidden rounded-full bg-white/10"
            style={{ animationDelay: `${index * 4}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default StoryPage;
