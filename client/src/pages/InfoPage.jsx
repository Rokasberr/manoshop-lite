import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const infoPageCopy = {
  lt: {
    lastUpdated: "Atnaujinta",
    noteTitle: "Kalbos pastaba",
    noteBody:
      "Išsamūs privatumo, taisyklių ir pagalbos puslapiai šiuo metu pirmiausia paruošti lietuvių kalba. Viešoji marketingo dalis jau persijungia pagal pasirinktą kalbą.",
    helpEyebrow: "Vis dar reikia aiškumo?",
    helpTitle: "Jei reikia tikslesnio atsakymo, geriau paaiškinsime, nei paliksime spėlioti.",
    contactSupport: "Susisiekti su pagalba",
  },
  en: {
    lastUpdated: "Last updated",
    noteTitle: "Language note",
    noteBody:
      "Detailed privacy, terms, and support pages are currently maintained in Lithuanian first. The main public marketing pages already switch with your selected language.",
    helpEyebrow: "Still need something else?",
    helpTitle: "If you need a clearer answer, we’d rather explain than leave you guessing.",
    contactSupport: "Contact support",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  infoPageCopy[languageCode] = infoPageCopy.en;
});

const InfoPage = ({ page }) => {
  const { language, isLithuanian } = useLanguage();
  const copy = infoPageCopy[language] || infoPageCopy.lt;

  if (!page) {
    return null;
  }

  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <span className="hero-chip">{page.eyebrow}</span>
            <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{page.summary}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.28em] text-white/40">
              {copy.lastUpdated} {page.lastUpdated}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {page.highlights.map((highlight) => (
              <div key={highlight} className="metric-card">
                <CheckCircle2 size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="mt-4 text-sm leading-6 text-white/74">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        {!isLithuanian ? (
          <div className="mb-5 rounded-[22px] border border-[rgb(232,224,214)] bg-[rgb(252,249,244)] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[rgb(128,90,42)]">{copy.noteTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[rgb(98,87,74)]">{copy.noteBody}</p>
          </div>
        ) : null}
        <div className="grid gap-5">
          {page.sections.map((section) => (
            <article key={section.heading} className="marketing-card p-6 sm:p-8">
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(28,24,20)]">
                {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-4 max-w-3xl text-base leading-7 text-muted">
                  {paragraph}
                </p>
              ))}

              {section.bullets?.length ? (
                <div className="mt-5 grid gap-3">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3 rounded-[20px] bg-[rgb(249,245,238)] px-4 py-4">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent))" }} />
                      <p className="text-sm leading-6 text-[rgb(78,68,57)]">{bullet}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
          <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
            {copy.helpEyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(29,24,19)]">
            {copy.helpTitle}
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={page.cta.to} className="button-primary gap-2">
              {page.cta.label}
              <ArrowRight size={16} />
            </Link>
            <Link to="/private-support" className="button-secondary">
              {copy.contactSupport}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InfoPage;
