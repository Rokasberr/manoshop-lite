import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import {
  dailyPlanningTable,
  productivityFitTable,
  productivityResources,
  productivitySystemTable,
} from "../constants/productivityResources";

const valueCards = [
  {
    icon: CalendarCheck,
    title: "Dienos planavimas",
    description: "Trumpas rytinis blokas, kuris padeda pasirinkti fokusą, tris svarbiausius darbus ir dienos ribas.",
  },
  {
    icon: Target,
    title: "Savaitės struktūra",
    description: "Savaitės tikslai, terminai ir užduotys vienoje vietoje, kad aiškiau matytum, kas iš tikrųjų turi įvykti.",
  },
  {
    icon: ListChecks,
    title: "Įpročių sekimas",
    description: "Paprastas ritmas įpročiams žymėti, progresui matyti ir korekcijoms pasirinkti be spaudimo.",
  },
  {
    icon: Clock3,
    title: "Laiko blokavimas",
    description: "Dienos skirstymas pagal laiką, energijos lygį ir prioritetus, kad darbai turėtų realią vietą kalendoriuje.",
  },
  {
    icon: Sparkles,
    title: "30 dienų progresas",
    description: "Mėnesio sistema, kuri leidžia matyti, kas veikia po 7 dienų ir ką verta užtvirtinti po 30 dienų.",
  },
];

const useSteps = [
  "Pasirink vieną tikslą.",
  "Atsisiųsk tinkamą šabloną.",
  "Užpildyk pirmą planavimo bloką.",
  "Sek progresą 7 dienas.",
  "Peržiūrėk rezultatą ir koreguok kitą savaitę.",
];

const formatIcon = (format) =>
  format.toLowerCase().includes("csv") ? <FileSpreadsheet size={18} /> : <FileText size={18} />;

