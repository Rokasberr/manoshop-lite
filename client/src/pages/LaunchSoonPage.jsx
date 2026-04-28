import { ArrowRight, BookOpenText, Download, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import launchSoonService from "../services/launchSoonService";

const launchCards = [
  {
    key: "digital",
    eyebrow: "Digital collection",
    title: "Printable guides, bundles, and instant downloads",
    description:
      "The digital shelf is being refined so the first release feels complete, premium, and ready to buy without half-finished edges.",
    bullets: ["Printable art bundles", "PDF guides and planners", "Cleaner launch sequence and bundle logic"],
    icon: Download,
    status: "In staging",
    target: "May 2026",
  },
  {
    key: "journal",
    eyebrow: "Journal",
    title: "A calmer editorial layer for members",
    description:
      "The Journal is being held back until the launch layer is tighter, so the private reading experience feels more considered from day one.",
    bullets: ["Members-only articles", "Sharper editorial calendar", "More complete locked reading experience"],
    icon: BookOpenText,
    status: "Held for release",
    target: "After digital launch",
  },
];

const focusContent = {
  default: {
    eyebrow: "Launch soon",
    title: "Two premium sections are being prepared for launch.",
    text: "Digital Collection and Journal are temporarily grouped here while we tighten the release, polish the flow, and make sure both sections feel fully ready.",
  },
  digital: {
    eyebrow: "Digital collection",
    title: "The digital collection is being prepared for a cleaner launch.",
    text: "The products, bundles, and instant-download experience are being refined before the collection fully opens to customers.",
  },
  journal: {
    eyebrow: "Journal",
    title: "The Journal is temporarily held in launch-soon mode.",
    text: "The locked editorial section is being polished so the member reading layer feels complete, consistent, and worth unlocking.",
  },
};

const notifyStorageKey = "stilloak_launch_soon_interest";

const LaunchSoonPage = ({ focus = "default" }) => {
  const content = focusContent[focus] || focusContent.default;
  const [email, setEmail] = useState("");
  const [notifyState, setNotifyState] = useState("idle");
  const [notifyMessage, setNotifyMessage] = useState("");

  const handleNotifySubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setNotifyState("error");
      setNotifyMessage("Įvesk tvarkingą el. pašto adresą, kad galėtume išsaugoti tavo susidomėjimą.");
      return;
    }

    try {
      setNotifyState("loading");
      setNotifyMessage("");

      const response = await launchSoonService.notifyInterest({
        email: normalizedEmail,
        focus,
      });

      localStorage.setItem(
        notifyStorageKey,
        JSON.stringify({
          email: normalizedEmail,
          focus,
          submittedAt: new Date().toISOString(),
        })
      );

      setNotifyState("success");
      setNotifyMessage(response.message || "Susidomėjimas išsaugotas. Parašysime, kai ši sekcija atsidarys.");
      setEmail("");
    } catch (error) {
      setNotifyState("error");
      setNotifyMessage(
        error.response?.data?.message || "Nepavyko išsaugoti susidomėjimo. Pabandyk dar kartą kiek vėliau."
      );
    }
  };

  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <span className="hero-chip">{content.eyebrow}</span>
            <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{content.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="button-primary gap-2">
                Explore current collection
                <ArrowRight size={16} />
              </Link>
              <Link to="/pricing" className="hero-outline-button">
                View membership
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Status</p>
              <p className="mt-3 font-display text-3xl font-bold">Launch soon</p>
              <p className="mt-2 text-sm text-white/60">These sections are being tightened before full release.</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Why</p>
              <p className="mt-3 font-display text-3xl font-bold">Cleaner first impression</p>
              <p className="mt-2 text-sm text-white/60">The goal is to open them when the experience already feels complete.</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Current layer</p>
              <p className="mt-3 font-display text-3xl font-bold">Story, shop, membership</p>
              <p className="mt-2 text-sm text-white/60">The rest of the storefront stays open while these two sections are staged.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">Launch map</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">What is temporarily grouped here</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Instead of leaving half-open sections in the navigation, both areas now live inside one clearer staging
              layer until the launch is ready.
            </p>
          </div>
          <div className="premium-tag">Temporary staging</div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {launchCards.map((card) => {
            const Icon = card.icon;
            const isFocused = focus === card.key;

            return (
              <article
                key={card.key}
                className={`marketing-card p-6 transition ${
                  isFocused ? "ring-2 ring-[rgb(var(--accent))]/40 shadow-[0_24px_70px_rgba(33,26,18,0.08)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">{card.eyebrow}</p>
                    <h3 className="mt-4 font-display text-3xl font-bold text-[rgb(28,24,20)]">{card.title}</h3>
                  </div>
                  <div className="rounded-full bg-[rgb(var(--accent))]/10 p-3">
                    <Icon size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                  </div>
                </div>

                <p className="mt-4 text-base leading-7 text-muted">{card.description}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgb(128,90,42)]">Status</p>
                    <p className="mt-2 text-sm text-[rgb(98,87,74)]">{card.status}</p>
                  </div>
                  <div className="rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgb(128,90,42)]">Target</p>
                    <p className="mt-2 text-sm text-[rgb(98,87,74)]">{card.target}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {card.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-3 text-sm text-[rgb(98,87,74)]"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="public-section">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <span className="eyebrow">Notify me</span>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
              Let people raise a hand before the section opens.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted">
              Instead of sending visitors into a dead end, this keeps the page useful: they understand the section is
              coming, and they can leave an email to be notified later.
            </p>
          </div>

          <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[rgb(34,28,24)] px-6 py-7 text-white">
            <p className="text-xs uppercase tracking-[0.34em] text-white/42">Launch alert</p>
            <form className="mt-5 space-y-4" onSubmit={handleNotifySubmit}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                className="w-full rounded-full border border-white/10 bg-white/6 px-5 py-4 text-sm text-white outline-none placeholder:text-white/34"
              />
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="button-primary" disabled={notifyState === "loading"}>
                  {notifyState === "loading" ? "Saving interest..." : "Notify me when it opens"}
                </button>
                <Link to="/contact" className="hero-outline-button">
                  Contact the studio
                </Link>
              </div>
            </form>
            {notifyMessage ? (
              <p
                className={`mt-4 text-sm leading-6 ${
                  notifyState === "success" ? "text-[rgb(210,233,193)]" : "text-[rgb(255,193,193)]"
                }`}
              >
                {notifyMessage}
              </p>
            ) : (
              <p className="mt-4 text-sm leading-6 text-white/60">
                This form is ready to save real interest to Brevo once the API key and optional launch list ID are set
                on the server.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
                While you wait
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(29,24,19)]">
                The current live layer is still open.
              </h2>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[rgb(98,87,74)]">
                You can still browse the main collection, view membership, and explore Savings Studio while Digital
                Collection and Journal are being prepared for a stronger release.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="button-primary">
                Browse collection
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

export default LaunchSoonPage;
