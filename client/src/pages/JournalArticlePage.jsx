import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { getJournalArticleBySlug, journalArticles } from "../content/journalArticles";

const JournalArticlePage = () => {
  const { slug } = useParams();
  const article = getJournalArticleBySlug(slug);

  if (!article) {
    return <Navigate to="/journal" replace />;
  }

  const relatedArticles = journalArticles.filter((entry) => entry.slug !== article.slug).slice(0, 2);

  return (
    <div className="space-y-10 pb-6">
      <section className="surface-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <Link to="/journal" className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
          <ArrowLeft size={16} />
          Back to journal
        </Link>

        <div className="mt-8 max-w-4xl">
          <p className="text-xs uppercase tracking-[0.34em] text-white/42">{article.category}</p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[0.94] sm:text-6xl">{article.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/58">
            <span>{article.date}</span>
            <span>{article.readTime}</span>
          </div>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/74 sm:text-lg">{article.intro}</p>
        </div>
      </section>

      <section className="public-section grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-4">
          <div className="marketing-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Article focus</p>
            <p className="mt-4 text-base leading-7 text-muted">{article.excerpt}</p>
          </div>

          <div className="marketing-card p-6">
            <Quote size={18} style={{ color: "rgb(var(--accent))" }} />
            <p className="mt-4 text-base leading-7 text-muted">{article.takeaway}</p>
          </div>
        </aside>

        <div className="space-y-5">
          {article.sections.map((section) => (
            <article key={section.heading} className="marketing-card p-6 sm:p-8">
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(28,24,20)]">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-7 text-muted">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="grid gap-5 lg:grid-cols-2">
          {relatedArticles.map((entry) => (
            <Link key={entry.slug} to={`/journal/${entry.slug}`} className="marketing-card p-6 transition hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{entry.category}</p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(28,24,20)]">
                {entry.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">{entry.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium accent-text">
                Read article
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JournalArticlePage;
