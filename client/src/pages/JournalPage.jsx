import { ArrowRight, Quote } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import JournalAccessGate from "../components/JournalAccessGate";
import { journalArticles } from "../content/journalArticles";
import JournalCoverArt from "../components/JournalCoverArt";
import { useAuth } from "../context/AuthContext";
import { hasActiveMembership } from "../utils/membership";

const editorialPoints = [
  "notes on building a calmer storefront",
  "thoughts on digital and physical product positioning",
  "quiet lessons from premium-feel commerce",
];

const newsletterStorageKey = "stilloak_private_notes_interest";

const JournalPage = () => {
  const { user, isCheckingAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const canAccessJournal = hasActiveMembership(user);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setNewsletterState("error");
      setNewsletterMessage("Įvesk tvarkingą el. pašto adresą, kad galėtume išsaugoti tavo susidomėjimą.");
      return;
    }

    localStorage.setItem(
      newsletterStorageKey,
      JSON.stringify({
        email: normalizedEmail,
        submittedAt: new Date().toISOString(),
      })
    );
    setNewsletterState("success");
    setNewsletterMessage("Susidomėjimas išsaugotas šiame įrenginyje. Kitas žingsnis bus prijungti pilną email įrankį.");
    setEmail("");
  };

  if (isCheckingAuth) {
    return <LoadingSpinner label="Tikriname narystės prieigą..." />;
  }

  if (!canAccessJournal) {
    return (
      <JournalAccessGate
        user={user}
        title="Journal unlocks after membership purchase."
        description="This editorial archive is part of the Circle and Private membership layer. Once your paid plan becomes active, the full Journal and every article open automatically."
      />
    );
  }

  return (
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
          {journalArticles.map((entry) => (
            <Link key={entry.slug} to={`/journal/${entry.slug}`} className="marketing-card overflow-hidden p-0 transition hover:-translate-y-1">
              <JournalCoverArt cover={entry.cover} compact />
              <div className="p-6">
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-muted">
                  <span>{entry.category}</span>
                  <span>{entry.readTime}</span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(28,24,20)]">
                  {entry.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-muted">{entry.excerpt}</p>
                <p className="mt-6 text-sm font-medium accent-text">Read full article</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <span className="eyebrow">Private notes</span>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
                Join the next layer of slower, sharper editorial notes.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-[rgb(98,87,74)]">
                Use this block as the quiet next step after reading. It is a simple way to signal interest before the
                full newsletter tool is connected.
              </p>
            </div>

            <div className="rounded-[28px] bg-[rgb(34,28,24)] px-6 py-7 text-white">
              <p className="text-xs uppercase tracking-[0.34em] text-white/42">Newsletter signup</p>
              <form className="mt-5 space-y-4" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email address"
                  className="w-full rounded-full border border-white/10 bg-white/6 px-5 py-4 text-sm text-white outline-none placeholder:text-white/34"
                />
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="button-primary">
                    Save interest
                  </button>
                  <Link to="/contact" className="hero-outline-button">
                    Contact the studio
                  </Link>
                </div>
              </form>
              {newsletterMessage ? (
                <p
                  className={`mt-4 text-sm leading-6 ${
                    newsletterState === "success" ? "text-[rgb(210,233,193)]" : "text-[rgb(255,193,193)]"
                  }`}
                >
                  {newsletterMessage}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-white/60">
                  When you are ready, the next technical step is connecting Brevo or another email platform to collect
                  these signups centrally.
                </p>
              )}
            </div>
          </div>
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
};

export default JournalPage;
