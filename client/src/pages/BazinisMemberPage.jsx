import {
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
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
const CHECKLIST_STORAGE_KEY = "stilloak_bazinis_monthly_actions";
const BUDGET_STORAGE_KEY = "stilloak_bazinis_budget_preview";
const WEEKLY_ACTION_STORAGE_KEY = "stilloak_bazinis_weekly_action";
const RESOURCE_STORAGE_KEY = "stilloak_bazinis_resource_panels";

const focusOptions = ["Išlaidos", "Taupymas", "Tikslai", "Įpročiai"];
const focusMessages = {
  Išlaidos:
    "Stebėk vieną pagrindinę išlaidų kryptį ir mėnesio pabaigoje pasižymėk, kas kartojosi dažniausiai.",
  Taupymas:
    "Pasirink vieną realią sumą, kurią nori išsaugoti iki mėnesio pabaigos, ir laikyk ją matomoje vietoje.",
  Tikslai: "Išsirink vieną tikslą, kurį šį mėnesį verta pajudinti mažais, aiškiais žingsniais.",
  Įpročiai:
    "Susitelk į vieną pinigų įprotį: planavimą prieš pirkimą, savaitinį patikrinimą arba sąmoningesnę pauzę.",
};

const monthlyActions = [
  "Pasirink vieną mėnesio finansų kryptį.",
  "Užrašyk vieną sumą, kurią šį mėnesį nori išlaikyti arba sutaupyti.",
  "Paskirk 10 minučių savaitinei pinigų peržiūrai.",
];

const availableModules = [
  {
    title: "Mėnesio pradžios planas",
    text: "Fokusas, 3 aiškūs veiksmai ir matomas progresas mėnesio startui.",
    label: "Įtraukta",
    access: "Bazinio plano vertė",
    icon: CalendarRange,
  },
  {
    title: "Mini biudžeto peržiūra",
    text: "Greitai pasitikrink pajamas, išlaidas, taupymo tikslą ir likutį.",
    label: "Įtraukta",
    access: "Paprastas skaičių vaizdas",
    icon: WalletCards,
  },
  {
    title: "Bazinių resursų biblioteka",
    text: "5 trumpi išskleidžiami resursai, skirti praktiniam startui.",
    label: "Ribota",
    access: "Premium resursai lieka Asmeniniame",
    icon: FileText,
  },
];

const resources = [
  {
    id: "month-start",
    title: "Mėnesio pradžios checklist",
    summary: "Trumpas sąrašas, kad mėnuo prasidėtų su kryptimi, o ne su miglotu noru susitvarkyti.",
    bullets: [
      "Pasitikrink planuojamas pajamas ir fiksuotas išlaidas.",
      "Išsirink vieną kategoriją, kurią šį mėnesį stebėsi atidžiau.",
      "Užrašyk vieną veiksmą, kuris mėnesio pabaigoje suteiktų daugiau ramybės.",
      "Pasižymėk dieną trumpai savaitinei peržiūrai.",
    ],
  },
  {
    id: "budget-mini",
    title: "Biudžeto pasiruošimo mini gidas",
    summary: "Paprasta eiga, kaip susidėti pradinį biudžetą be sudėtingų formulių.",
    bullets: [
      "Pradėk nuo realių planuojamų išlaidų, o ne nuo tobulo biudžeto.",
      "Atskirk būtinas išlaidas nuo tų, kurias gali koreguoti.",
      "Palik mažą rezervą netikėtiems pirkiniams.",
      "Jei skaičiai nepatogūs, koreguok vieną eilutę, ne visą planą.",
    ],
  },
  {
    id: "goal-start",
    title: "Tikslų planavimo pradžia",
    summary: "Lengvas būdas vieną norą paversti aiškiu mėnesio tikslu.",
    bullets: [
      "Užrašyk tikslą viena suma arba vienu konkrečiu veiksmu.",
      "Pasirink, kodėl šis tikslas svarbus būtent šį mėnesį.",
      "Padalink tikslą į mažą savaitinį žingsnį.",
      "Detalesniam progresui naudok Asmeninį planą.",
    ],
  },
  {
    id: "spending-template",
    title: "Išlaidų peržiūros šablonas",
    summary: "Minimalus rėmas, padedantis pamatyti, kur išlaidos iš tiesų pasikartoja.",
    bullets: [
      "Užrašyk 3 didžiausias mėnesio išlaidų kategorijas.",
      "Prie kiekvienos pažymėk, ar ji būtina, lanksti, ar impulsyvi.",
      "Pasirink vieną išlaidą, kurią verta sumažinti kitą savaitę.",
      "Mėnesio pabaigoje palygink tik kryptį, ne kiekvieną centą.",
    ],
  },
  {
    id: "weekly-priorities",
    title: "Savaitės prioritetų lapas",
    summary: "Trumpas savaitės ritmas, kad finansinis planas neliktų tik mėnesio pradžioje.",
    bullets: [
      "Pasirink vieną finansinį savaitės prioritetą.",
      "Užrašyk vieną pirkimą, kurį nori atidėti arba apsvarstyti lėčiau.",
      "Pasižymėk, kada peržiūrėsi savo skaičius.",
      "Savaitės pabaigoje įvertink vieną dalyką, kuris pavyko.",
    ],
  },
];

const updates = [
  {
    label: "Nauja",
    title: "Bazinis gauna aiškesnį mėnesio startą",
    text: "Pridėtas fokusas, 3 veiksmai, mini biudžeto peržiūra ir savaitinis veiksmas.",
  },
  {
    label: "Ruošiama",
    title: "Plečiama bazinių resursų kryptis",
    text: "Trumpi checklistai ir pradiniai gidai padės Baziniam planui išlikti praktiškam be premium įrankių atrakinimo.",
  },
  {
    label: "Asmeninis",
    title: "Pilnesnės suvestinės lieka aukštesniame plane",
    text: "Asmeninis išlaiko gilesnį mėnesio valdymą, tikslų korteles, archyvą ir premium resursus.",
  },
];

const lockedAsmeninisFeatures = [
  {
    title: "Pilnos mėnesio suvestinės",
    text: "Gilesnė mėnesio analizė, platesnės įžvalgos ir aiškesnė finansų istorija.",
  },
  {
    title: "Tikslų progreso kortelės",
    text: "Detalesnis tikslų judėjimas, progreso ritmas ir aiškesni kiti žingsniai.",
  },
  {
    title: "Pilnas Nario naujienų archyvas",
    text: "Visi narystės atnaujinimai, resursų pristatymai ir programos pokyčių paaiškinimai.",
  },
  {
    title: "Premium skaitmeniniai resursai",
    text: "Pilni šablonai, gilesni gidai ir platesni nario turinio paketai.",
  },
  {
    title: "Daugiau nario įrankių",
    text: "Papildomi darbo paviršiai, kurie padeda sujungti mėnesio planą, tikslus ir veiksmus.",
  },
];

const blankBudgetForm = {
  income: "",
  plannedSpending: "",
  goalAmount: "",
};

const moneyFormatter = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const getEmptyMonthlyActionState = () =>
  monthlyActions.reduce(
    (state, item) => ({
      ...state,
      [item]: false,
    }),
    {}
  );

const getDefaultResourceState = () =>
  resources.reduce(
    (state, resource, index) => ({
      ...state,
      [resource.id]: index === 0,
    }),
    {}
  );

const readStoredFocus = () => {
  if (typeof window === "undefined") {
    return "Taupymas";
  }

  const storedFocus = window.localStorage.getItem(FOCUS_STORAGE_KEY);
  return focusOptions.includes(storedFocus) ? storedFocus : "Taupymas";
};

const readStoredChecklist = () => {
  if (typeof window === "undefined") {
    return getEmptyMonthlyActionState();
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHECKLIST_STORAGE_KEY) || "{}");
    return monthlyActions.reduce(
      (state, item) => ({
        ...state,
        [item]: Boolean(parsed[item]),
      }),
      {}
    );
  } catch (_error) {
    return getEmptyMonthlyActionState();
  }
};

