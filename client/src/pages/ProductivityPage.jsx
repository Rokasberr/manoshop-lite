import { ArrowRight, CheckCircle2, Download, FileSpreadsheet, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import { productivityResources } from "../constants/productivityResources";

const formatIcon = (format) =>
  format.toLowerCase().includes("csv") ? <FileSpreadsheet size={18} /> : <FileText size={18} />;

const ResourceCard = ({ resource }) => (
  <article className="marketing-card group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1">
    <div className="soft-border-bottom bg-[rgb(var(--surface-soft)/0.48)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg soft-pill accent-text">
          {formatIcon(resource.type)}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="signal-pill">
            {resource.badge}
          </span>
          {resource.files.map((file) => (
            <span key={file.fileName} className="soft-pill rounded-lg px-3 py-1 text-xs font-semibold text-muted">
              {file.format}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] accent-text">
        {resource.type}
      </p>
      <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">{resource.title}</h2>
      <p className="mt-4 text-sm leading-7 text-muted">{resource.description}</p>
    </div>

    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="soft-card rounded-lg p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] accent-text">Vertė</p>
        <p className="mt-2 text-sm leading-6 text-muted">{resource.valueSummary}</p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-bold">Ką gausi</p>
        <div className="mt-3 grid gap-2">
          {resource.includes.map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm leading-6 text-muted">
              <CheckCircle2 size={16} className="mt-1 shrink-0 accent-text" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="grid gap-3">
          {resource.files.map((file) => (
            <div key={file.fileName} className="soft-card rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  {formatIcon(file.format)}
                  <span className="truncate">{file.label}</span>
                </span>
                <span className="signal-pill shrink-0 px-2.5 py-1 text-[11px]">
                  {file.format}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <a href={file.fileUrl} target="_blank" rel="noreferrer" className="button-primary min-h-[44px] px-4 py-2.5">
                  Atidaryti
                </a>
                <a href={file.fileUrl} download={file.fileName} className="button-secondary min-h-[44px] px-4 py-2.5">
                  Atsisiųsti
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </article>
);

const ProductivityPage = () => {
  const activeResources = productivityResources.filter((resource) => resource.isActive);

  return (
    <div className="space-y-8 pb-8">
      <section className="marketing-dark relative overflow-hidden rounded-lg px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(226,202,145,0.16),transparent_32%),linear-gradient(135deg,rgba(16,38,31,0.92),rgba(7,19,16,0.96)_58%,rgba(5,10,9,1))]" />
        <div className="relative grid gap-10 xl:grid-cols-[1fr_0.74fr] xl:items-end">
          <div>
            <span className="hero-chip">Nemokama vieša biblioteka</span>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Produktyvumo resursai
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
              Nemokami planuokliai, trackeriai ir šablonai, padedantys aiškiau susidėlioti dieną, savaitę, tikslus ir įpročius.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#productivity-resources" className="button-primary gap-2">
                Atsisiųsti resursus
                <Download size={16} />
              </a>
              <a href="#templates" className="hero-outline-button gap-2">
                Peržiūrėti šablonus
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
            <p className="text-sm font-semibold text-white">Vieša prieiga</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                ["Resursai", activeResources.length],
                ["PDF failai", activeResources.reduce((total, resource) => total + resource.files.filter((file) => file.format.includes("PDF")).length, 0)],
                ["CSV šablonai", activeResources.reduce((total, resource) => total + resource.files.filter((file) => file.format.includes("CSV")).length, 0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-xs font-semibold uppercase text-white/44">{label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-white/60">
              Jokio prisijungimo, plano patikros ar užrakintų kortelių. Visi failai paruošti naudoti iš karto.
            </p>
          </div>
        </div>
      </section>

      <section id="templates" className="public-section">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <span className="eyebrow">Aiškesnis ritmas</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
              Pradėk nuo vieno mažo plano, tada paversk jį savaitės sistema.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Diena", "Savaitė", "Įpročiai"].map((item) => (
              <div key={item} className="soft-card rounded-lg p-4">
                <Sparkles size={18} className="accent-text" />
                <p className="mt-3 font-display text-2xl font-bold">{item}</p>
                <p className="mt-2 text-sm leading-6 text-muted">Trumpas šablonas, aiški eiga ir vieta realiam veiksmui.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="productivity-resources" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Nemokami failai</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Planuokliai, worksheetai ir CSV šablonai</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Visi resursai sukurti kaip praktiški darbo failai: gali juos atidaryti naršyklėje, atsisiųsti ir naudoti savo dienos ar savaitės planavimui.
            </p>
          </div>
          <div className="soft-pill rounded-lg px-4 py-3 text-sm font-semibold text-muted">
            Prieinama visiems lankytojams
          </div>
        </div>

        {activeResources.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Resursai ruošiami"
            description="Produktyvumo skiltis netrukus bus papildyta naujais nemokamais planuokliais ir šablonais."
            actionLabel="Grįžti į pradžią"
            actionTo="/"
          />
        )}
      </section>

      <section className="public-section">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="eyebrow">Kitas lygis</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Nori daugiau premium resursų?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Narystėje rasi gilesnius finansų, tikslų, skaitmeninių produktų ir verslo planavimo workbookus.
            </p>
          </div>
          <Link to="/pricing" className="button-primary gap-2">
            Atrakinti narystę
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProductivityPage;