const DataTable = ({ title, description, columns, rows }) => (
  <section className="public-section overflow-hidden">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="eyebrow">Premium lentelė</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{description}</p> : null}
      </div>
    </div>

    <div className="mt-6 overflow-hidden rounded-lg border soft-border">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse bg-[rgb(var(--surface)/0.92)] text-left text-sm">
          <thead>
            <tr className="bg-[rgb(var(--surface-soft)/0.82)]">
              {columns.map((column) => (
                <th key={column.key} className="border-b soft-border px-4 py-4 font-bold accent-text">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row[columns[0].key]}-${row[columns[1].key]}`} className="border-b soft-border last:border-b-0">
                {columns.map((column) => (
                  <td key={column.key} className="max-w-[320px] px-4 py-4 align-top leading-6 text-muted">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

const ResourceCard = ({ resource }) => (
  <article className="marketing-card group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1">
    <div className="soft-border-bottom bg-[rgb(var(--surface-soft)/0.5)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg soft-pill accent-text">
          {formatIcon(resource.type)}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="signal-pill">{resource.badge}</span>
          <span className="signal-pill">{resource.premiumBadge}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {resource.formats.map((format) => (
          <span key={format} className="soft-pill rounded-lg px-3 py-1 text-xs font-semibold text-muted">
            {format}
          </span>
        ))}
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] accent-text">{resource.type}</p>
      <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">{resource.title}</h2>
      <p className="mt-4 text-sm leading-7 text-muted">{resource.description}</p>
    </div>

    <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
      <div className="soft-card rounded-lg p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] accent-text">Kam tinka</p>
        <p className="mt-2 text-sm leading-6 text-muted">{resource.audience}</p>
      </div>

      <div className="soft-card rounded-lg p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] accent-text">Kokią problemą sprendžia</p>
        <p className="mt-2 text-sm leading-6 text-muted">{resource.problem}</p>
      </div>

      <div>
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

      <div className="grid gap-3">
        <div className="rounded-lg bg-[rgb(var(--surface-soft)/0.54)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] accent-text">Kaip naudoti</p>
          <p className="mt-2 text-sm leading-6 text-muted">{resource.howToUse}</p>
        </div>
        <div className="rounded-lg bg-[rgb(var(--surface-soft)/0.54)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] accent-text">Rekomenduojamas ritmas</p>
          <p className="mt-2 text-sm leading-6 text-muted">{resource.rhythm}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border soft-border bg-[rgb(var(--surface)/0.62)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] accent-text">Po 7 dienų</p>
          <p className="mt-2 text-sm leading-6 text-muted">{resource.result7}</p>
        </div>
        <div className="rounded-lg border soft-border bg-[rgb(var(--surface)/0.62)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] accent-text">Po 30 dienų</p>
          <p className="mt-2 text-sm leading-6 text-muted">{resource.result30}</p>
        </div>
      </div>

      <div className="mt-auto pt-2">
        <div className="grid gap-3">
          {resource.files.map((file) => (
            <div key={file.fileName} className="soft-card rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  {formatIcon(file.format)}
                  <span className="truncate">{file.label}</span>
                </span>
                <span className="signal-pill shrink-0 px-2.5 py-1 text-[11px]">{file.format}</span>
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
  const pdfCount = activeResources.reduce(
    (total, resource) => total + resource.files.filter((file) => file.format.includes("PDF")).length,
    0,
  );
  const csvCount = activeResources.reduce(
    (total, resource) => total + resource.files.filter((file) => file.format.includes("CSV")).length,
    0,
  );

  return (
    <div className="space-y-8 pb-8">
      <section className="marketing-dark relative overflow-hidden rounded-lg px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(226,202,145,0.16),transparent_32%),linear-gradient(135deg,rgba(16,38,31,0.92),rgba(7,19,16,0.96)_58%,rgba(5,10,9,1))]" />
        <div className="relative grid gap-10 xl:grid-cols-[1fr_0.74fr] xl:items-end">
          <div>
            <span className="hero-chip">Nemokama vieša biblioteka</span>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Produktyvumo resursai aiškesnei dienai
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
              Nemokami premium planuokliai, trackeriai ir šablonai, padedantys susidėlioti prioritetus, įpročius, savaitės ritmą ir 30 dienų veiksmų planą.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Nemokama prieiga", "PDF ir Excel-compatible šablonai", "Praktiška naudoti šiandien"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/78">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#productivity-resources" className="button-primary gap-2">
                Peržiūrėti resursus
                <ArrowRight size={16} />
              </a>
              <a href="#resource-fit" className="hero-outline-button gap-2">
                Atsisiųsti šablonus
                <Download size={16} />
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
            <p className="text-sm font-semibold text-white">Vieša prieiga</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                ["Resursai", activeResources.length],
                ["PDF failai", pdfCount],
                ["CSV šablonai", csvCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-xs font-semibold uppercase text-white/44">{label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-white/60">
              Be prisijungimo, narystės reikalavimo ar užrakintų kortelių. Visi produktyvumo resursai šiame puslapyje prieinami iš karto.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Ką gausi šioje skiltyje?</span>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold sm:text-5xl">
              Ne tik failus, o aiškią pradžios sistemą dienai, savaitei ir mėnesiui.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Ši skiltis sukurta kaip premium lead magnet: pradedi nemokamai, parsisiunti praktiškus failus ir iš karto turi ką užpildyti.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {valueCards.map((card) => (
            <article key={card.title} className="marketing-mini-card">
              <card.icon size={22} className="accent-text" />
              <h3 className="mt-5 font-display text-2xl font-bold">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="productivity-resources" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Nemokami premium failai</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Planuokliai, worksheetai ir CSV šablonai</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Kiekviena kortelė paaiškina, kam resursas tinka, kokią problemą sprendžia, kaip jį naudoti ir kokį rezultatą gali pamatyti po 7 ar 30 dienų.
            </p>
          </div>
          <div className="soft-pill rounded-lg px-4 py-3 text-sm font-semibold text-muted">
            Prieinama visiems lankytojams
          </div>
        </div>

        {activeResources.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
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

      <DataTable
        title="Kuris resursas tau tinkamiausias?"
        description="Pasirink pagal tai, ką nori sutvarkyti pirmiausia: dieną, savaitę, įpročius, 30 dienų ritmą ar laiko blokus."
        columns={[
          { key: "goal", label: "Tikslas" },
          { key: "resource", label: "Rekomenduojamas resursas" },
          { key: "benefit", label: "Nauda" },
          { key: "format", label: "Forma" },
        ]}
        rows={productivityFitTable}
      />

      <DataTable
        title="30 dienų produktyvumo sistema"
        description="Paprasta mėnesio eiga, kuri padeda pradėti nuo aiškumo, tada kurti ritmą, koreguoti ir užtvirtinti tai, kas veikia."
        columns={[
          { key: "stage", label: "Etapas" },
          { key: "days", label: "Dienos" },
          { key: "focus", label: "Fokusas" },
          { key: "result", label: "Rezultatas" },
        ]}
        rows={productivitySystemTable}
      />

      <DataTable
        title="Dienos planavimo struktūra"
        description="Naudok kaip lengvą dienos karkasą, kai nori turėti kryptį be per daug sudėtingo planavimo."
        columns={[
          { key: "time", label: "Laikas" },
          { key: "action", label: "Veiksmas" },
          { key: "priority", label: "Prioritetas" },
          { key: "note", label: "Pastaba" },
        ]}
        rows={dailyPlanningTable}
      />

      <section className="public-section">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <span className="eyebrow">Kaip naudoti šiuos resursus?</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
              Pradėk mažai, stebėk savaitę, tada koreguok sistemą.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Geriausias rezultatas ateina ne iš visų failų pildymo vienu metu, o iš vieno aiškaus tikslo ir trumpo savaitės eksperimento.
            </p>
          </div>

          <div className="grid gap-3">
            {useSteps.map((step, index) => (
              <div key={step} className="soft-card grid gap-4 rounded-lg p-4 sm:grid-cols-[44px_1fr] sm:items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.12)] text-sm font-bold accent-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm font-semibold leading-6">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-dark overflow-hidden rounded-lg px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="hero-chip">StillOak Studio narystė</span>
            <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              Nori daugiau premium resursų?
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
              Ši produktyvumo skiltis yra nemokama pradžia. Narystėje gali atrakinti daugiau finansų, planavimo, verslo ir skaitmeninių produktų resursų, paruoštų gilesniam darbui ir aiškesniems sprendimams.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link to="/pricing" className="button-primary gap-2">
              Atrakinti narystę
              <ArrowRight size={16} />
            </Link>
            <Link to="/pricing" className="hero-outline-button">
              Peržiūrėti planus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductivityPage;
