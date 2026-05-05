import {
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Newspaper,
  PiggyBank,
  ShieldCheck,
  Target,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const FOCUS_STORAGE_KEY = "stilloak_bazinis_monthly_focus";
const focusOptions = ["Išlaidos", "Taupymas", "Tikslai", "Įpročiai"];
const focusMessages = {
  "Išlaidos": "Stebėk vieną pagrindinę išlaidų kryptį ir mėnesio pabaigoje pasižymėk, kas kartojosi dažniausiai.",
  "Taupymas": "Pasirink vieną realią sumą, kurią nori išsaugoti iki mėnesio pabaigos, ir laikyk ją matomoje vietoje.",
  "Tikslai": "Išsirink vieną tikslą, kurį šį mėnesį verta pajudinti mažais, aiškiais žingsniais.",
  "Įpročiai": "Susitelk į vieną pinigų įprotį: planavimą prieš pirkimą, savaitinį patikrinimą arba sąmoningesnį pauzės momentą.",
};

const availableModules = [
  {
    title: "Mėnesio apžvalga",
    text: "Pasirink paprastą mėnesio fokusą ir grįžk prie jo, kai reikia krypties.",
    label: "Pasiekiama",
    access: "Įtraukta Bazinyje",
    icon: CalendarRange,
  },
  {
    title: "Riboti skaitmeniniai resursai",
    text: "Atverk pradines mini peržiūras su praktiniais žingsniais.",
    label: "Ribota",
    access: "Ribota prieiga",
    icon: FileText,
  },
  {
    title: "Nario naujienos",
    text: "Sek aiškius narystės atnaujinimus ir kas ruošiama toliau.",
    label: "Pasiekiama",
    access: "Įtraukta Bazinyje",
    icon: Newspaper,
  },
];

const resources = [
  {
    id: "month-start",
    title: "Mėnesio pradžios kontrolinis sąrašas",
    bullets: [
      "Pasitikrink pagrindines mėnesio pajamas ir fiksuotas išlaidas.",
      "Išsirink vieną kategoriją, kurią šį mėnesį stebėsi atidžiau.",
      "Pažymėk vieną mažą veiksmą, kuris mėnesio pabaigoje duotų daugiau ramybės.",
      "Susikurk trumpą savaitinį priminimą peržiūrėti kryptį.",
    ],
  },
  {
    id: "budget-mini",
    title: "Biudžeto pasiruošimo mini gidas",
    bullets: [
      "Pradėk nuo planuojamų išlaidų, o ne nuo idealaus biudžeto.",
      "Atskirk būtinas išlaidas nuo tų, kurias gali koreguoti.",
      "Palik mažą rezervą netikėtiems pirkiniams.",
      "Jei skaičiai nepatogūs, keisk vieną eilutę, ne visą planą.",
    ],
  },
  {
    id: "goal-start",
    title: "Tikslų planavimo pradžia",
    bullets: [
      "Užrašyk tikslą viena aiškia suma arba vienu aiškiu veiksmu.",
      "Pasirink, kodėl šis tikslas svarbus būtent šį mėnesį.",
      "Padalink tikslą į mažą savaitinį žingsnį.",
      "Stebėk kryptį, o detaliam progresui naudok Asmeninį planą.",
    ],
  },
];

const updates = [
  {
    label: "Nauja",
    title: "Naujas Bazinio plano peržiūros blokas",
    text: "Bazinyje gali greitai pasižymėti mėnesio fokusą ir pamatyti pradinę kryptį.",
  },
  {
    label: "Ruošiama",
    title: "Ruošiami papildomi nario resursai",
    text: "Pradiniai gidai bus plečiami taip, kad padėtų pradėti be sudėtingos sistemos.",
  },
  {
    label: "Asmeninis",
    title: "Asmeniniame plane atsiveria pilna suvestinių sistema",
    text: "Kai norėsi daugiau struktūros, Asmeninis atrakins suvestines, tikslus ir premium resursus.",
  },
];

const lockedAsmeninisFeatures = [
  {
    title: "Pilnos suvestinės",
    text: "Automatiškesnė mėnesio analizė, platesnės įžvalgos ir aiškesnė finansų istorija.",
  },
  {
    title: "Tikslų progreso kortelės",
    text: "Detalesnis tikslų judėjimas, progreso ritmas ir aiškesni kiti žingsniai.",
  },
  {
    title: "Journal tik nariams",
    text: "Pilnas redakcinis archyvas ir gilesnės StillOak Studio pastabos.",
  },
  {
    title: "Premium skaitmeniniai resursai",
    text: "Pilni šablonai, gilesni gidai ir platesni nario turinio paketai.",
  },
];

const moneyFormatter = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const readStoredFocus = () => {
  if (typeof window === "undefined") {
    return "Taupymas";
  }

  const storedFocus = window.localStorage.getItem(FOCUS_STORAGE_KEY);
  return focusOptions.includes(storedFocus) ? storedFocus : "Taupymas";
};

const parseAmount = (value) => {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatAmount = (value) => moneyFormatter.format(Math.max(0, Math.round(value || 0)));

const BazinisMemberPage = () => {
  const [selectedFocus, setSelectedFocus] = useState(readStoredFocus);
  const [budgetForm, setBudgetForm] = useState({
    income: "",
    plannedSpending: "",
    goalAmount: "",
  });
  const [activeResourceId, setActiveResourceId] = useState(resources[0].id);

  useEffect(() => {
    window.localStorage.setItem(FOCUS_STORAGE_KEY, selectedFocus);
  }, [selectedFocus]);

  const budgetPreview = useMemo(() => {
    const income = parseAmount(budgetForm.income);
    const plannedSpending = parseAmount(budgetForm.plannedSpending);
    const goalAmount = parseAmount(budgetForm.goalAmount);
    const balance = income - plannedSpending;
    const remainingGoal = Math.max(goalAmount - Math.max(balance, 0), 0);

    return {
      balance,
      remainingGoal,
      hasValues: income > 0 || plannedSpending > 0 || goalAmount > 0,
    };
  }, [budgetForm]);

  const activeResource = resources.find((resource) => resource.id === activeResourceId) || resources[0];

  const handleBudgetChange = (field, value) => {
    setBudgetForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-8 pb-6">
      <section className="public-section overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          <div className="min-w-0">
            <span className="signal-pill">Bazinis · pradinis planas</span>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
              Bazinio nario erdvė
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Paprasta pradžia mėnesio apžvalgai, pagrindiniams resursams ir StillOak Studio naujienoms.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted">
              Bazinis veikia kaip lengvas startas: gali pasirinkti mėnesio fokusą, pasitikrinti paprastą biudžeto
              kryptį ir atsiversti ribotus pradinius resursus.
            </p>
          </div>

          <div className="soft-card rounded-[28px] p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck size={20} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">rami pradžia</p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Čia nėra pilnos Asmeninio plano automatikos. Bazinis padeda pradėti aiškiai, o gilesnė sistema lieka
                  natūraliu atnaujinimo keliu.
                </p>
                <p className="mt-5 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-muted">
                  Atšauk bet kada · Atnaujink planą bet kuriuo metu · Saugus apmokėjimas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {availableModules.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className="marketing-card flex h-full min-h-[230px] flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: "rgb(var(--surface-soft))",
                    color: "rgb(var(--accent-strong))",
                  }}
                >
                  <Icon size={20} />
                </div>
                <span className="signal-pill shrink-0">{card.label}</span>
              </div>
              <h2 className="mt-7 font-display text-2xl font-bold leading-tight sm:text-3xl">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{card.text}</p>
              <p className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-muted">
                <CheckCircle2 size={14} className="shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                {card.access}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="signal-pill">Mėnesio apžvalga</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Pasirink mėnesio fokusą</h2>
            </div>
            <CalendarRange className="hidden shrink-0 text-muted sm:block" size={24} />
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {focusOptions.map((focus) => {
              const isSelected = selectedFocus === focus;

              return (
                <button
                  key={focus}
                  type="button"
                  onClick={() => setSelectedFocus(focus)}
                  className={`rounded-[18px] border px-4 py-3 text-left text-sm font-semibold transition ${
                    isSelected
                      ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-contrast))]"
                      : "bg-white text-[rgb(var(--text))]"
                  }`}
                  style={{
                    borderColor: isSelected ? "rgb(var(--accent))" : "rgb(var(--line) / 0.82)",
                  }}
                >
                  {focus}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] bg-[rgb(var(--surface-soft))] p-5">
            <p className="text-sm font-semibold">Šio mėnesio fokusas: {selectedFocus}</p>
            <p className="mt-3 text-sm leading-7 text-muted">{focusMessages[selectedFocus]}</p>
            <p className="mt-4 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-muted">
              Bazinis planas rodo pradinę kryptį. Pilna suvestinė atsiveria Asmeniniame plane.
            </p>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="signal-pill">Biudžeto ir tikslo peržiūra</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Greitas skaičių pasitikrinimas</h2>
            </div>
            <WalletCards className="hidden shrink-0 text-muted sm:block" size={24} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Mėnesio pajamos</span>
              <input
                value={budgetForm.income}
                onChange={(event) => handleBudgetChange("income", event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="input-field"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Planuojamos išlaidos</span>
              <input
                value={budgetForm.plannedSpending}
                onChange={(event) => handleBudgetChange("plannedSpending", event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="input-field"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Tikslo suma</span>
              <input
                value={budgetForm.goalAmount}
                onChange={(event) => handleBudgetChange("goalAmount", event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="input-field"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] bg-[rgb(var(--surface-soft))] p-5">
              <div className="flex items-center gap-3">
                <PiggyBank size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Likutis po planuojamų išlaidų
                </p>
              </div>
              <p className="mt-4 font-display text-3xl font-bold">{formatAmount(Math.max(budgetPreview.balance, 0))}</p>
              {budgetPreview.balance < 0 && (
                <p className="mt-2 text-sm leading-6 text-red-600">Planuojamos išlaidos viršija įvestas pajamas.</p>
              )}
            </div>
            <div className="rounded-[22px] bg-[rgb(var(--surface-soft))] p-5">
              <div className="flex items-center gap-3">
                <Target size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Iki tikslo liko</p>
              </div>
              <p className="mt-4 font-display text-3xl font-bold">{formatAmount(budgetPreview.remainingGoal)}</p>
              {!budgetPreview.hasValues && <p className="mt-2 text-sm leading-6 text-muted">Įvesk skaičius peržiūrai.</p>}
            </div>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-muted">
            Tai Bazinio plano peržiūra. Detalios suvestinės ir progreso kortelės atsiveria Asmeniniame plane.
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-6">
          <span className="signal-pill">Riboti skaitmeniniai resursai</span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Pradiniai resursai</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Šie resursai yra trumpi, praktiški ir skirti startui. Premium šablonai ir pilni paketai lieka
            Asmeniniame plane.
          </p>

          <div className="mt-6 grid gap-3">
            {resources.map((resource) => {
              const isActive = activeResourceId === resource.id;

              return (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => setActiveResourceId(resource.id)}
                  className={`rounded-[20px] border px-4 py-4 text-left transition ${
                    isActive
                      ? "bg-[rgb(var(--surface-soft))] text-[rgb(var(--text))]"
                      : "bg-white text-[rgb(var(--text))]"
                  }`}
                  style={{
                    borderColor: isActive ? "rgb(var(--accent-strong) / 0.34)" : "rgb(var(--line) / 0.82)",
                  }}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold">{resource.title}</span>
                    <span className="signal-pill shrink-0">Peržiūra</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start gap-4">
            <FileText size={22} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">atidaryta peržiūra</p>
              <h3 className="mt-3 font-display text-3xl font-bold leading-tight">{activeResource.title}</h3>
              <ul className="mt-5 space-y-3">
                {activeResource.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm leading-7 text-muted">
                    <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-muted">
                Ribotas Bazinio resursas · Atsisiuntimai nepridėti
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="signal-pill">Nario naujienos</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Kas vyksta StillOak Studio</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted">
            Trumpi atnaujinimai, kad Bazinis jaustųsi gyvas ir aiškiai rodytų, kur juda narystė.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {updates.map((update) => (
            <div key={update.title} className="marketing-card p-6">
              <span className="signal-pill">{update.label}</span>
              <h3 className="mt-5 font-display text-2xl font-bold leading-tight">{update.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{update.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="surface-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8">
          <span className="hero-chip">Atnaujinimas</span>
          <h2 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Norisi pilnos patirties?
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
            Asmeninis planas atrakina pilną nario zoną, suvestines, tikslų korteles, Journal ir premium resursus.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
            Bazinis lieka pradžios erdve. Asmeninis yra skirtas tada, kai nori pilno mėnesio valdymo ir gilesnės
            StillOak Studio patirties.
          </p>
          <Link to="/pricing" className="button-primary mt-8 gap-2">
            Atnaujinti į Asmeninį
            <ArrowUpRight size={16} />
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-white/52">
            Atšauk bet kada · Atnaujink planą bet kuriuo metu · Saugus apmokėjimas
          </p>
        </div>

        <div className="panel p-6">
          <span className="signal-pill">Užrakinta Asmeniniame</span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Kai norėsis daugiau gylio</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {lockedAsmeninisFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[22px] border p-5"
                style={{ borderColor: "rgb(var(--line) / 0.82)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <LockKeyhole size={18} className="mt-1 shrink-0 text-muted" />
                  <span className="signal-pill shrink-0">Atrakina Asmeninis</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-tight">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BazinisMemberPage;
