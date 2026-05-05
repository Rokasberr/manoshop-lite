import { ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import JournalAccessGate from "../components/JournalAccessGate";
import { journalArticles } from "../content/journalArticles";
import JournalCoverArt from "../components/JournalCoverArt";
import { useAuth } from "../context/AuthContext";
import { hasActiveMembership } from "../utils/membership";

const newsPoints = [
  "narystės, planų ir programos pokyčiai",
  "nauji nario resursai ir praktiniai įrankiai",
  "produktų pristatymai, atranka ir ankstyvos kryptys",
];

const JournalPage = () => {
  const { user, isCheckingAuth } = useAuth();
  const canAccessJournal = hasActiveMembership(user);

  if (isCheckingAuth) {
    return <LoadingSpinner label="Tikriname narystės prieigą..." />;
  }

  if (!canAccessJournal) {
    return (
      <JournalAccessGate
        user={user}
        title="Nario naujienos pilnai atsiveria Asmeniniam ir Privataus verslo planui."
        description="Bazinis gali matyti ribotas peržiūras, tačiau pilni įrašai, resursų pristatymai ir programos pokyčiai lieka aktyviems mokamiems planams."
      />
    );
  }

  return (
    <div className="space-y-10 pb-6">
      <section className="surface-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <span className="hero-chip">Nario naujienos</span>
            <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
              Kas vyksta StillOak Studio nario viduje.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Čia renkamos svarbios narystės naujienos: platformos atnaujinimai, nauji resursai, produktų
              pristatymai, programos pokyčiai ir trumpos pastabos, kurios padeda aiškiau naudotis nario zona.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/members/savings-studio" className="button-primary gap-2">
                Atidaryti Stilloak
                <ArrowRight size={16} />
              </Link>
              <Link to="/pricing" className="button-secondary">
                Peržiūrėti planus
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-white/42">Šioje zonoje</p>
            <div className="mt-5 space-y-3">
              {newsPoints.map((point) => (
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
                <p className="mt-6 text-sm font-medium accent-text">Skaityti naujieną</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="public-section grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <span className="eyebrow">Naujienų ritmas</span>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
            Trumpi, praktiški įrašai vietoje triukšmingo srauto.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            Nario naujienos skirtos tam, kad aiškiai matytum, kas pasikeitė, kas ruošiama ir kurį resursą verta
            atsiversti toliau.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="marketing-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Bazinis</p>
            <h3 className="mt-4 font-display text-3xl font-bold">Ribotos peržiūros</h3>
            <p className="mt-4 text-sm leading-7 text-muted">
              Bazinis narys gali matyti kryptį ir trumpas užrakintų naujienų santraukas.
            </p>
          </div>
          <div className="marketing-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Asmeninis ir Privatus verslas</p>
            <h3 className="mt-4 font-display text-3xl font-bold">Pilna prieiga</h3>
            <p className="mt-4 text-sm leading-7 text-muted">
              Mokami planai atveria visus įrašus, resursų pristatymus ir programos pokyčių paaiškinimus.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="marketing-dark rounded-[32px] px-6 py-8 sm:px-8">
          <Quote size={20} style={{ color: "rgb(var(--accent-strong))" }} />
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
            Nario naujienos yra rami vieta sugrįžti: aišku, kas keičiasi, kodėl tai svarbu ir ką narys gali naudoti toliau.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/members/savings-studio" className="button-primary">
              Grįžti į nario zoną
            </Link>
            <Link to="/contact" className="hero-outline-button">
              Parašyti komandai
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JournalPage;