const readStoredBudget = () => {
  if (typeof window === "undefined") {
    return blankBudgetForm;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(BUDGET_STORAGE_KEY) || "{}");
    return {
      income: String(parsed.income || ""),
      plannedSpending: String(parsed.plannedSpending || ""),
      goalAmount: String(parsed.goalAmount || ""),
    };
  } catch (_error) {
    return blankBudgetForm;
  }
};

const readStoredWeeklyAction = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(WEEKLY_ACTION_STORAGE_KEY) === "true";
};

const readStoredResourceState = () => {
  if (typeof window === "undefined") {
    return getDefaultResourceState();
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(RESOURCE_STORAGE_KEY) || "{}");
    const normalized = resources.reduce(
      (state, resource) => ({
        ...state,
        [resource.id]: Boolean(parsed[resource.id]),
      }),
      {}
    );

    return Object.values(normalized).some(Boolean) ? normalized : getDefaultResourceState();
  } catch (_error) {
    return getDefaultResourceState();
  }
};

const parseAmount = (value) => {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatAmount = (value) => moneyFormatter.format(Math.round(value || 0));

const BazinisMemberPage = () => {
  const [selectedFocus, setSelectedFocus] = useState(readStoredFocus);
  const [checkedItems, setCheckedItems] = useState(readStoredChecklist);
  const [budgetForm, setBudgetForm] = useState(readStoredBudget);
  const [weeklyActionDone, setWeeklyActionDone] = useState(readStoredWeeklyAction);
  const [openResourceIds, setOpenResourceIds] = useState(readStoredResourceState);

  useEffect(() => {
    window.localStorage.setItem(FOCUS_STORAGE_KEY, selectedFocus);
  }, [selectedFocus]);

  useEffect(() => {
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    window.localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetForm));
  }, [budgetForm]);

  useEffect(() => {
    window.localStorage.setItem(WEEKLY_ACTION_STORAGE_KEY, String(weeklyActionDone));
  }, [weeklyActionDone]);

  useEffect(() => {
    window.localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(openResourceIds));
  }, [openResourceIds]);

  const completedMonthlyActions = monthlyActions.filter((item) => checkedItems[item]).length;
  const monthlyProgress = Math.round((completedMonthlyActions / monthlyActions.length) * 100);

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

  const handleBudgetChange = (field, value) => {
    setBudgetForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleChecklistToggle = (item) => {
    setCheckedItems((current) => ({
      ...current,
      [item]: !current[item],
    }));
  };

  const handleResourceToggle = (resourceId) => {
    setOpenResourceIds((current) => ({
      ...current,
      [resourceId]: !current[resourceId],
    }));
  };

  return (
    <div className="space-y-8 pb-6">
      <section className="public-section overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="signal-pill">Bazinis planas</span>
              <span className="signal-pill">5.99 €/mėn.</span>
              <span className="signal-pill">Ribota prieiga</span>
              <span className="signal-pill">Galima atnaujinti bet kada</span>
            </div>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Bazinio nario erdvė
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Mokama pradžia su konkrečiais mėnesio veiksmais, mini biudžetu ir baziniais resursais, kurie padeda
              pajudėti jau šiandien.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted">
              Bazinis neatrakina premium sistemos, tačiau suteikia aiškią, naudingą darbo vietą: fokusą, paprastus
              skaičius, savaitės veiksmą ir ribotas nario naujienų peržiūras.
            </p>
          </div>

          <div className="soft-card rounded-lg p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck size={20} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted">rami pradžia</p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Bazinis yra praktiškas įėjimas į nario zoną. Asmeninis lieka aiškiai gilesnis: su pilnomis
                  suvestinėmis, progreso kortelėmis, archyvu ir premium resursais.
                </p>
                <p className="mt-5 text-xs font-semibold uppercase leading-5 text-muted">
                  Saugus apmokėjimas · Atšauk bet kada · Jokių paslėptų mokesčių
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
            <div key={card.title} className="marketing-card flex h-full min-h-[220px] flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "rgb(var(--surface-soft))",
                    color: "rgb(var(--accent-strong))",
                  }}
                >
                  <Icon size={20} />
                </div>
                <span className="signal-pill shrink-0">{card.label}</span>
              </div>
              <h2 className="mt-7 font-display text-2xl font-bold leading-tight">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{card.text}</p>
              <p className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold uppercase leading-5 text-muted">
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
              <span className="signal-pill">Mėnesio pradžios planas</span>
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
                  className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                    isSelected
                      ? "bg-[rgb(var(--accent))] text-white"
                      : "bg-[rgb(var(--surface))] text-[rgb(var(--text))]"
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

          <div className="mt-6 rounded-lg bg-[rgb(var(--surface-soft))] p-5">
            <p className="text-sm font-semibold">Šio mėnesio fokusas: {selectedFocus}</p>
            <p className="mt-3 text-sm leading-7 text-muted">{focusMessages[selectedFocus]}</p>
          </div>

          <div className="mt-6 rounded-lg border p-5" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold">3 paprasti mėnesio veiksmai</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Bazinis vertingas tada, kai padeda užbaigti mažus, realius žingsnius.
                </p>
              </div>
              <span className="signal-pill shrink-0">
                {completedMonthlyActions}/{monthlyActions.length}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgb(var(--surface-soft))]">
              <div
                className="h-full rounded-full bg-[rgb(var(--accent))] transition-all"
                style={{ width: `${monthlyProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold uppercase leading-5 text-muted">{monthlyProgress}% atlikta</p>

            <div className="mt-4 space-y-2">
              {monthlyActions.map((item) => {
                const isChecked = Boolean(checkedItems[item]);

                return (
                  <label
                    key={item}
                    className="flex cursor-pointer items-start gap-3 rounded-lg bg-[rgb(var(--surface-soft))] px-4 py-3 text-sm leading-6 text-muted"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleChecklistToggle(item)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]"
                    />
                    <span className={isChecked ? "line-through opacity-70" : ""}>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="signal-pill">Mini biudžeto peržiūra</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Greitas skaičių pasitikrinimas</h2>
            </div>
            <WalletCards className="hidden shrink-0 text-muted sm:block" size={24} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Planuojamos pajamos</span>
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
              <span className="text-sm font-semibold text-muted">Taupymo tikslas</span>
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
            <div className="rounded-lg bg-[rgb(var(--surface-soft))] p-5">
              <div className="flex items-center gap-3">
                <PiggyBank size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="text-xs font-semibold uppercase text-muted">Likutis po išlaidų</p>
              </div>
              <p className="mt-4 break-words font-display text-3xl font-bold">{formatAmount(budgetPreview.balance)}</p>
              {budgetPreview.balance < 0 && (
                <p className="mt-2 text-sm leading-6 text-red-600">Planuojamos išlaidos viršija įvestas pajamas.</p>
              )}
            </div>
            <div className="rounded-lg bg-[rgb(var(--surface-soft))] p-5">
              <div className="flex items-center gap-3">
                <Target size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="text-xs font-semibold uppercase text-muted">Iki tikslo liko</p>
              </div>
              <p className="mt-4 break-words font-display text-3xl font-bold">
                {formatAmount(budgetPreview.remainingGoal)}
              </p>
              {!budgetPreview.hasValues && <p className="mt-2 text-sm leading-6 text-muted">Įvesk skaičius peržiūrai.</p>}
            </div>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase leading-5 text-muted">
            Supaprastinta Bazinio plano peržiūra. Pilnos suvestinės ir progreso kortelės atsiveria Asmeniniame plane.
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="panel p-6">
          <span className="signal-pill">Bazinių resursų biblioteka</span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight">5 pradiniai resursai</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Trumpi, išskleidžiami resursai skirti startui. Jie suteikia aiškią naudą Baziniame plane, bet neatrakina
            premium šablonų ar pilnų paketų.
          </p>

          <div className="mt-6 space-y-3">
            {resources.map((resource) => {
              const isOpen = Boolean(openResourceIds[resource.id]);

              return (
                <div key={resource.id} className="rounded-lg border bg-[rgb(var(--surface))]" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
                  <button
                    type="button"
                    onClick={() => handleResourceToggle(resource.id)}
                    className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-6">{resource.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted">{resource.summary}</span>
                    </span>
                    <ChevronDown
                      size={18}
                      className={`mt-1 shrink-0 text-muted transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t px-4 pb-4 pt-2" style={{ borderColor: "rgb(var(--line) / 0.72)" }}>
                      <ul className="space-y-3">
                        {resource.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3 text-sm leading-7 text-muted">
                            <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs font-semibold uppercase leading-5 text-muted">
                        Bazinis resursas · Atsisiuntimai ir premium paketai nepridėti
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel p-6">
            <span className="signal-pill">Šios savaitės veiksmas</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Vienas konkretus žingsnis</h2>
            <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-lg bg-[rgb(var(--surface-soft))] p-5">
              <input
                type="checkbox"
                checked={weeklyActionDone}
                onChange={() => setWeeklyActionDone((current) => !current)}
                className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--accent))]"
              />
              <span className="min-w-0">
                <span className={`block text-base font-semibold leading-7 ${weeklyActionDone ? "line-through opacity-70" : ""}`}>
                  Peržiūrėk 3 didžiausias išlaidas ir nuspręsk, kurią gali sumažinti.
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted">
                  Viena užbaigta užduotis per savaitę padeda Baziniam planui jaustis kaip reali pagalba, ne tik peržiūra.
                </span>
              </span>
            </label>
          </div>

          <div className="marketing-card p-6">
            <span className="signal-pill">Bazinio riba</span>
            <h3 className="mt-4 font-display text-2xl font-bold leading-tight">Paprasta nauda be premium atrakinimo</h3>
            <p className="mt-4 text-sm leading-7 text-muted">
              Ši erdvė padeda pradėti, bet sąmoningai nepakeičia Asmeninio plano: nėra pilnų suvestinių, tikslų
              progreso kortelių ar premium resursų.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5" id="nario-naujienos-preview">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="signal-pill">Nario naujienos preview</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Kas vyksta StillOak Studio</h2>
          </div>
          <div className="max-w-xl">
            <p className="text-sm leading-6 text-muted">
              Ribotos peržiūros rodo narystės kryptį. Pilnas archyvas ir detalūs įrašai lieka Asmeniniame ir Privataus
              verslo planuose.
            </p>
            <Link to="/journal" className="button-secondary mt-4 gap-2">
              Peržiūrėti Nario naujienas
              <ArrowUpRight size={16} />
            </Link>
          </div>
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
        <div className="surface-dark overflow-hidden rounded-lg px-6 py-8 sm:px-8">
          <span className="hero-chip">Užrakinta Asmeniniame</span>
          <h2 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Norisi pilnos programos?
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
            Asmeninis planas atrakina pilną nario zoną, mėnesio suvestines, tikslų korteles, nario naujienų archyvą ir
            premium resursus.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
            Bazinis lieka naudingas startas. Asmeninis yra skirtas tada, kai nori gilesnio mėnesio valdymo ir daugiau
            nario įrankių.
          </p>
          <Link to="/pricing" className="button-primary mt-8 gap-2">
            Atnaujinti į Asmeninį
            <ArrowUpRight size={16} />
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase leading-5 text-white/52">
            Saugus apmokėjimas · Atšauk bet kada · Jokių paslėptų mokesčių
          </p>
        </div>

        <div className="panel p-6">
          <span className="signal-pill">Kas atsiveria Asmeniniame</span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Aiškiai daugiau nei Bazinis</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {lockedAsmeninisFeatures.map((feature) => (
              <div key={feature.title} className="rounded-lg border p-5" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
                <div className="flex items-start justify-between gap-3">
                  <LockKeyhole size={18} className="mt-1 shrink-0 text-muted" />
                  <span className="signal-pill shrink-0">Asmeninis</span>
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
