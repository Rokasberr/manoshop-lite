import { ArrowRight, LockKeyhole, MailCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

const previewHighlights = [
  {
    icon: WalletCards,
    title: "Private dashboard access",
    text: "Budgets, recurring pressure, goal pace, imports, and a calmer monthly money view in one member-only space.",
  },
  {
    icon: MailCheck,
    title: "Premium summary emails",
    text: "Weekly and monthly reports arrive with evaluation, AI-style commentary, clear risks, and next-step direction.",
  },
  {
    icon: LockKeyhole,
    title: "The full locked layer",
    text: "Journal, receipt archive, digital delivery, and a more private account experience unlock together after purchase.",
  },
];

const previewFrames = [
  {
    eyebrow: "Frame 01",
    title: "The private dashboard itself",
    text: "This is the members area where budgets, recurring spend, goals, and savings pressure come together in one calmer money view.",
    image: "/story/members-dashboard-preview.svg",
    alt: "Savings Studio member dashboard preview showing budgets, summaries, and spending insights.",
    cta: "Open dashboard preview",
  },
  {
    eyebrow: "Frame 02",
    title: "The premium email summary",
    text: "Members receive a weekly or monthly report with an AI-style evaluation, key risks, and a next-step action plan in the inbox.",
    image: "/story/member-summary-email-preview.svg",
    alt: "Preview of the Savings Studio summary email with score, commentary, and action plan.",
    cta: "Open email preview",
  },
  {
    eyebrow: "Frame 03",
    title: "What the purchase unlocks",
    text: "After buying membership, the customer unlocks Savings Studio, the locked Journal, receipt archive, and digital delivery support in one place.",
    image: "/story/member-unlock-preview.svg",
    alt: "Membership success preview showing unlocked features like Savings Studio, Journal, and receipt archive.",
    cta: "Open unlock preview",
  },
];

const MembershipPreviewPage = () => (
  <div className="space-y-10 pb-6">
    <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="hero-chip">Membership preview</span>
          <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
            See what opens the moment someone buys the membership.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            This page shows the real member-facing layer: the Savings Studio dashboard, the premium summary email, and
            the unlock state that ties the whole account experience together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/pricing" className="button-primary gap-2">
              View membership
              <ArrowRight size={16} />
            </Link>
            <Link to="/story" className="hero-outline-button">
              Back to story
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {previewHighlights.map(({ icon: Icon, text, title }) => (
            <div key={title} className="metric-card">
              <Icon size={18} style={{ color: "rgb(var(--accent-strong))" }} />
              <p className="mt-4 font-display text-2xl font-bold">{title}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="public-section">
      <div className="member-showcase-shell rounded-[34px] p-4 sm:p-5 lg:p-6">
        <div className="member-showcase-device rounded-[30px] p-5 sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgb(128,90,42)]">
                Realistic preview
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-[rgb(29,24,19)]">What the member sees</p>
            </div>
            <span className="premium-tag">After purchase</span>
          </div>

          <div className="space-y-6">
            {previewFrames.map((frame) => (
              <article
                key={frame.title}
                className="rounded-[28px] border border-[rgb(226,216,203)] bg-white p-5 shadow-[0_20px_60px_rgba(33,26,18,0.06)] sm:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgb(128,90,42)]">
                      {frame.eyebrow}
                    </p>
                    <h2 className="mt-3 font-display text-4xl font-bold text-[rgb(29,24,19)]">{frame.title}</h2>
                    <p className="mt-3 text-base leading-7 text-[rgb(98,87,74)]">{frame.text}</p>
                  </div>

                  <a
                    href={frame.image}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary shrink-0"
                  >
                    {frame.cta}
                  </a>
                </div>

                <div className="preview-media-frame mt-6 overflow-hidden rounded-[24px] border border-[rgb(232,224,214)] bg-[rgb(248,243,235)] p-3 sm:p-4">
                  <img src={frame.image} alt={frame.alt} className="preview-media-image h-auto w-full rounded-[18px]" />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-[rgb(232,224,214)] bg-[rgb(248,243,235)] px-5 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[rgb(128,90,42)]">What they get</p>
                <p className="mt-2 text-sm leading-7 text-[rgb(98,87,74)]">
                  A member does not just unlock one tool. They unlock the full private layer: dashboard, inbox
                  guidance, account archive, and the editorial side of the brand.
                </p>
              </div>
              <Link to="/pricing" className="button-primary">
                See plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default MembershipPreviewPage;
