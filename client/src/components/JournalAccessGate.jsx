import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

import JournalCoverArt from "./JournalCoverArt";
import { journalArticles } from "../content/journalArticles";

const JournalAccessGate = ({
  user,
  title = "Journal is reserved for active members.",
  description = "This editorial layer unlocks for members with an active Circle or Private plan.",
}) => {
  const previewArticles = journalArticles.slice(0, 3);

  return (
    <div className="space-y-10 pb-6">
      <section className="surface-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <span className="hero-chip">Members only</span>
            <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pricing" className="button-primary gap-2">
                Unlock with membership
                <ArrowRight size={16} />
              </Link>
              {user ? (
                <Link to="/profile" className="button-secondary">
                  Open profile
                </Link>
              ) : (
                <Link to="/login" className="button-secondary">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/5 p-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/6 px-4 py-2 text-sm text-white/72">
              <LockKeyhole size={16} style={{ color: "rgb(var(--accent-strong))" }} />
              Circle and Private plans unlock the full editorial archive
            </div>
            <div className="mt-6 space-y-3 text-sm text-white/68">
              <div className="rounded-[18px] bg-white/4 px-4 py-4">
                Full article reads and related editorial notes
              </div>
              <div className="rounded-[18px] bg-white/4 px-4 py-4">
                Calmer brand insights, digital product thinking, and commerce strategy
              </div>
              <div className="rounded-[18px] bg-white/4 px-4 py-4">
                Access designed as part of the membership layer, not a disconnected add-on
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="grid gap-5 lg:grid-cols-3">
          {previewArticles.map((article) => (
            <div key={article.slug} className="marketing-card overflow-hidden p-0">
              <div className="relative">
                <JournalCoverArt cover={article.cover} compact />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,15,14,0.05),rgba(17,15,14,0.52))]" />
                <div className="absolute right-4 top-4 rounded-full bg-[rgba(17,15,14,0.76)] px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/78">
                  Locked
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">{article.category}</p>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(28,24,20)]">
                  {article.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-muted">{article.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JournalAccessGate;
