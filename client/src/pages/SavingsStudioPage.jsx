import {
  AlertTriangle,
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
  Mail,
  PiggyBank,
  Pencil,
  Plus,
  Repeat,
  ShieldCheck,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import savingsStudioService from "../services/savingsStudioService";
import {
  buildMonthOptions,
  currentDateInput,
  currentMonthKey,
  dateFormatter,
  DEFAULT_CATEGORIES,
  DEFAULT_FOCUS_OPTIONS,
  DEFAULT_RECURRING_FREQUENCIES,
  emptyEntry,
  emptyGoal,
  emptyRecurringExpense,
  formatChange,
  formatRecurringFrequency,
  getBudgetStatus,
  getGoalProgress,
  money,
  parseSavingsCsvText,
  recurringMonthlyEquivalent,
} from "../components/savings/savingsStudioHelpers";

const ONBOARDING_BUDGET_CATEGORIES = ["Būstas", "Maistas", "Transportas"];
const ONBOARDING_STEPS = [
  {
    key: "base",
    eyebrow: "step 1",
    title: "Susidėk finansinį pagrindą",
    description: "Pradėk nuo dviejų skaičių: kiek uždirbi per mėnesį ir kiek realiai nori atsidėti.",
  },
  {
    key: "focus",
    eyebrow: "step 2",
    title: "Pasirink kryptį ir pirmus limitus",
    description: "Nusistatyk pagrindinį fokusą ir pirmas 3 kategorijas, kurias nori suvaldyti greičiausiai.",
  },
  {
    key: "review",
    eyebrow: "step 3",
    title: "Patvirtink pirmo mėnesio planą",
    description: "Prieš atidarant pilną studio, dar kartą peržiūrėk, kaip atrodys tavo pirmas mėnuo.",
  },
];
const USAGE_WIZARD_STORAGE_KEY = "savings_studio_usage_wizard_seen";
const USAGE_WIZARD_STEPS = [
  {
    key: "setup",
    eyebrow: "step 1",
    title: "Susikurk pirmo mėnesio pagrindą",
    description:
      "Pirmiausia susivesk mėnesio pajamas, taupymo tikslą ir tris svarbiausias biudžeto kategorijas. Tai sukuria visą likusį Stilloak kontekstą.",
    bullets: [
      "Įrašyk mėnesio pajamas ir kiek nori atsidėti.",
      "Pasirink pagrindinį finansinį fokusą.",
      "Nusistatyk pirmas 3 biudžeto ribas.",
    ],
    targetId: "savings-setup",
  },
  {
    key: "ledger",
    eyebrow: "step 2",
    title: "Pradėk nuo realių išlaidų įrašymo",
    description:
      "Kai pradedi pildyti realius pirkinius, programa pradeda rodyti ne teoriją, o tavo tikrą išlaidų vaizdą.",
    bullets: [
      "Pridėk bent 5–10 paskutinių išlaidų.",
      "Naudok kategorijas nuosekliai.",
      "Jei turi daug duomenų, vietoje rankinio vedimo naudok CSV importą.",
    ],
    targetId: "savings-ledger",
  },
  {
    key: "budgets",
    eyebrow: "step 3",
    title: "Sujunk biudžetus su pastoviomis išlaidomis",
    description:
      "Čia atsiranda tikras spaudimo vaizdas: ne tik kiek jau išleidai, bet ir kiek dar suvalgys recurring mokėjimai.",
    bullets: [
      "Nustatyk biudžeto ribas kiekvienai svarbiai kategorijai.",
      "Pridėk nuomą, prenumeratas ir kitus pastovius mokėjimus.",
      "Kai recurring nuskaičiuojamas, paversk jį tikru mėnesio įrašu vienu mygtuku.",
    ],
    targetId: "savings-budgets",
  },
  {
    key: "insights",
    eyebrow: "step 4",
    title: "Naudok įžvalgas ir tikslus sprendimams",
    description:
      "Stilloak turi padėti taupyti, ne tik kaupti skaičius. Todėl svarbiausia vieta yra įžvalgos, tikslų tempas ir savaitinis mėnesio ritmas.",
    bullets: [
      "Stebėk, kurios kategorijos labiausiai spaudžia mėnesį.",
      "Sek, ar taupymo tempas užtenka tavo tikslams.",
      "Žiūrėk, kuri mėnesio savaitė išleidžia daugiausia.",
    ],
    targetId: "savings-analytics",
  },
  {
    key: "automation",
    eyebrow: "step 5",
    title: "Įsijunk automatizaciją ir atsarginę kopiją",
    description:
      "Kai bazė jau sukurta, verta įjungti automatiką, kad programa pati dirbtų tavo naudai ir turėtum atsarginę duomenų kopiją.",
    bullets: [
      "Įjunk savaitines arba mėnesines email suvestines.",
      "Prieš didesnius importus naudok CSV preview.",
      "Kartais atsisiųsk JSON backup savo duomenims.",
    ],
    targetId: "savings-automation",
  },
];
const FUTURE_MONTH_FORMATTER = new Intl.DateTimeFormat("lt-LT", {
  month: "long",
  year: "numeric",
});
const MONTH_KEY_FORMATTER = new Intl.DateTimeFormat("lt-LT", {
  month: "long",
  year: "numeric",
});
const ACTIVITY_TIME_FORMATTER = new Intl.DateTimeFormat("lt-LT", {
  dateStyle: "medium",
  timeStyle: "short",
});

const roundScenarioAmount = (value) => {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 0;
  }

  if (numericValue < 20) {
    return Math.ceil(numericValue);
  }

  return Math.ceil(numericValue / 10) * 10;
};

const formatFutureMonthLabel = (monthsAhead) => {
  if (!Number.isFinite(monthsAhead) || monthsAhead <= 0) {
    return "dabar";
  }

  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + Math.max(monthsAhead - 1, 0));
  return FUTURE_MONTH_FORMATTER.format(date);
};

const shiftMonthKey = (monthKey, delta) => {
  if (!monthKey || !monthKey.includes("-")) {
    return currentMonthKey();
  }

  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return currentMonthKey();
  }

  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

const formatMonthKeyLabel = (monthKey) => {
  if (!monthKey || !monthKey.includes("-")) {
    return "šis mėnuo";
  }

  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return monthKey;
  }

  return MONTH_KEY_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1)));
};

const monthsUntilTargetDate = (targetDate) => {
  if (!targetDate) {
    return null;
  }

  const current = new Date();
  const target = new Date(`${targetDate}T00:00:00`);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const yearDiff = target.getFullYear() - current.getFullYear();
  const monthDiff = target.getMonth() - current.getMonth();
  const rawMonths = yearDiff * 12 + monthDiff + 1;

  return Math.max(rawMonths, 1);
};

const goalPaceStatusLabel = (status) => {
  if (status === "behind") {
    return "Per lėtas tempas";
  }

  if (status === "tight") {
    return "Ant ribos";
  }

  return "Juda gerai";
};

const describeSavingsActivity = (log, recurringFrequencies) => {
  const metadata = log?.metadata || {};
  const amountLabel =
    metadata.amount !== undefined && metadata.amount !== null ? money.format(Number(metadata.amount || 0)) : null;

  const activityMap = {
    "entry-create": {
      title: "Pridėjai naują išlaidą",
      body: amountLabel
        ? `${metadata.category || "Kategorija"} · ${amountLabel}`
        : metadata.category || "Naujas įrašas ledger dalyje",
      tone: "info",
      targetId: "savings-ledger",
      ctaLabel: "Rodyti ledger",
    },
    "entry-import": {
      title: "Importavai išlaidas iš CSV",
      body: `${metadata.importedCount || 0} nauji įrašai per vieną veiksmą.`,
      tone: "success",
      targetId: "savings-ledger",
      ctaLabel: "Peržiūrėti įrašus",
    },
    "entry-update": {
      title: "Atnaujinai išlaidos įrašą",
      body: amountLabel
        ? `${metadata.category || "Kategorija"} · ${amountLabel}`
        : metadata.category || "Atnaujintas ledger įrašas",
      tone: "info",
      targetId: "savings-ledger",
      ctaLabel: "Rodyti įrašą",
    },
    "entry-delete": {
      title: "Ištrynėi išlaidos įrašą",
      body: "Ledger istorija buvo pakoreguota rankiniu veiksmu.",
      tone: "warning",
      targetId: "savings-ledger",
      ctaLabel: "Atidaryti ledger",
    },
    "goal-create": {
      title: "Sukūrei naują taupymo tikslą",
      body: metadata.targetAmount ? `Tikslas iki ${money.format(Number(metadata.targetAmount || 0))}.` : "Naujas tikslas jau aktyvus.",
      tone: "success",
      targetId: "savings-goals",
      ctaLabel: "Atidaryti tikslus",
    },
    "goal-update": {
      title: "Pakoregavai taupymo tikslą",
      body:
        metadata.currentAmount !== undefined
          ? `Sukaupta ${money.format(Number(metadata.currentAmount || 0))} iš ${money.format(
              Number(metadata.targetAmount || 0)
            )}.`
          : "Tikslas atnaujintas pagal naują planą.",
      tone: "info",
      targetId: "savings-goals",
      ctaLabel: "Peržiūrėti tikslą",
    },
    "goal-delete": {
      title: "Pašalinai taupymo tikslą",
      body: "Šis tikslas nebedalyvauja tavo mėnesio plane.",
      tone: "warning",
      targetId: "savings-goals",
      ctaLabel: "Peržiūrėti tikslus",
    },
    "recurring-create": {
      title: "Pridėjai recurring išlaidą",
      body: `${formatRecurringFrequency(metadata.frequency, recurringFrequencies)} · ${money.format(
        Number(metadata.amount || 0)
      )}`,
      tone: "success",
      targetId: "savings-recurring",
      ctaLabel: "Atidaryti recurring",
    },
    "recurring-update": {
      title: "Atnaujinai recurring išlaidą",
      body: `${formatRecurringFrequency(metadata.frequency, recurringFrequencies)} · ${money.format(
        Number(metadata.amount || 0)
      )}`,
      tone: "info",
      targetId: "savings-recurring",
      ctaLabel: "Peržiūrėti recurring",
    },
    "recurring-log-to-entry": {
      title: "Recurring mokėjimą perkėlei į ledger",
      body: metadata.amount ? `${money.format(Number(metadata.amount || 0))} įrašyta į mėnesio išlaidas.` : "Recurring išlaida tapo realiu ledger įrašu.",
      tone: "success",
      targetId: "savings-ledger",
      ctaLabel: "Rodyti ledger",
    },
    "recurring-delete": {
      title: "Pašalinai recurring įrašą",
      body: "Pastovių išlaidų sąrašas buvo sutrumpintas.",
      tone: "warning",
      targetId: "savings-recurring",
      ctaLabel: "Peržiūrėti recurring",
    },
    "backup-export": {
      title: "Atsisiuntei JSON backup",
      body: `${metadata.entryCount || 0} išlaidų, ${metadata.goalCount || 0} tikslai ir ${metadata.recurringCount || 0} recurring įrašai.`,
      tone: "info",
      targetId: "savings-automation",
      ctaLabel: "Atidaryti automatizaciją",
    },
    "summary-export": {
      title: "Atsisiuntei suvestinę",
      body: `${metadata.frequency === "monthly" ? "Mėnesio" : "Savaitės"} suvestinė (${metadata.format || "html"}).`,
      tone: "success",
      targetId: "savings-automation",
      ctaLabel: "Peržiūrėti suvestines",
    },
    "summary-email-manual": {
      title: "Išsiuntei suvestinę el. paštu",
      body: `${metadata.frequency === "monthly" ? "Mėnesio" : "Savaitės"} suvestinė išėjo rankiniu veiksmu.`,
      tone: metadata.skipped ? "warning" : "success",
      targetId: "savings-automation",
      ctaLabel: "Atidaryti siuntimą",
    },
    "summary-email-manual-skipped": {
      title: "Suvestinės laiškas buvo praleistas",
      body: metadata.reason || "Programa šį kartą neišsiuntė laiško.",
      tone: "warning",
      targetId: "savings-automation",
      ctaLabel: "Peržiūrėti nustatymus",
    },
    "summary-email-initial-failed": {
      title: "Automatinė suvestinė nesusisiuntė",
      body: metadata.message || "Pirmas bandymas nepavyko, verta peržiūrėti email nustatymus.",
      tone: "warning",
      targetId: "savings-automation",
      ctaLabel: "Atidaryti email nustatymus",
    },
  };

  const fallback = {
    title: "Užfiksuotas naujas veiksmas",
    body: "Stilloak išsaugojo dar vieną tavo nario zonos pokytį.",
    tone: "info",
    targetId: "savings-analytics",
    ctaLabel: "Atidaryti studio",
  };

  return {
    ...(activityMap[log?.action] || fallback),
    timestamp: log?.createdAt ? ACTIVITY_TIME_FORMATTER.format(new Date(log.createdAt)) : "Ką tik",
  };
};

const SavingsStudioPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [focusOptions, setFocusOptions] = useState(DEFAULT_FOCUS_OPTIONS);
  const [recurringFrequencies, setRecurringFrequencies] = useState(DEFAULT_RECURRING_FREQUENCIES);
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [profileForm, setProfileForm] = useState({
    monthlyIncome: "",
    monthlySavingsTarget: "",
    primaryFocus: DEFAULT_FOCUS_OPTIONS[0],
  });
  const [emailSettingsForm, setEmailSettingsForm] = useState({
    summaryEmailsEnabled: false,
    summaryEmailFrequency: "weekly",
  });
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [budgetInputs, setBudgetInputs] = useState({});
  const [goals, setGoals] = useState([]);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [editingGoalId, setEditingGoalId] = useState("");
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [recurringForm, setRecurringForm] = useState(() => emptyRecurringExpense(DEFAULT_CATEGORIES));
  const [editingRecurringId, setEditingRecurringId] = useState("");
  const [entryForm, setEntryForm] = useState(() => emptyEntry(DEFAULT_CATEGORIES));
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "Visos kategorijos",
    month: "all",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingBudgets, setSavingBudgets] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [savingRecurring, setSavingRecurring] = useState(false);
  const [savingEmailSettings, setSavingEmailSettings] = useState(false);
  const [sendingSummaryEmail, setSendingSummaryEmail] = useState(false);
  const [downloadingSummaryKey, setDownloadingSummaryKey] = useState("");
  const [previewingCsv, setPreviewingCsv] = useState(false);
  const [confirmingCsvImport, setConfirmingCsvImport] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [csvPreviewResult, setCsvPreviewResult] = useState(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [loggingRecurringId, setLoggingRecurringId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [deletingGoalId, setDeletingGoalId] = useState("");
  const [deletingRecurringId, setDeletingRecurringId] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [usageWizardOpen, setUsageWizardOpen] = useState(false);
  const [usageWizardStep, setUsageWizardStep] = useState(0);
  const [usageWizardReady, setUsageWizardReady] = useState(false);

  const deferredSearch = useDeferredValue(filters.search.trim().toLowerCase());
  const selectedBudgetMonth = filters.month === "all" ? currentMonthKey() : filters.month;

  useEffect(() => {
    const loadStudio = async () => {
      try {
        setLoading(true);

        const [metaResult, profileResult, entriesResult, summaryResult, budgetsResult, goalsResult, recurringResult, activityResult] =
          await Promise.all([
            savingsStudioService.getMeta(),
            savingsStudioService.getProfile(),
            savingsStudioService.getEntries(),
            savingsStudioService.getSummary(),
            savingsStudioService.getBudgets(currentMonthKey()),
            savingsStudioService.getGoals(),
            savingsStudioService.getRecurringExpenses(),
            savingsStudioService.getActivity(),
          ]);

        startTransition(() => {
          const apiCategories = metaResult.categories?.length ? metaResult.categories : DEFAULT_CATEGORIES;
          const apiFocusOptions = metaResult.focusOptions?.length
            ? metaResult.focusOptions
            : DEFAULT_FOCUS_OPTIONS;
          const apiRecurringFrequencies = metaResult.recurringFrequencies?.length
            ? metaResult.recurringFrequencies
            : DEFAULT_RECURRING_FREQUENCIES;

          setCategories(apiCategories);
          setFocusOptions(apiFocusOptions);
          setRecurringFrequencies(apiRecurringFrequencies);
          setProfile(profileResult.profile || null);
          setActivity(activityResult.activity || []);
          setProfileForm({
            monthlyIncome: profileResult.profile?.monthlyIncome ? String(profileResult.profile.monthlyIncome) : "",
            monthlySavingsTarget: profileResult.profile?.monthlySavingsTarget
              ? String(profileResult.profile.monthlySavingsTarget)
              : "",
            primaryFocus: profileResult.profile?.primaryFocus || apiFocusOptions[0] || "",
          });
          setEmailSettingsForm({
            summaryEmailsEnabled: Boolean(profileResult.profile?.summaryEmailsEnabled),
            summaryEmailFrequency: profileResult.profile?.summaryEmailFrequency || "weekly",
          });
          setEntries(entriesResult.entries || []);
          setSummary(summaryResult.summary || null);
          setBudgets(budgetsResult.budgets || []);
          setBudgetInputs(
            Object.fromEntries((budgetsResult.budgets || []).map((budget) => [budget.category, String(budget.limitAmount)]))
          );
          setGoals(goalsResult.goals || []);
          setRecurringExpenses(recurringResult.recurringExpenses || []);
          setRecurringForm(emptyRecurringExpense(apiCategories));
          setEntryForm((current) => ({
            ...current,
            category: current.category || apiCategories[1] || apiCategories[0] || "Maistas",
            date: current.date || currentDateInput(),
          }));
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Nepavyko užkrauti Stilloak.");
      } finally {
        setLoading(false);
      }
    };

    loadStudio();
  }, []);

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const budgetResult = await savingsStudioService.getBudgets(selectedBudgetMonth);
        setBudgets(budgetResult.budgets || []);
        setBudgetInputs(
          Object.fromEntries((budgetResult.budgets || []).map((budget) => [budget.category, String(budget.limitAmount)]))
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Nepavyko užkrauti biudžetų.");
      }
    };

    if (!loading) {
      loadBudgets();
    }
  }, [loading, selectedBudgetMonth]);

  useEffect(() => {
    if (searchParams.get("welcome") === "membership") {
      toast.success("Narystė aktyvuota. Stilloak laukia tavo pirmo setup.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (loading || usageWizardReady) {
      return;
    }

    const hasSeenWizard = window.localStorage.getItem(USAGE_WIZARD_STORAGE_KEY) === "true";
    const shouldOpenBecauseOfMembership = searchParams.get("welcome") === "membership";

    if (shouldOpenBecauseOfMembership || !hasSeenWizard) {
      setUsageWizardStep(profile?.onboardingCompleted ? 1 : 0);
      setUsageWizardOpen(true);
    }

    setUsageWizardReady(true);
  }, [loading, profile?.onboardingCompleted, searchParams, usageWizardReady]);

  const monthChoices = useMemo(() => buildMonthOptions(entries), [entries]);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const matchesSearch =
          !deferredSearch ||
          entry.title.toLowerCase().includes(deferredSearch) ||
          entry.notes.toLowerCase().includes(deferredSearch);
        const matchesCategory =
          filters.category === "Visos kategorijos" || entry.category === filters.category;
        const matchesMonth = filters.month === "all" || entry.date.startsWith(filters.month);

        return matchesSearch && matchesCategory && matchesMonth;
      }),
    [deferredSearch, entries, filters.category, filters.month]
  );

  const filteredTotal = filteredEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const selectedMonthEntries = entries.filter((entry) => entry.date.startsWith(selectedBudgetMonth));
  const recurringByCategory = useMemo(
    () =>
      summary?.recurringByCategory ||
      recurringExpenses.reduce((totals, recurringExpense) => {
        const nextTotals = { ...totals };
        nextTotals[recurringExpense.category] =
          (nextTotals[recurringExpense.category] || 0) +
          Number(recurringExpense.monthlyEquivalent || recurringMonthlyEquivalent(recurringExpense));
        return nextTotals;
      }, {}),
    [recurringExpenses, summary?.recurringByCategory]
  );
  const spentByCategory = useMemo(
    () =>
      selectedMonthEntries.reduce((totals, entry) => {
        const nextTotals = { ...totals };
        nextTotals[entry.category] = (nextTotals[entry.category] || 0) + Number(entry.amount);
        return nextTotals;
      }, {}),
    [selectedMonthEntries]
  );

  const budgetProgress = useMemo(
    () =>
      categories
        .map((category) => {
          const budget = budgets.find((entry) => entry.category === category);
          const actualSpent = Number(spentByCategory[category] || 0);
          const recurringCommitted = Number(recurringByCategory[category] || 0);
          const limitAmount = Number(budget?.limitAmount || 0);
          const projectedSpent = Number((actualSpent + recurringCommitted).toFixed(2));
          const remaining = limitAmount ? Number((limitAmount - projectedSpent).toFixed(2)) : 0;
          const percentUsed = limitAmount ? Math.min((projectedSpent / limitAmount) * 100, 100) : 0;

          return {
            category,
            actualSpent,
            recurringCommitted,
            spent: projectedSpent,
            projectedSpent,
            limitAmount,
            remaining,
            percentUsed,
            status: getBudgetStatus({ spent: projectedSpent, limitAmount }),
          };
        })
        .filter((entry) => entry.limitAmount > 0 || entry.actualSpent > 0 || entry.recurringCommitted > 0),
    [budgets, categories, recurringByCategory, spentByCategory]
  );

  const budgetOverview = {
    setCount: budgetProgress.filter((entry) => entry.limitAmount > 0).length,
    overCount: budgetProgress.filter((entry) => entry.status === "over").length,
    warningCount: budgetProgress.filter((entry) => entry.status === "warning").length,
  };

  const decoratedGoals = goals.map((goal) => ({
    ...goal,
    ...getGoalProgress(goal),
  }));
  const goalPace = summary?.goalPace || null;
  const safeToSaveAfterRecurring = summary?.safeToSaveAfterRecurring;
  const projectedMonthTotal = summary?.projectedMonthTotal || 0;
  const recurringMonthlyTotal =
    summary?.recurringMonthlyTotal ??
    recurringExpenses.reduce(
      (sum, recurringExpense) =>
        sum + Number(recurringExpense.monthlyEquivalent || recurringMonthlyEquivalent(recurringExpense)),
      0
    );
  const fixedVsFlexible = summary?.fixedVsFlexible || {
    loggedRecurring: 0,
    recurringRemaining: 0,
    fixedProjected: 0,
    flexibleSpent: 0,
  };
  const categoryPressure = summary?.categoryPressure || [];
  const savingsCapacity = summary?.savingsCapacity || null;
  const monthlyTotals = summary?.monthlyTotals || [];
  const categoryTotals = summary?.categoryTotals || [];
  const summaryInsights = summary?.insights || [];
  const availableToSave = summary?.availableToSave;
  const highestMonthlyTotal = Math.max(...monthlyTotals.map((entry) => entry.total), 1);
  const activeGoalsCount = decoratedGoals.filter((goal) => !goal.complete).length;
  const currentRecurringMonth = currentMonthKey();
  const weeklyTotalsCurrentMonth = summary?.weeklyTotalsCurrentMonth || [];
  const highestWeeklyTotal = Math.max(...weeklyTotalsCurrentMonth.map((entry) => Number(entry.total || 0)), 1);
  const topPressure = categoryPressure[0] || null;
  const recurringForecastItems = useMemo(
    () =>
      recurringExpenses
        .map((expense) => {
          const monthlyEquivalent = Number(
            expense.monthlyEquivalent || recurringMonthlyEquivalent(expense)
          );

          return {
            ...expense,
            monthlyEquivalent,
            annualEquivalent: Number((monthlyEquivalent * 12).toFixed(2)),
          };
        })
        .sort((left, right) => right.monthlyEquivalent - left.monthlyEquivalent),
    [recurringExpenses]
  );
  const recurringAnnualTotal = recurringForecastItems.reduce(
    (sum, expense) => sum + Number(expense.annualEquivalent || 0),
    0
  );
  const recurringShareOfIncome =
    profile?.monthlyIncome > 0 ? Math.round((recurringMonthlyTotal / profile.monthlyIncome) * 100) : null;
  const nextActions = useMemo(() => {
    const actions = [];

    if (topPressure) {
      actions.push({
        key: `pressure-${topPressure.category}`,
        title:
          topPressure.status === "over"
            ? `Sustabdyk ${topPressure.category.toLowerCase()} tempą`
            : `Pristabdyk ${topPressure.category.toLowerCase()} kategoriją`,
        body:
          topPressure.status === "over"
            ? `${topPressure.category} jau valgo ${money.format(topPressure.projectedSpent)} iš ${money.format(
                topPressure.limitAmount
              )} limito. Čia dabar greičiausiai dingsta mėnesio rezervas.`
            : `${topPressure.category} jau artėja prie ribos ir sudaro ${topPressure.shareOfProjected}% projekcinio mėnesio.`,
        meta:
          topPressure.status === "over"
            ? `Viršyta ${money.format(Math.abs(topPressure.projectedSpent - topPressure.limitAmount))}`
            : `${money.format(topPressure.projectedSpent)} iš ${money.format(topPressure.limitAmount)}`,
        tone: topPressure.status === "over" ? "danger" : "warning",
        targetId: "savings-ledger",
        ctaLabel: "Rodyti įrašus",
        focusCategory: topPressure.category,
        focusMonth: selectedBudgetMonth,
      });
    }

    if (goalPace) {
      actions.push({
        key: "goal-pace",
        title:
          goalPace.status === "behind"
            ? `Pakelk ${goalPace.title} tempą`
            : goalPace.status === "tight"
            ? `Apsaugok rezervą tikslui „${goalPace.title}“`
            : `Laikyk dabartinį „${goalPace.title}“ ritmą`,
        body:
          goalPace.status === "behind"
            ? `Kad spėtum, reikėtų bent ${money.format(goalPace.recommendedMonthly)} per mėnesį. Dabartinis rezervas to dar nelaiko.`
            : goalPace.status === "tight"
            ? `Tikslas dar pasiekiamas, bet riba jau arti. Saugok bent ${money.format(
                goalPace.recommendedMonthly
              )} per mėnesį nuo spontaniškų pirkimų.`
            : `Dabartinis taupymo tempas atrodo tvarus. Toliau laikyk bent ${money.format(
                goalPace.recommendedMonthly
              )} per mėnesį.`,
        meta: goalPace.targetDate ? `Tikslas iki ${goalPace.targetDate}` : "Be fiksuotos datos",
        tone: goalPace.status === "behind" ? "danger" : goalPace.status === "tight" ? "warning" : "success",
        targetId: "savings-goals",
        ctaLabel: "Atidaryti tikslus",
      });
    }

    if (recurringForecastItems[0]) {
      actions.push({
        key: `recurring-${recurringForecastItems[0]._id}`,
        title: `Peržiūrėk ${recurringForecastItems[0].title}`,
        body: `Vien ši pastovi išlaida kainuoja apie ${money.format(
          recurringForecastItems[0].monthlyEquivalent
        )} per mėnesį ir ${money.format(recurringForecastItems[0].annualEquivalent)} per metus.`,
        meta: formatRecurringFrequency(recurringForecastItems[0].frequency, recurringFrequencies),
        tone: "info",
        targetId: "savings-ledger",
        ctaLabel: "Rodyti kategoriją",
        focusCategory: recurringForecastItems[0].category,
        focusMonth: selectedBudgetMonth,
      });
    }

    if (!actions.length && summaryInsights[0]) {
      actions.push({
        key: summaryInsights[0].key,
        title: summaryInsights[0].title,
        body: summaryInsights[0].body,
        meta: summaryInsights[0].metric || "Pirmas signalas",
        tone: summaryInsights[0].tone,
        targetId: "savings-analytics",
        ctaLabel: "Peržiūrėti įžvalgas",
      });
    }

    return actions.slice(0, 3);
  }, [goalPace, recurringForecastItems, recurringFrequencies, selectedBudgetMonth, summaryInsights, topPressure]);
  const leadAction = nextActions[0] || null;
  const goalScenarios = useMemo(() => {
    if (!goalPace?.remaining) {
      return [];
    }

    const scenarioCandidates = [
      {
        key: "current",
        label: "Dabartinis planas",
        monthlyAmount: roundScenarioAmount(profile?.monthlySavingsTarget || 0),
      },
      {
        key: "recommended",
        label: "Ramesnis tempas",
        monthlyAmount: roundScenarioAmount(goalPace.recommendedMonthly || 0),
      },
      {
        key: "stretch",
        label: "Stipresnis sprintas",
        monthlyAmount: roundScenarioAmount(
          Math.max(
            goalPace.recommendedMonthly || 0,
            profile?.monthlySavingsTarget || 0,
            safeToSaveAfterRecurring || 0
          ) * 1.2
        ),
      },
    ];

    const seenMonthlyAmounts = new Set();

    return scenarioCandidates
      .filter((scenario) => scenario.monthlyAmount > 0)
      .filter((scenario) => {
        if (seenMonthlyAmounts.has(scenario.monthlyAmount)) {
          return false;
        }

        seenMonthlyAmounts.add(scenario.monthlyAmount);
        return true;
      })
      .map((scenario) => {
        const monthsToGoal = Math.max(Math.ceil(goalPace.remaining / scenario.monthlyAmount), 1);
        const slack =
          safeToSaveAfterRecurring !== null && safeToSaveAfterRecurring !== undefined
            ? Number((safeToSaveAfterRecurring - scenario.monthlyAmount).toFixed(2))
            : null;

        return {
          ...scenario,
          monthsToGoal,
          finishLabel: formatFutureMonthLabel(monthsToGoal),
          status:
            scenario.monthlyAmount >= goalPace.recommendedMonthly
              ? "on-track"
              : scenario.monthlyAmount >= goalPace.recommendedMonthly * 0.75
              ? "tight"
              : "behind",
          slack,
        };
      })
      .slice(0, 3);
  }, [goalPace, profile?.monthlySavingsTarget, safeToSaveAfterRecurring]);
  const comparisonMonth = useMemo(() => shiftMonthKey(selectedBudgetMonth, -1), [selectedBudgetMonth]);
  const comparisonMonthLabel = formatMonthKeyLabel(selectedBudgetMonth);
  const previousComparisonMonthLabel = formatMonthKeyLabel(comparisonMonth);
  const categoryMomentum = useMemo(() => {
    const categoryMap = new Map();

    entries.forEach((entry) => {
      const monthKey = String(entry.date || "").slice(0, 7);

      if (monthKey !== selectedBudgetMonth && monthKey !== comparisonMonth) {
        return;
      }

      const current = categoryMap.get(entry.category) || {
        category: entry.category,
        currentTotal: 0,
        previousTotal: 0,
      };

      if (monthKey === selectedBudgetMonth) {
        current.currentTotal += Number(entry.amount || 0);
      } else {
        current.previousTotal += Number(entry.amount || 0);
      }

      categoryMap.set(entry.category, current);
    });

    return Array.from(categoryMap.values())
      .map((item) => {
        const delta = Number((item.currentTotal - item.previousTotal).toFixed(2));
        const baseline = item.previousTotal || item.currentTotal || 1;
        const deltaPercent = baseline ? Math.round((delta / baseline) * 100) : 0;

        return {
          ...item,
          delta,
          deltaPercent,
          direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
        };
      })
      .filter((item) => item.currentTotal > 0 || item.previousTotal > 0)
      .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta) || right.currentTotal - left.currentTotal)
      .slice(0, 4);
  }, [comparisonMonth, entries, selectedBudgetMonth]);
  const biggestCategoryRise = categoryMomentum.find((item) => item.delta > 0) || null;
  const biggestCategoryDrop = categoryMomentum.find((item) => item.delta < 0) || null;
  const activityFeed = useMemo(
    () => activity.map((item) => ({ ...item, ...describeSavingsActivity(item, recurringFrequencies) })),
    [activity, recurringFrequencies]
  );
  const summaryArchive = useMemo(
    () =>
      activityFeed.filter((item) =>
        ["summary-export", "summary-email-manual", "summary-email-manual-skipped", "backup-export"].includes(
          item.action
        )
      ),
    [activityFeed]
  );
  const goalStrategyBoard = useMemo(() => {
    return decoratedGoals
      .filter((goal) => !goal.complete)
      .map((goal) => {
        const remaining = Math.max(Number(goal.remaining || 0), 0);
        const monthsLeft = monthsUntilTargetDate(goal.targetDate);
        const recommendedMonthly = remaining
          ? Number(
              (
                remaining /
                Math.max(
                  monthsLeft || 6,
                  1
                )
              ).toFixed(2)
            )
          : 0;
        const shareOfFree =
          safeToSaveAfterRecurring !== null && safeToSaveAfterRecurring !== undefined && safeToSaveAfterRecurring > 0
            ? Math.round((recommendedMonthly / safeToSaveAfterRecurring) * 100)
            : null;

        let priority = "steady";
        let title = "Laikyk tempą";
        let note = "Šitas tikslas juda tvarkingai ir kol kas neatrodo, kad spaustų visą mėnesį.";

        if ((monthsLeft !== null && monthsLeft <= 3) || (shareOfFree !== null && shareOfFree > 100)) {
          priority = "focus";
          title = "Fokusuok dabar";
          note =
            "Šitam tikslui jau reikia pirmumo. Dabartinis rezervas jo nebetempia be aiškesnės disciplinos.";
        } else if ((monthsLeft !== null && monthsLeft <= 6) || (shareOfFree !== null && shareOfFree > 65)) {
          priority = "watch";
          title = "Stebėk atidžiau";
          note = "Tikslas dar telpa, bet verta saugoti jo mėnesio dalį nuo spontaniškų išlaidų.";
        }

        return {
          ...goal,
          remaining,
          monthsLeft,
          recommendedMonthly,
          shareOfFree,
          priority,
          strategyTitle: title,
          strategyNote: note,
        };
      })
      .sort((left, right) => {
        const priorityRank = { focus: 0, watch: 1, steady: 2 };
        return (
          priorityRank[left.priority] - priorityRank[right.priority] ||
          (left.monthsLeft || Number.POSITIVE_INFINITY) - (right.monthsLeft || Number.POSITIVE_INFINITY) ||
          right.recommendedMonthly - left.recommendedMonthly
        );
      });
  }, [decoratedGoals, safeToSaveAfterRecurring]);
  const recurringCategoryLeaders = useMemo(() => {
    const totals = recurringForecastItems.reduce((accumulator, expense) => {
      const next = { ...accumulator };
      next[expense.category] = (next[expense.category] || 0) + Number(expense.annualEquivalent || 0);
      return next;
    }, {});

    return Object.entries(totals)
      .map(([category, annualEquivalent]) => ({ category, annualEquivalent }))
      .sort((left, right) => right.annualEquivalent - left.annualEquivalent)
      .slice(0, 3);
  }, [recurringForecastItems]);
  const recurringReviewQueue = useMemo(() => {
    return recurringForecastItems
      .map((expense) => {
        const shareOfRecurring = recurringMonthlyTotal
          ? Math.round((Number(expense.monthlyEquivalent || 0) / recurringMonthlyTotal) * 100)
          : 0;
        const shareOfIncome =
          profile?.monthlyIncome > 0 ? Math.round((Number(expense.monthlyEquivalent || 0) / profile.monthlyIncome) * 100) : null;

        let priority = "steady";
        let note = "Ši išlaida atrodo valdoma, jei jos vertė vis dar reali tavo šiam etapui.";

        if (shareOfRecurring >= 18 || (shareOfIncome !== null && shareOfIncome >= 8)) {
          priority = "focus";
          note = "Ši eilutė jau viena pati suvalgo reikšmingą recurring dalį. Čia verta pradėti peržiūrą.";
        } else if (shareOfRecurring >= 10 || (shareOfIncome !== null && shareOfIncome >= 5)) {
          priority = "watch";
          note = "Dar ne kritinė, bet jau pakankamai sunki, kad verta ją kartais pasitikrinti.";
        }

        return {
          ...expense,
          shareOfRecurring,
          shareOfIncome,
          priority,
          note,
        };
      })
      .sort((left, right) => {
        const priorityRank = { focus: 0, watch: 1, steady: 2 };
        return priorityRank[left.priority] - priorityRank[right.priority] || right.monthlyEquivalent - left.monthlyEquivalent;
      })
      .slice(0, 4);
  }, [profile?.monthlyIncome, recurringForecastItems, recurringMonthlyTotal]);
  const recurringQuarterlyTotal = Number((recurringMonthlyTotal * 3).toFixed(2));

  const refreshSummaryAndEntries = async () => {
    const [entriesResult, summaryResult] = await Promise.all([
      savingsStudioService.getEntries(),
      savingsStudioService.getSummary(),
    ]);

    startTransition(() => {
      setEntries(entriesResult.entries || []);
      setSummary(summaryResult.summary || null);
    });
  };

  const refreshGoals = async () => {
    const goalResult = await savingsStudioService.getGoals();
    setGoals(goalResult.goals || []);
  };

  const refreshRecurring = async () => {
    const recurringResult = await savingsStudioService.getRecurringExpenses();
    setRecurringExpenses(recurringResult.recurringExpenses || []);
  };

  const refreshActivity = async () => {
    const activityResult = await savingsStudioService.getActivity();
    setActivity(activityResult.activity || []);
  };

  const handleEntryFormChange = (event) => {
    const { name, value } = event.target;
    setEntryForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEmailSettingsChange = (event) => {
    const { name, type, checked, value } = event.target;
    setEmailSettingsForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGoalFormChange = (event) => {
    const { name, value } = event.target;
    setGoalForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRecurringFormChange = (event) => {
    const { name, value } = event.target;
    setRecurringForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleBudgetInputChange = (category, value) => {
    setBudgetInputs((current) => ({
      ...current,
      [category]: value,
    }));
  };

  const handleNextOnboardingStep = () => {
    if (onboardingStep === 0) {
      const monthlyIncome = Number(String(profileForm.monthlyIncome || "0").replace(",", "."));
      const monthlySavingsTarget = Number(String(profileForm.monthlySavingsTarget || "0").replace(",", "."));

      if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) {
        toast.error("Įvesk mėnesio pajamas, kad setup būtų prasmingas.");
        return;
      }

      if (!Number.isFinite(monthlySavingsTarget) || monthlySavingsTarget < 0) {
        toast.error("Įvesk galiojantį mėnesio taupymo tikslą.");
        return;
      }
    }

    if (onboardingStep === 1) {
      const hasAnyBudget = ONBOARDING_BUDGET_CATEGORIES.some((category) => {
        const amount = Number(String(budgetInputs[category] || "0").replace(",", "."));
        return Number.isFinite(amount) && amount > 0;
      });

      if (!profileForm.primaryFocus) {
        toast.error("Pasirink pagrindinį fokusą.");
        return;
      }

      if (!hasAnyBudget) {
        toast.error("Įrašyk bent vieną pirmą biudžeto ribą.");
        return;
      }
    }

    setOnboardingStep((current) => Math.min(current + 1, ONBOARDING_STEPS.length - 1));
  };

  const handlePreviousOnboardingStep = () => {
    setOnboardingStep((current) => Math.max(current - 1, 0));
  };

  const handleSaveOnboarding = async (event) => {
    event.preventDefault();
    setSavingOnboarding(true);

    try {
      const [profileResult] = await Promise.all([
        savingsStudioService.updateProfile({
          monthlyIncome: Number(String(profileForm.monthlyIncome || "0").replace(",", ".")),
          monthlySavingsTarget: Number(String(profileForm.monthlySavingsTarget || "0").replace(",", ".")),
          primaryFocus: profileForm.primaryFocus,
          onboardingCompleted: true,
        }),
        savingsStudioService.updateBudgets({
          month: currentMonthKey(),
          budgets: ONBOARDING_BUDGET_CATEGORIES.map((category) => ({
            category,
            limitAmount: Number(String(budgetInputs[category] || "0").replace(",", ".")),
          })).filter((budget) => Number.isFinite(budget.limitAmount) && budget.limitAmount > 0),
        }),
      ]);

      setProfile(profileResult.profile);
      toast.success("Pirmasis Stilloak setup baigtas.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko užbaigti pirmojo setup.");
    } finally {
      setSavingOnboarding(false);
    }
  };

  const handleSaveBudgets = async (event) => {
    event.preventDefault();
    setSavingBudgets(true);

    try {
      const budgetsPayload = categories
        .map((category) => ({
          category,
          limitAmount: Number(String(budgetInputs[category] || "").replace(",", ".")),
        }))
        .filter((budget) => Number.isFinite(budget.limitAmount) && budget.limitAmount > 0);

      const budgetResult = await savingsStudioService.updateBudgets({
        month: selectedBudgetMonth,
        budgets: budgetsPayload,
      });

      setBudgets(budgetResult.budgets || []);
      setBudgetInputs(
        Object.fromEntries((budgetResult.budgets || []).map((budget) => [budget.category, String(budget.limitAmount)]))
      );
      toast.success("Biudžetai atnaujinti.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko išsaugoti biudžetų.");
    } finally {
      setSavingBudgets(false);
    }
  };

  const handleSaveEmailSettings = async (event) => {
    event.preventDefault();
    setSavingEmailSettings(true);

    try {
      const result = await savingsStudioService.updateEmailSettings(emailSettingsForm);
      setProfile(result.profile || profile);
      setEmailSettingsForm({
        summaryEmailsEnabled: Boolean(result.profile?.summaryEmailsEnabled),
        summaryEmailFrequency: result.profile?.summaryEmailFrequency || "weekly",
      });

      if (result.initialSummary?.triggered) {
        if (result.initialSummary.sent) {
          toast.success(
            `${result.initialSummary.frequency === "monthly" ? "Pirma mėnesio" : "Pirma savaitės"} suvestinė išsiųsta iškart į tavo el. paštą.`
          );
        } else if (result.initialSummary.skipped) {
          toast.error("Nustatymai išsaugoti, bet pirmos suvestinės iškart išsiųsti nepavyko dėl email konfigūracijos.");
        } else {
          toast.error("Nustatymai išsaugoti, bet pirmos suvestinės iškart išsiųsti nepavyko.");
        }
      } else {
        toast.success("Email suvestinių nustatymai atnaujinti.");
      }

      await refreshActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko išsaugoti email suvestinių nustatymų.");
    } finally {
      setSavingEmailSettings(false);
    }
  };

  const handleSendSummaryEmail = async (frequency) => {
    setSendingSummaryEmail(true);

    try {
      const result = await savingsStudioService.sendSummaryEmail({ frequency });

      if (result.skipped) {
        toast.error("El. pašto siuntimas dar nesukonfigūruotas, todėl laiško išsiųsti nepavyko.");
      } else {
        toast.success(`${frequency === "monthly" ? "Mėnesio" : "Savaitės"} suvestinė išsiųsta į tavo el. paštą.`);
      }

      const [profileResult] = await Promise.all([savingsStudioService.getProfile(), refreshActivity()]);
      setProfile(profileResult.profile || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko išsiųsti suvestinės.");
    } finally {
      setSendingSummaryEmail(false);
    }
  };

  const handleEntrySubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await savingsStudioService.updateEntry(editingId, entryForm);
      } else {
        await savingsStudioService.createEntry(entryForm);
      }

      await refreshSummaryAndEntries();
      setEntryForm(emptyEntry(categories));
      setEditingId("");
      toast.success(editingId ? "Išlaida atnaujinta." : "Išlaida išsaugota.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko išsaugoti išlaidos.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoalSubmit = async (event) => {
    event.preventDefault();
    setSavingGoal(true);

    try {
      if (editingGoalId) {
        await savingsStudioService.updateGoal(editingGoalId, goalForm);
      } else {
        await savingsStudioService.createGoal(goalForm);
      }

      await refreshGoals();
      setGoalForm(emptyGoal());
      setEditingGoalId("");
      toast.success(editingGoalId ? "Tikslas atnaujintas." : "Tikslas pridėtas.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko išsaugoti tikslo.");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleRecurringSubmit = async (event) => {
    event.preventDefault();
    setSavingRecurring(true);

    try {
      if (editingRecurringId) {
        await savingsStudioService.updateRecurringExpense(editingRecurringId, recurringForm);
      } else {
        await savingsStudioService.createRecurringExpense(recurringForm);
      }

      await refreshRecurring();
      setRecurringForm(emptyRecurringExpense(categories));
      setEditingRecurringId("");
      toast.success(editingRecurringId ? "Pasikartojanti išlaida atnaujinta." : "Pasikartojanti išlaida pridėta.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko išsaugoti pasikartojančios išlaidos.");
    } finally {
      setSavingRecurring(false);
    }
  };

  const handleLogRecurringExpense = async (recurringExpense) => {
    setLoggingRecurringId(recurringExpense._id);

    try {
      await savingsStudioService.logRecurringExpense(recurringExpense._id, {
        month: currentMonthKey(),
      });
      await Promise.all([refreshRecurring(), refreshSummaryAndEntries()]);
      toast.success("Pasikartojanti išlaida įtraukta į šio mėnesio įrašus.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko įtraukti pasikartojančios išlaidos.");
    } finally {
      setLoggingRecurringId("");
    }
  };

  const handleCsvImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPreviewingCsv(true);

    try {
      const text = await file.text();
      const rows = parseSavingsCsvText({ categories, includeIncomplete: true, text });

      if (!rows.length) {
        toast.error("Nepavyko rasti tinkamų CSV eilučių importui.");
        return;
      }

      const preview = await savingsStudioService.previewEntriesImport({ rows });
      setCsvPreviewResult(preview);
      setCsvFileName(file.name);
      toast.success(`Paruoštas preview: ${preview.validCount} tinkamų eilučių.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko paruošti CSV preview.");
    } finally {
      event.target.value = "";
      setPreviewingCsv(false);
    }
  };

  const handleConfirmCsvImport = async () => {
    if (!csvPreviewResult?.validRows?.length) {
      toast.error("Nėra ką importuoti.");
      return;
    }

    setConfirmingCsvImport(true);

    try {
      const result = await savingsStudioService.importEntries({
        rows: csvPreviewResult.validRows,
      });
      await refreshSummaryAndEntries();
      setCsvPreviewResult(null);
      setCsvFileName("");
      toast.success(`Importuota ${result.importedCount} įrašų.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko importuoti preview eilučių.");
    } finally {
      setConfirmingCsvImport(false);
    }
  };

  const handleClearCsvPreview = () => {
    setCsvPreviewResult(null);
    setCsvFileName("");
  };

  const handleDownloadBackup = async () => {
    setDownloadingBackup(true);

    try {
      await savingsStudioService.downloadBackup();
      toast.success("Backup failas paruoštas atsisiųsti.");
      await refreshActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko paruošti backup failo.");
    } finally {
      setDownloadingBackup(false);
    }
  };

  const handleDownloadSummary = async (frequency) => {
    setDownloadingSummaryKey(frequency);

    try {
      await savingsStudioService.downloadSummaryFile(frequency);
      toast.success(`${frequency === "monthly" ? "Mėnesio" : "Savaitės"} suvestinė paruošta atsisiųsti.`);
      await refreshActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko paruošti suvestinės failo.");
    } finally {
      setDownloadingSummaryKey("");
    }
  };

  const handleDelete = async (entryId) => {
    const confirmed = window.confirm("Ar tikrai nori ištrinti šią išlaidą?");

    if (!confirmed) {
      return;
    }

    setDeletingId(entryId);

    try {
      await savingsStudioService.deleteEntry(entryId);
      await refreshSummaryAndEntries();
      toast.success("Išlaida ištrinta.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko ištrinti išlaidos.");
    } finally {
      setDeletingId("");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const confirmed = window.confirm("Ar tikrai nori ištrinti šį taupymo tikslą?");

    if (!confirmed) {
      return;
    }

    setDeletingGoalId(goalId);

    try {
      await savingsStudioService.deleteGoal(goalId);
      await refreshGoals();
      toast.success("Taupymo tikslas ištrintas.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko ištrinti tikslo.");
    } finally {
      setDeletingGoalId("");
    }
  };

  const handleDeleteRecurring = async (recurringId) => {
    const confirmed = window.confirm("Ar tikrai nori ištrinti šią pasikartojančią išlaidą?");

    if (!confirmed) {
      return;
    }

    setDeletingRecurringId(recurringId);

    try {
      await savingsStudioService.deleteRecurringExpense(recurringId);
      await refreshRecurring();
      toast.success("Pasikartojanti išlaida ištrinta.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko ištrinti pasikartojančios išlaidos.");
    } finally {
      setDeletingRecurringId("");
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setEntryForm({
      title: entry.title,
      amount: String(entry.amount),
      category: entry.category,
      date: entry.date,
      notes: entry.notes,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditGoal = (goal) => {
    setEditingGoalId(goal._id);
    setGoalForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate || "",
      notes: goal.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditRecurring = (recurringExpense) => {
    setEditingRecurringId(recurringExpense._id);
    setRecurringForm({
      title: recurringExpense.title,
      amount: String(recurringExpense.amount),
      category: recurringExpense.category,
      frequency: recurringExpense.frequency,
      notes: recurringExpense.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setEntryForm(emptyEntry(categories));
  };

  const handleCancelGoalEdit = () => {
    setEditingGoalId("");
    setGoalForm(emptyGoal());
  };

  const handleCancelRecurringEdit = () => {
    setEditingRecurringId("");
    setRecurringForm(emptyRecurringExpense(categories));
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const usageWizardCurrentStep = USAGE_WIZARD_STEPS[usageWizardStep];

  const openUsageWizard = (stepIndex = 0) => {
    setUsageWizardStep(Math.max(0, Math.min(stepIndex, USAGE_WIZARD_STEPS.length - 1)));
    setUsageWizardOpen(true);
  };

  const closeUsageWizard = () => {
    window.localStorage.setItem(USAGE_WIZARD_STORAGE_KEY, "true");
    setUsageWizardOpen(false);
  };

  const completeUsageWizard = () => {
    toast.success("Naudojimo gidas užbaigtas. Dabar gali eiti tiesiai prie aktualiausio žingsnio.");
    closeUsageWizard();
  };

  const goToUsageWizardTarget = () => {
    const target =
      document.getElementById(usageWizardCurrentStep?.targetId || "") ||
      document.getElementById("savings-ledger") ||
      document.getElementById("savings-analytics");
    closeUsageWizard();

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleActionFocus = (action) => {
    if (!action) {
      return;
    }

    if (action.focusCategory || action.focusMonth || action.focusSearch !== undefined) {
      startTransition(() => {
        setFilters((current) => ({
          ...current,
          category: action.focusCategory || current.category,
          month: action.focusMonth || current.month,
          search: action.focusSearch !== undefined ? action.focusSearch : current.search,
        }));
      });
    }

    window.requestAnimationFrame(() => {
      scrollToSection(action.targetId || "savings-ledger");
    });
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="members tool"
            title="Stilloak"
        subtitle="Privati nario darbo zona, kur matai, kur išeina pinigai, kaip keičiasi mėnesiai ir kur gali susigrąžinti finansinį aiškumą."
      />

      <section className="soft-card rounded-[28px] px-6 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">usage guide</p>
            <h2 className="mt-3 text-3xl font-bold">Nori greito walkthrough, kaip naudotis Stilloak?</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              Atidaryk step-by-step gidą ir per kelias minutes pereik visą logiką: nuo pirmo setup iki email
              suvestinių, CSV importo ir taupymo įžvalgų.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="button-primary" onClick={() => openUsageWizard(0)}>
              Atidaryti gidą
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                window.localStorage.removeItem(USAGE_WIZARD_STORAGE_KEY);
                openUsageWizard(profile?.onboardingCompleted ? 1 : 0);
              }}
            >
              Rodyti kaip pirmą kartą
            </button>
          </div>
        </div>
      </section>

      {searchParams.get("welcome") === "membership" ? (
        <section className="public-section">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="eyebrow">membership unlocked</span>
              <h2 className="mt-5 text-5xl font-bold">Narystė aktyvi. Dabar pradėk nuo pirmo taupymo setup.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Stilloak jau atrakinta tavo paskyrai. Jei dar nebaigei pirmo setup, pradėk nuo pajamų,
                mėnesio taupymo tikslo ir trijų svarbiausių biudžetų.
              </p>
            </div>
            <div className="soft-card rounded-[28px] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">What opens now</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <p>1. Nustatai pirmą mėnesio planą.</p>
                <p>2. Matai biudžetų spaudimą ir taupymo tempą.</p>
                <p>3. Gali gauti summary email ir importuoti banko CSV.</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {!profile?.onboardingCompleted && (
        <section id="savings-setup" className="public-section">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <span className="eyebrow">first setup</span>
              <h2 className="mt-5 text-5xl font-bold">{ONBOARDING_STEPS[onboardingStep].title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                {ONBOARDING_STEPS[onboardingStep].description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {ONBOARDING_STEPS.map((step, index) => (
                  <div
                    key={step.key}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                      index === onboardingStep
                        ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-contrast))]"
                        : "bg-[rgb(var(--surface-soft))] text-muted"
                    }`}
                  >
                    {step.eyebrow}
                  </div>
                ))}
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSaveOnboarding}>
              {onboardingStep === 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-muted">Mėnesio pajamos</span>
                      <input
                        name="monthlyIncome"
                        value={profileForm.monthlyIncome}
                        onChange={handleProfileChange}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="input-field"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-muted">Mėnesio taupymo tikslas</span>
                      <input
                        name="monthlySavingsTarget"
                        value={profileForm.monthlySavingsTarget}
                        onChange={handleProfileChange}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="input-field"
                      />
                    </label>
                  </div>

                  <div className="soft-card rounded-[24px] p-5 text-sm text-muted">
                    Čia susikuri bazę, nuo kurios programa galės skaičiuoti, kiek realiai dar telpa taupymui.
                  </div>
                </div>
              ) : null}

              {onboardingStep === 1 ? (
                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-muted">Pagrindinis fokusas</span>
                    <select
                      name="primaryFocus"
                      value={profileForm.primaryFocus}
                      onChange={handleProfileChange}
                      className="select-field"
                    >
                      {focusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {ONBOARDING_BUDGET_CATEGORIES.map((category) => (
                      <label key={category} className="block space-y-2">
                        <span className="text-sm font-semibold text-muted">{category} biudžetas</span>
                        <input
                          value={budgetInputs[category] || ""}
                          onChange={(event) => handleBudgetInputChange(category, event.target.value)}
                          inputMode="decimal"
                          placeholder="0.00"
                          className="input-field"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {onboardingStep === 2 ? (
                <div className="space-y-4">
                  <div className="soft-card rounded-[24px] p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Review</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-semibold text-muted">Mėnesio pajamos</p>
                        <p className="mt-1 text-lg font-semibold">
                          {money.format(Number(String(profileForm.monthlyIncome || "0").replace(",", ".")))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted">Taupymo tikslas</p>
                        <p className="mt-1 text-lg font-semibold">
                          {money.format(Number(String(profileForm.monthlySavingsTarget || "0").replace(",", ".")))}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-muted">Pagrindinis fokusas</p>
                      <p className="mt-1 text-base">{profileForm.primaryFocus || "Nepasirinkta"}</p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {ONBOARDING_BUDGET_CATEGORIES.map((category) => (
                        <div key={category} className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
                          <p className="text-sm font-semibold text-muted">{category}</p>
                          <p className="mt-1 text-base font-semibold">
                            {money.format(Number(String(budgetInputs[category] || "0").replace(",", ".")))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {onboardingStep > 0 ? (
                  <button type="button" className="button-secondary gap-2" onClick={handlePreviousOnboardingStep}>
                    <ChevronLeft size={16} />
                    Atgal
                  </button>
                ) : null}

                {onboardingStep < ONBOARDING_STEPS.length - 1 ? (
                  <button type="button" className="button-primary gap-2" onClick={handleNextOnboardingStep}>
                    Toliau
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" className="button-primary gap-2" disabled={savingOnboarding}>
                    <CheckCircle2 size={16} />
                    {savingOnboarding ? "Kuriama..." : "Užbaigti pirmą setup"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      )}

      <section id="savings-analytics" className="marketing-dark overflow-hidden rounded-[34px] px-6 py-7 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="hero-chip">Circle feature</span>
            <h2 className="mt-6 font-display text-5xl font-bold leading-[0.95]">
              {user?.name?.split(" ")[0]}, čia tavo pinigų aiškumo kambarys.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
              Šis modulis leidžia suvesti kasdienes išlaidas, nustatyti biudžetus, sekti taupymo tikslus ir
              pamatyti, kurios pasikartojančios išlaidos sunkiausiai leidžia judėti į priekį.
            </p>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">Ką daryti dabar</p>
                  <h3 className="mt-3 font-display text-3xl font-bold">
                    {leadAction ? leadAction.title : "Mėnesio ritmas atrodo tvarkingai"}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                    {leadAction
                      ? leadAction.body
                      : "Kol kas sistema nemato vienos kritinės vietos. Tęsk įrašų ritmą ir kartą per savaitę peržiūrėk didžiausią kategoriją."}
                  </p>
                </div>
                <PiggyBank size={20} style={{ color: "rgb(var(--accent-strong))" }} />
              </div>

              <div className="mt-5 grid gap-3">
                {nextActions.map((action, index) => (
                  <ActionPriorityRow key={action.key} action={action} index={index} onOpen={handleActionFocus} />
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {leadAction ? (
                  <button
                    type="button"
                    className="button-primary gap-2"
                    onClick={() => handleActionFocus(leadAction)}
                  >
                    {leadAction.ctaLabel}
                    <ChevronRight size={16} />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="button-secondary gap-2"
                  onClick={() => scrollToSection("savings-automation")}
                >
                  Peržiūrėti suvestines
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <InsightTile
                icon={WalletCards}
                label="Šis mėnuo"
                value={money.format(summary?.monthTotal || 0)}
                hint={formatChange(summary?.change)}
              />
              <InsightTile
                icon={PiggyBank}
                label="Po recurring"
                value={
                  safeToSaveAfterRecurring !== null && safeToSaveAfterRecurring !== undefined
                    ? money.format(safeToSaveAfterRecurring)
                    : "—"
                }
                hint={
                  safeToSaveAfterRecurring !== null && safeToSaveAfterRecurring !== undefined
                    ? `Po projekcijų lieka ${money.format(safeToSaveAfterRecurring)}`
                    : "Pridėk pajamas, kad matytum rezervą"
                }
              />
              <InsightTile
                icon={Repeat}
                label="Pastovios išlaidos"
                value={money.format(recurringMonthlyTotal)}
                hint={`${recurringExpenses.length} aktyvūs įrašai`}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <InsightTile
                icon={Target}
                label="Tikslai"
                value={String(activeGoalsCount)}
                hint={goalPace ? goalPaceStatusLabel(goalPace.status) : "Aktyvūs taupymo tikslai"}
              />
              <InsightTile
                icon={AlertTriangle}
                label="Didžiausias spaudimas"
                value={topPressure?.category || "Ramu"}
                hint={
                  topPressure
                    ? `${money.format(topPressure.projectedSpent)} iš ${money.format(topPressure.limitAmount)}`
                    : "Kol kas nėra aiškios spaudžiančios kategorijos"
                }
              />
              <InsightTile
                icon={TrendingUp}
                label="Laisva suma"
                value={
                  availableToSave !== null && availableToSave !== undefined ? money.format(availableToSave) : "—"
                }
                hint={
                  availableToSave !== null && availableToSave !== undefined
                    ? "Po faktinių išlaidų"
                    : "Pridėk pajamas, kad sistema rodytų laisvą rezervą"
                }
              />
            </div>

            {goalPace ? (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">Goal pace</p>
                    <h3 className="mt-3 font-display text-3xl font-bold">{goalPace.title}</h3>
                  </div>
                  <Target size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[18px] bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Reikia per mėn.</p>
                    <p className="mt-2 text-lg font-semibold">{money.format(goalPace.recommendedMonthly)}</p>
                  </div>
                  <div className="rounded-[18px] bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Liko sukaupti</p>
                    <p className="mt-2 text-lg font-semibold">{money.format(goalPace.remaining)}</p>
                  </div>
                  <div className="rounded-[18px] bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Statusas</p>
                    <p
                      className={`mt-2 text-lg font-semibold ${
                        goalPace.status === "behind"
                          ? "text-red-200"
                          : goalPace.status === "tight"
                          ? "text-amber-100"
                          : "text-emerald-200"
                      }`}
                    >
                      {goalPaceStatusLabel(goalPace.status)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70">
                  {goalPace.targetDate
                    ? `Jei nori pasiekti šį tikslą iki ${goalPace.targetDate}, verta laikyti bent tokį mėnesio atsidėjimo tempą.`
                    : "Šis tikslas kol kas neturi datos, todėl rekomenduojamas tempas skaičiuojamas kaip geras mėnesio orientyras."}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Automatinės įžvalgos</p>
                <h3 className="mt-3 font-display text-3xl font-bold">Kur verta veikti pirmiausia</h3>
              </div>
              <ShieldCheck size={20} style={{ color: "rgb(var(--accent-strong))" }} />
            </div>

            <div className="mt-6 space-y-3">
              {summaryInsights.map((insight) => (
                <InsightSignalCard key={insight.key} insight={insight} />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-white/48">
              <span>Filtruota suma: {money.format(filteredTotal)}</span>
              <span>Top kategorija: {summary?.topCategory || "Dar nėra duomenų"}</span>
              <span>Biudžetų mėnuo: {selectedBudgetMonth}</span>
              <span>Su pastoviomis: {money.format(projectedMonthTotal)}</span>
              {availableToSave !== null && availableToSave !== undefined ? (
                <span>Laisva suma: {money.format(availableToSave)}</span>
              ) : null}
              {safeToSaveAfterRecurring !== null && safeToSaveAfterRecurring !== undefined ? (
                <span>Po recurring: {money.format(safeToSaveAfterRecurring)}</span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <div id="savings-recurring-forecast" className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">recurring forecast</p>
              <h2 className="mt-4 text-4xl font-bold">Kur recurring spaudžia labiausiai</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Čia matai ne tik bendrą sumą, bet ir kurie pasikartojantys mokėjimai iš tikro suvalgo daugiausia
                erdvės taupymui.
              </p>
            </div>
            <Repeat size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ForecastMetricTile
              label="Recurring per mėn."
              value={money.format(recurringMonthlyTotal)}
              hint={`${recurringExpenses.length} aktyvūs įrašai`}
            />
            <ForecastMetricTile
              label="Recurring per metus"
              value={money.format(recurringAnnualTotal)}
              hint="Bendra metinė našta"
            />
            <ForecastMetricTile
              label="Pajamų dalis"
              value={recurringShareOfIncome !== null ? `${recurringShareOfIncome}%` : "—"}
              hint={
                recurringShareOfIncome !== null
                  ? "Kiek pajamų suvalgo pastovūs mokėjimai"
                  : "Pridėk pajamas, kad matytum dalį"
              }
            />
          </div>

          <div className="mt-6 space-y-4">
            {recurringForecastItems.length ? (
              recurringForecastItems.slice(0, 3).map((expense) => (
                <div key={expense._id} className="soft-card rounded-[24px] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">{expense.title}</h3>
                        <span className="premium-tag">{expense.category}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {formatRecurringFrequency(expense.frequency, recurringFrequencies)} · {money.format(
                          expense.monthlyEquivalent
                        )} per mėn. · {money.format(expense.annualEquivalent)} per metus
                      </p>
                    </div>

                    <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3 text-left sm:min-w-[180px] sm:text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Metinė našta</p>
                      <p className="mt-2 text-lg font-semibold">{money.format(expense.annualEquivalent)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Pridėk bent vieną pastovią išlaidą, ir čia iškart matysi kur recurring dalis labiausiai spaudžia
                tavo mėnesį.
              </div>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">goal scenarios</p>
              <h2 className="mt-4 text-4xl font-bold">Kokiu tempu pasieksi tikslą</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Vietoje vieno skaičiaus matai kelis realius scenarijus: kas nutinka laikantis dabartinio plano,
                rekomenduojamo tempo ar šiek tiek stipresnio sprinto.
              </p>
            </div>
            <Target size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 space-y-4">
            {goalScenarios.length ? (
              goalScenarios.map((scenario) => <GoalScenarioCard key={scenario.key} scenario={scenario} />)
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Kai turėsi aktyvų taupymo tikslą su aiškesniu tempu, čia galėsi palyginti kelis mėnesio scenarijus
                ir pasirinkti realesnį ritmą.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">category shifts</p>
              <h2 className="mt-4 text-4xl font-bold">Kas pasikeitė tarp mėnesių</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Čia matai ne tik bendras išlaidas, bet ir kur tikrai pajudėjo ritmas nuo {previousComparisonMonthLabel} iki{" "}
                {comparisonMonthLabel}. Paspaudęs kortą iškart nusileisi į tos kategorijos ledger vaizdą.
              </p>
            </div>
            <CalendarRange size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ForecastMetricTile
              label="Lyginamas mėnuo"
              value={comparisonMonthLabel}
              hint={`Palyginimas su ${previousComparisonMonthLabel}`}
            />
            <ForecastMetricTile
              label="Labiausiai augo"
              value={biggestCategoryRise?.category || "Stabilu"}
              hint={
                biggestCategoryRise
                  ? `${biggestCategoryRise.delta > 0 ? "+" : ""}${money.format(biggestCategoryRise.delta)}`
                  : "Ryškaus augimo kol kas nėra"
              }
            />
            <ForecastMetricTile
              label="Labiausiai mažėjo"
              value={biggestCategoryDrop?.category || "Dar nėra"}
              hint={
                biggestCategoryDrop
                  ? `${money.format(biggestCategoryDrop.delta)} mažiau nei ${previousComparisonMonthLabel}`
                  : "Kol kas nėra aiškaus mažėjimo"
              }
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {categoryMomentum.length ? (
              categoryMomentum.map((item) => (
                <CategoryShiftCard
                  key={item.category}
                  currentMonthLabel={comparisonMonthLabel}
                  item={item}
                  previousMonthLabel={previousComparisonMonthLabel}
                  onOpen={() =>
                    handleActionFocus({
                      targetId: "savings-ledger",
                      focusCategory: item.category,
                      focusMonth: selectedBudgetMonth,
                      ctaLabel: "Rodyti įrašus",
                    })
                  }
                />
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted md:col-span-2">
                Kai turėsi bent dviejų mėnesių išlaidų istoriją, čia iškart pradės matytis, kurios kategorijos auga,
                kurios rimsta ir kur iš tikro keičiasi tavo mėnesio ritmas.
              </div>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">activity timeline</p>
              <h2 className="mt-4 text-4xl font-bold">Kas jau įvyko tavo studio</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Šita juosta padeda matyti ne tik duomenis, bet ir tavo veiksmų ritmą: importus, tikslų pokyčius,
                recurring korekcijas, backupus ir summary siuntimus.
              </p>
            </div>
            <History size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 space-y-4">
            {activityFeed.length ? (
              activityFeed.map((item) => (
                <ActivityTimelineItem key={item.id} item={item} onOpen={handleActionFocus} />
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Kai pradėsi aktyviau naudotis Savings Studio, čia matysi savo finansinės darbo eigos istoriją vienoje
                vietoje.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="savings-ledger" className="grid gap-6 xl:grid-cols-[0.92fr_1.1fr_0.98fr]">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">quick capture</p>
              <h2 className="mt-4 text-4xl font-bold">{editingId ? "Redaguoti įrašą" : "Pridėti išlaidą"}</h2>
            </div>
            {editingId ? (
              <button type="button" className="button-secondary" onClick={handleCancelEdit}>
                Atšaukti
              </button>
            ) : null}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleEntrySubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Pavadinimas</span>
              <input
                name="title"
                value={entryForm.title}
                onChange={handleEntryFormChange}
                placeholder="Nuoma, maistas, taksi"
                className="input-field"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted">Suma</span>
                <input
                  name="amount"
                  value={entryForm.amount}
                  onChange={handleEntryFormChange}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="input-field"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted">Data</span>
                <input
                  type="date"
                  name="date"
                  value={entryForm.date}
                  onChange={handleEntryFormChange}
                  className="input-field"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Kategorija</span>
              <select
                name="category"
                value={entryForm.category}
                onChange={handleEntryFormChange}
                className="select-field"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Pastabos</span>
              <textarea
                name="notes"
                value={entryForm.notes}
                onChange={handleEntryFormChange}
                placeholder="Kas privertė pirkti, ar galima mažinti tokių išlaidų dažnį?"
                className="textarea-field"
              />
            </label>

            <button type="submit" className="button-primary w-full gap-2" disabled={submitting}>
              <Plus size={16} />
              {submitting ? "Saugoma..." : editingId ? "Atnaujinti išlaidą" : "Išsaugoti išlaidą"}
            </button>
          </form>
        </div>

        <div className="panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">ledger</p>
              <h2 className="mt-4 text-4xl font-bold">Tavo išlaidos</h2>
            </div>
            <p className="text-sm text-muted">Rasta: {filteredEntries.length}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Paieška</span>
              <input
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                placeholder="Ieškoti pavadinimo ar pastabų"
                className="input-field"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Kategorija</span>
              <select
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className="select-field"
              >
                <option>Visos kategorijos</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Mėnuo</span>
              <select
                value={filters.month}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    month: event.target.value,
                  }))
                }
                className="select-field"
              >
                {monthChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 space-y-4">
            {filteredEntries.length ? (
              filteredEntries.map((entry) => (
                <article key={entry._id} className="soft-card rounded-[24px] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-2xl font-bold">{entry.title}</h3>
                        <span className="premium-tag">{entry.category}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {entry.notes || "Be papildomų pastabų."}
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-2xl font-semibold">{money.format(entry.amount)}</p>
                      <p className="mt-1 text-sm text-muted">
                        {dateFormatter.format(new Date(`${entry.date}T00:00:00`))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" className="button-secondary gap-2" onClick={() => handleEdit(entry)}>
                      <Pencil size={16} />
                      Redaguoti
                    </button>
                    <button
                      type="button"
                      className="button-secondary gap-2 text-red-600"
                      onClick={() => handleDelete(entry._id)}
                      disabled={deletingId === entry._id}
                    >
                      <Trash2 size={16} />
                      {deletingId === entry._id ? "Šalinama..." : "Trinti"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Kol kas pagal filtrus nėra įrašų. Pradėk nuo pirmos išlaidos ir pamatysi, kur pradeda ryškėti
                taupymo galimybės.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div id="savings-budgets" className="panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">monthly budgets</p>
                <h2 className="mt-4 text-4xl font-bold">Biudžetų ribos</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Nustatyk, kiek nori skirti kiekvienai kategorijai pasirinktam mėnesiui.
                </p>
              </div>
              <Target size={20} style={{ color: "rgb(var(--accent))" }} />
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSaveBudgets}>
              {categories.map((category) => (
                <label key={category} className="block space-y-2">
                  <span className="text-sm font-semibold text-muted">{category}</span>
                  <input
                    value={budgetInputs[category] || ""}
                    onChange={(event) => handleBudgetInputChange(category, event.target.value)}
                    inputMode="decimal"
                    placeholder="0.00"
                    className="input-field"
                  />
                </label>
              ))}

              <button type="submit" className="button-primary w-full gap-2" disabled={savingBudgets}>
                <Target size={16} />
                {savingBudgets ? "Saugoma..." : `Išsaugoti ${selectedBudgetMonth} biudžetus`}
              </button>
            </form>
          </div>

          <div className="panel p-6">
            <p className="eyebrow">month pulse</p>
            <h2 className="mt-4 text-4xl font-bold">6 mėnesių vaizdas</h2>
            <div className="mt-6 grid h-[260px] grid-cols-6 items-end gap-3">
              {monthlyTotals.map((entry) => {
                const height = `${Math.max((entry.total / highestMonthlyTotal) * 100, entry.total ? 16 : 8)}%`;

                return (
                  <div key={entry.key} className="flex h-full flex-col items-center justify-end gap-3">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-[rgb(var(--surface-soft))]">
                      <div
                        className="absolute inset-x-0 bottom-0 rounded-full"
                        style={{
                          height,
                          background:
                            "linear-gradient(180deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {entry.label.split(" ")[0]}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{money.format(entry.total)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">budget progress</p>
                <h2 className="mt-4 text-4xl font-bold">Kiek liko iki limito</h2>
              </div>
              <TrendingUp size={20} style={{ color: "rgb(var(--accent))" }} />
            </div>

            <div className="mt-6 space-y-3">
              {budgetProgress.length ? (
                budgetProgress.map((entry) => (
                  <div key={entry.category} className="soft-card rounded-[20px] px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{entry.category}</span>
                      <span
                        className={`font-semibold ${
                          entry.status === "over"
                            ? "text-red-600"
                            : entry.status === "warning"
                            ? "text-amber-600"
                            : ""
                        }`}
                      >
                        {money.format(entry.projectedSpent)} / {money.format(entry.limitAmount || 0)}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgb(var(--surface-soft))]">
                      <div
                        className={`h-full rounded-full ${
                          entry.status === "over"
                            ? "bg-red-500"
                            : entry.status === "warning"
                            ? "bg-amber-500"
                            : "bg-[rgb(var(--accent))]"
                        }`}
                        style={{ width: `${entry.limitAmount ? Math.max(entry.percentUsed, 6) : 0}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">
                      Faktinės: {money.format(entry.actualSpent)} · Pastovios: {money.format(entry.recurringCommitted)}
                    </p>
                    <p className="mt-3 text-sm text-muted">
                      {entry.status === "over"
                        ? `Viršyta ${money.format(Math.abs(entry.remaining))}`
                        : entry.limitAmount
                        ? `Liko ${money.format(entry.remaining)}`
                        : `Šioje kategorijoje kol kas išleista ${money.format(entry.spent)}`}
                    </p>
                  </div>
                ))
              ) : categoryTotals.length ? (
                categoryTotals.map((entry) => (
                  <div key={entry.category} className="soft-card rounded-[20px] px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{entry.category}</span>
                      <span className="font-semibold">{money.format(entry.total)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="soft-card rounded-[20px] p-5 text-sm text-muted">
                  Nustatyk pirmus biudžetus arba suvesk pirmas išlaidas, ir čia matysi kiek dar liko iki limito.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr_1fr]">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">weekly flow</p>
              <h2 className="mt-4 text-4xl font-bold">Savaitinis mėnesio ritmas</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Greitai pamatai, kuri mėnesio dalis suvalgo daugiausia pinigų ir kur prasideda tempas, kuris
                išmuša visą mėnesio balansą.
              </p>
            </div>
            <TrendingUp size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 grid h-[250px] grid-cols-5 items-end gap-3">
            {weeklyTotalsCurrentMonth.map((entry) => {
              const height = `${Math.max((Number(entry.total || 0) / highestWeeklyTotal) * 100, entry.total ? 16 : 8)}%`;

              return (
                <div key={entry.key} className="flex h-full flex-col items-center justify-end gap-3">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[rgb(var(--surface-soft))]">
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-full"
                      style={{
                        height,
                        background: "linear-gradient(180deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{entry.label}</p>
                    <p className="mt-1 text-sm font-semibold">{money.format(entry.total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">spend mix</p>
              <h2 className="mt-4 text-4xl font-bold">Fiksuota vs lanksti dalis</h2>
            </div>
            <WalletCards size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 space-y-4">
            <div className="soft-card rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Jau užfiksuotos recurring išlaidos</span>
                <span className="font-semibold">{money.format(fixedVsFlexible.loggedRecurring)}</span>
              </div>
              <p className="mt-2 text-sm text-muted">Mokėjimai, kuriuos jau pavertei tikrais mėnesio įrašais.</p>
            </div>

            <div className="soft-card rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Dar likusios recurring projekcijos</span>
                <span className="font-semibold">{money.format(fixedVsFlexible.recurringRemaining)}</span>
              </div>
              <p className="mt-2 text-sm text-muted">Pastovios išlaidos, kurios dar laukia savo mėnesio įrašo.</p>
            </div>

            <div className="soft-card rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Lankstus išleidimas</span>
                <span className="font-semibold">{money.format(fixedVsFlexible.flexibleSpent)}</span>
              </div>
              <p className="mt-2 text-sm text-muted">Tai dalis, kurią lengviausia optimizuoti per įpročius.</p>
            </div>

            {savingsCapacity ? (
              <div className="soft-card rounded-[24px] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Savings capacity</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-muted">Po faktinių išlaidų</p>
                    <p className="mt-1 text-lg font-semibold">{money.format(savingsCapacity.afterActual || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted">Po projekcijų</p>
                    <p className="mt-1 text-lg font-semibold">{money.format(savingsCapacity.afterProjected || 0)}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">category pressure</p>
              <h2 className="mt-4 text-4xl font-bold">Kuri kategorija spaudžia labiausiai</h2>
            </div>
            <AlertTriangle size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 space-y-4">
            {categoryPressure.length ? (
              categoryPressure.map((entry) => (
                <div key={entry.category} className="soft-card rounded-[24px] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{entry.category}</span>
                    <span
                      className={`font-semibold ${
                        entry.status === "over"
                          ? "text-red-600"
                          : entry.status === "warning"
                          ? "text-amber-600"
                          : ""
                      }`}
                    >
                      {entry.shareOfProjected}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgb(var(--surface-soft))]">
                    <div
                      className={`h-full rounded-full ${
                        entry.status === "over"
                          ? "bg-red-500"
                          : entry.status === "warning"
                          ? "bg-amber-500"
                          : "bg-[rgb(var(--accent))]"
                      }`}
                      style={{ width: `${Math.max(entry.shareOfProjected, 6)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    {money.format(entry.projectedSpent)} iš {money.format(entry.limitAmount)} limito
                  </p>
                </div>
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Kai susikaups daugiau biudžetų ir išlaidų, čia matysi aiškiausią mėnesio spaudimą.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="savings-goals" className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">savings goals</p>
              <h2 className="mt-4 text-4xl font-bold">{editingGoalId ? "Redaguoti tikslą" : "Taupymo tikslai"}</h2>
            </div>
            {editingGoalId ? (
              <button type="button" className="button-secondary" onClick={handleCancelGoalEdit}>
                Atšaukti
              </button>
            ) : null}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleGoalSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Tikslo pavadinimas</span>
              <input
                name="title"
                value={goalForm.title}
                onChange={handleGoalFormChange}
                placeholder="Kelionės fondas, rezervas, naujas kompiuteris"
                className="input-field"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted">Tikslinė suma</span>
                <input
                  name="targetAmount"
                  value={goalForm.targetAmount}
                  onChange={handleGoalFormChange}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="input-field"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted">Jau sukaupta</span>
                <input
                  name="currentAmount"
                  value={goalForm.currentAmount}
                  onChange={handleGoalFormChange}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="input-field"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Norima data</span>
              <input
                type="date"
                name="targetDate"
                value={goalForm.targetDate}
                onChange={handleGoalFormChange}
                className="input-field"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Pastabos</span>
              <textarea
                name="notes"
                value={goalForm.notes}
                onChange={handleGoalFormChange}
                placeholder="Kam šis tikslas svarbus ir per kiek laiko nori pasiekti?"
                className="textarea-field"
              />
            </label>

            <button type="submit" className="button-primary w-full gap-2" disabled={savingGoal}>
              <Target size={16} />
              {savingGoal ? "Saugoma..." : editingGoalId ? "Atnaujinti tikslą" : "Pridėti tikslą"}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {decoratedGoals.length ? (
              decoratedGoals.map((goal) => (
                <div key={goal._id} className="soft-card rounded-[24px] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-bold">{goal.title}</h3>
                      <p className="mt-2 text-sm text-muted">
                        {goal.targetDate ? `Tikslinė data: ${goal.targetDate}` : "Be konkrečios datos"}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl font-semibold">
                        {money.format(goal.currentAmount)} / {money.format(goal.targetAmount)}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {goal.complete ? "Tikslas pasiektas" : `Liko ${money.format(Math.max(goal.remaining, 0))}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgb(var(--surface-soft))]">
                    <div
                      className={`h-full rounded-full ${goal.complete ? "bg-emerald-500" : "bg-[rgb(var(--accent))]"}`}
                      style={{ width: `${Math.max(goal.progress, 6)}%` }}
                    />
                  </div>

                  {goal.notes ? <p className="mt-3 text-sm leading-6 text-muted">{goal.notes}</p> : null}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" className="button-secondary gap-2" onClick={() => handleEditGoal(goal)}>
                      <Pencil size={16} />
                      Redaguoti
                    </button>
                    <button
                      type="button"
                      className="button-secondary gap-2 text-red-600"
                      onClick={() => handleDeleteGoal(goal._id)}
                      disabled={deletingGoalId === goal._id}
                    >
                      <Trash2 size={16} />
                      {deletingGoalId === goal._id ? "Šalinama..." : "Trinti"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Kai susikursi pirmą tikslą, čia matysi progresą, likutį ir ar artėji prie savo sumos.
              </div>
            )}
          </div>
        </div>

        <div id="savings-recurring" className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">recurring expenses</p>
              <h2 className="mt-4 text-4xl font-bold">
                {editingRecurringId ? "Redaguoti pasikartojančią išlaidą" : "Pastovios išlaidos"}
              </h2>
            </div>
            {editingRecurringId ? (
              <button type="button" className="button-secondary" onClick={handleCancelRecurringEdit}>
                Atšaukti
              </button>
            ) : null}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleRecurringSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Pavadinimas</span>
              <input
                name="title"
                value={recurringForm.title}
                onChange={handleRecurringFormChange}
                placeholder="Nuoma, Netflix, sporto klubas"
                className="input-field"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted">Suma</span>
                <input
                  name="amount"
                  value={recurringForm.amount}
                  onChange={handleRecurringFormChange}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="input-field"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted">Kategorija</span>
                <select
                  name="category"
                  value={recurringForm.category}
                  onChange={handleRecurringFormChange}
                  className="select-field"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Periodiškumas</span>
              <select
                name="frequency"
                value={recurringForm.frequency}
                onChange={handleRecurringFormChange}
                className="select-field"
              >
                {recurringFrequencies.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Pastabos</span>
              <textarea
                name="notes"
                value={recurringForm.notes}
                onChange={handleRecurringFormChange}
                placeholder="Kas kartojasi automatiškai arba vis sugrįžta kiekvieną laikotarpį?"
                className="textarea-field"
              />
            </label>

            <button type="submit" className="button-primary w-full gap-2" disabled={savingRecurring}>
              <Repeat size={16} />
              {savingRecurring
                ? "Saugoma..."
                : editingRecurringId
                ? "Atnaujinti pasikartojančią išlaidą"
                : "Pridėti pasikartojančią išlaidą"}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {recurringExpenses.length ? (
              recurringExpenses.map((recurringExpense) => (
                <div key={recurringExpense._id} className="soft-card rounded-[24px] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-2xl font-bold">{recurringExpense.title}</h3>
                        <span className="premium-tag">{recurringExpense.category}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {formatRecurringFrequency(recurringExpense.frequency, recurringFrequencies)}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl font-semibold">{money.format(recurringExpense.amount)}</p>
                      <p className="mt-1 text-sm text-muted">
                        ~ {money.format(recurringExpense.monthlyEquivalent || recurringMonthlyEquivalent(recurringExpense))} / mėn.
                      </p>
                    </div>
                  </div>

                  {recurringExpense.notes ? (
                    <p className="mt-3 text-sm leading-6 text-muted">{recurringExpense.notes}</p>
                  ) : null}

                  <div className="mt-4 rounded-[18px] border border-[rgb(var(--border))] bg-[rgb(var(--surface-soft))] px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">One-click log</p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {recurringExpense.lastLoggedMonth === currentRecurringMonth
                            ? "Ši pasikartojanti išlaida jau įtraukta į šio mėnesio faktines išlaidas."
                            : "Jei mokėjimas jau nuskaičiuotas, vienu paspaudimu paversk jį tikru mėnesio įrašu."}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="button-secondary gap-2 sm:self-start"
                        onClick={() => handleLogRecurringExpense(recurringExpense)}
                        disabled={
                          loggingRecurringId === recurringExpense._id ||
                          recurringExpense.lastLoggedMonth === currentRecurringMonth
                        }
                      >
                        <CheckCircle2 size={16} />
                        {loggingRecurringId === recurringExpense._id
                          ? "Įtraukiama..."
                          : recurringExpense.lastLoggedMonth === currentRecurringMonth
                          ? "Jau įtraukta"
                          : "Įtraukti į šį mėnesį"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-secondary gap-2"
                      onClick={() => handleEditRecurring(recurringExpense)}
                    >
                      <Pencil size={16} />
                      Redaguoti
                    </button>
                    <button
                      type="button"
                      className="button-secondary gap-2 text-red-600"
                      onClick={() => handleDeleteRecurring(recurringExpense._id)}
                      disabled={deletingRecurringId === recurringExpense._id}
                    >
                      <Trash2 size={16} />
                      {deletingRecurringId === recurringExpense._id ? "Šalinama..." : "Trinti"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Įtrauk pasikartojančias išlaidas ir pamatysi, kiek tavo mėnesį jau “suvalgo” vien pastovūs mokėjimai.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">goal strategy</p>
              <h2 className="mt-4 text-4xl font-bold">Kaip išdėlioti tikslus protingiau</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Čia matosi ne tik progresas, bet ir kuriam tikslui verta duoti pirmumą, kiek jam reikėtų per mėnesį
                ir ar dabartinis rezervas realiai pakelia tą tempą.
              </p>
            </div>
            <Target size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ForecastMetricTile
              label="Aktyvūs tikslai"
              value={String(goalStrategyBoard.length)}
              hint="Dar nepasiekti tikslai"
            />
            <ForecastMetricTile
              label="Fokusuoti dabar"
              value={String(goalStrategyBoard.filter((goal) => goal.priority === "focus").length)}
              hint="Tikslai, kuriems reikia daugiausia dėmesio"
            />
            <ForecastMetricTile
              label="Didžiausias mėn. tempas"
              value={
                goalStrategyBoard[0]?.recommendedMonthly ? money.format(goalStrategyBoard[0].recommendedMonthly) : "—"
              }
              hint="Didžiausias rekomenduojamas atsidėjimas"
            />
          </div>

          <div className="mt-6 space-y-4">
            {goalStrategyBoard.length ? (
              goalStrategyBoard.map((goal) => (
                <GoalStrategyCard key={goal._id} goal={goal} onOpen={() => scrollToSection("savings-goals")} />
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Kai turėsi bent vieną aktyvų tikslą, čia galėsi matyti kuriam verta duoti pirmumą ir kokio mėnesio
                tempo iš tikro jam reikia.
              </div>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">recurring intelligence</p>
              <h2 className="mt-4 text-4xl font-bold">Ką verta peržiūrėti recurring dalyje</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Čia recurring sąrašas jau pereina iš paprasto registro į kontrolės zoną: matai ketvirčio naštą,
                stipriausias kategorijas ir kur verta pradėti review.
              </p>
            </div>
            <Repeat size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ForecastMetricTile
              label="Per ketvirtį"
              value={money.format(recurringQuarterlyTotal)}
              hint="Recurring našta per 3 mėn."
            />
            <ForecastMetricTile
              label="Per metus"
              value={money.format(recurringAnnualTotal)}
              hint="Pilnas annual vaizdas"
            />
            <ForecastMetricTile
              label="Top kategorija"
              value={recurringCategoryLeaders[0]?.category || "—"}
              hint={
                recurringCategoryLeaders[0]
                  ? money.format(recurringCategoryLeaders[0].annualEquivalent)
                  : "Kai bus daugiau recurring"
              }
            />
          </div>

          <div className="mt-6 space-y-4">
            {recurringReviewQueue.length ? (
              recurringReviewQueue.map((expense) => (
                <RecurringReviewCard
                  key={expense._id}
                  expense={expense}
                  onOpen={() =>
                    handleActionFocus({
                      targetId: "savings-ledger",
                      focusCategory: expense.category,
                      focusMonth: selectedBudgetMonth,
                    })
                  }
                />
              ))
            ) : (
              <div className="soft-card rounded-[24px] p-8 text-center text-muted">
                Kai turėsi bent kelias pastovias išlaidas, čia iškart matysi kur review duotų didžiausią naudą.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="savings-automation" className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">summary emails</p>
              <h2 className="mt-4 text-4xl font-bold">Savaitinės ir mėnesinės suvestinės</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Įsijunk el. pašto suvestines, kad programa pati primintų, kur išteka pinigai ir kiek dar telpa
                taupymui.
              </p>
            </div>
            <Mail size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSaveEmailSettings}>
            <label className="flex items-start gap-3 rounded-[18px] border border-[rgb(var(--border))] bg-[rgb(var(--surface-soft))] px-4 py-4">
              <input
                type="checkbox"
                name="summaryEmailsEnabled"
                checked={emailSettingsForm.summaryEmailsEnabled}
                onChange={handleEmailSettingsChange}
                className="mt-1 h-4 w-4 rounded border-[rgb(var(--border))]"
              />
              <span>
                <span className="block text-sm font-semibold">Įjungti automatinę suvestinę</span>
                <span className="mt-1 block text-sm leading-6 text-muted">
                  Kai aktyvuota, šis profilis yra paruoštas gauti trumpas Stilloak įžvalgas el. paštu.
                </span>
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Numatytas ritmas</span>
              <select
                name="summaryEmailFrequency"
                value={emailSettingsForm.summaryEmailFrequency}
                onChange={handleEmailSettingsChange}
                className="select-field"
                disabled={!emailSettingsForm.summaryEmailsEnabled}
              >
                <option value="weekly">Savaitinė suvestinė</option>
                <option value="monthly">Mėnesinė suvestinė</option>
              </select>
            </label>

            <button type="submit" className="button-primary w-full gap-2" disabled={savingEmailSettings}>
              <Mail size={16} />
              {savingEmailSettings ? "Saugoma..." : "Išsaugoti suvestinių nustatymus"}
            </button>
          </form>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="button-secondary w-full justify-center gap-2"
              onClick={() => handleSendSummaryEmail("weekly")}
              disabled={sendingSummaryEmail}
            >
              <Mail size={16} />
              {sendingSummaryEmail ? "Siunčiama..." : "Išsiųsti savaitės suvestinę"}
            </button>
            <button
              type="button"
              className="button-secondary w-full justify-center gap-2"
              onClick={() => handleSendSummaryEmail("monthly")}
              disabled={sendingSummaryEmail}
            >
              <Mail size={16} />
              {sendingSummaryEmail ? "Siunčiama..." : "Išsiųsti mėnesio suvestinę"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="button-secondary w-full justify-center gap-2"
              onClick={() => handleDownloadSummary("weekly")}
              disabled={downloadingSummaryKey === "weekly"}
            >
              <Download size={16} />
              {downloadingSummaryKey === "weekly" ? "Ruošiama..." : "Atsisiųsti savaitės suvestinę"}
            </button>
            <button
              type="button"
              className="button-secondary w-full justify-center gap-2"
              onClick={() => handleDownloadSummary("monthly")}
              disabled={downloadingSummaryKey === "monthly"}
            >
              <Download size={16} />
              {downloadingSummaryKey === "monthly" ? "Ruošiama..." : "Atsisiųsti mėnesio suvestinę"}
            </button>
          </div>

          <div className="mt-6 soft-card rounded-[24px] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Statusas</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              {profile?.summaryEmailLastSentAt
                ? `Paskutinė suvestinė išsiųsta ${dateFormatter.format(new Date(profile.summaryEmailLastSentAt))}.`
                : "Suvestinių dar nesiuntėme. Gali pasibandyti rankinį siuntimą ir pamatyti, kaip atrodys laiškas."}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Savaitės ir mėnesio suvestines gali atsisiųsti pakartotinai. Kiekvienas parsisiuntimas sugeneruoja naują
              failą.
            </p>
          </div>

          <div className="mt-6 soft-card rounded-[24px] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Suvestinių archyvas</p>
                <h3 className="mt-2 text-xl font-semibold">Paskutiniai suvestinių veiksmai</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Vienoje vietoje matai, ką paskutinį siuntei ar atsisiuntei, ir gali pakartoti veiksmą be klaidžiojimo
                  po visą studio.
                </p>
              </div>
              <History size={18} style={{ color: "rgb(var(--accent))" }} />
            </div>

            <div className="mt-5 space-y-3">
              {summaryArchive.length ? (
                summaryArchive.slice(0, 6).map((item) => (
                  <SummaryArchiveItem
                    key={item.id}
                    item={item}
                    onDownload={(frequency) => handleDownloadSummary(frequency)}
                    onSend={(frequency) => handleSendSummaryEmail(frequency)}
                  />
                ))
              ) : (
                <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-4 text-sm text-muted">
                  Kai bent kartą išsiųsi ar atsisiųsi suvestinę, čia pradės kauptis patogi istorija.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">csv import</p>
              <h2 className="mt-4 text-4xl font-bold">Banko išrašo importas</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Jei turi CSV iš banko ar kitos programos, gali greitai sukelti išlaidas ir pamatyti visą mėnesio
                vaizdą be rankinio suvedimo.
              </p>
            </div>
            <Download size={20} style={{ color: "rgb(var(--accent))" }} />
          </div>

          <div className="mt-6 rounded-[24px] border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface-soft))] p-5">
            <label className="block">
              <span className="text-sm font-semibold text-muted">Pasirink CSV failą</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvImport}
                disabled={previewingCsv || confirmingCsvImport}
                className="input-field mt-3 file:mr-4 file:rounded-full file:border-0 file:bg-[rgb(var(--accent))] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[rgb(var(--accent-contrast))]"
              />
            </label>

            <p className="mt-4 text-sm leading-6 text-muted">
              {previewingCsv
                ? "CSV preview ruošiamas, palauk kelias sekundes."
                : confirmingCsvImport
                ? "Preview eilutės importuojamos, palauk kelias sekundes."
                : "Sistema atpažįsta dažniausius stulpelius ir prieš importą parodo, kaip jos bus suklasifikuotos."}
            </p>
          </div>

          {csvPreviewResult ? (
            <div className="mt-6 space-y-4">
              <div className="soft-card rounded-[24px] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Preview</p>
                    <h3 className="mt-2 text-xl font-semibold">{csvFileName || "CSV failas"}</h3>
                    <p className="mt-2 text-sm text-muted">
                      Tinkamos eilutės: {csvPreviewResult.validCount} · Netinkamos: {csvPreviewResult.invalidCount}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-primary gap-2"
                      onClick={handleConfirmCsvImport}
                      disabled={confirmingCsvImport || !csvPreviewResult.validCount}
                    >
                      <Download size={16} />
                      {confirmingCsvImport ? "Importuojama..." : `Importuoti ${csvPreviewResult.validCount} eilučių`}
                    </button>
                    <button type="button" className="button-secondary" onClick={handleClearCsvPreview}>
                      Išvalyti preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="soft-card rounded-[24px] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Pirmos eilutės</p>
                <div className="mt-4 space-y-3">
                  {(csvPreviewResult.preview || []).map((row) => (
                    <div
                      key={`${row.rowNumber}-${row.status}`}
                      className={`rounded-[18px] px-4 py-4 ${
                        row.status === "ok"
                          ? "bg-[rgb(var(--surface-soft))]"
                          : "border border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold">Eilutė {row.rowNumber}</p>
                          {row.status === "ok" ? (
                            <p className="mt-1 text-sm text-muted">
                              {row.normalized.title} · {money.format(row.normalized.amount)} · {row.normalized.category}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-red-600">{row.error}</p>
                          )}
                        </div>
                        <span className="premium-tag">{row.status === "ok" ? "Tinkama" : "Tikrinti"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="soft-card rounded-[24px] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Priimami stulpeliai</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                <li>`title`, `name`, `description`, `merchant`</li>
                <li>`amount`, `sum`, `value`, `price`</li>
                <li>`date`, `transactionDate`, `bookingDate`, `data`</li>
                <li>`category`, `kategorija`, `notes`, `memo`</li>
              </ul>
            </div>

            <div className="soft-card rounded-[24px] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Kaip veikia</p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-muted">
                <li>1. Iš banko eksportuoji CSV.</li>
                <li>2. Įkeli jį čia vienu veiksmu.</li>
                <li>3. Pirmiausia matai preview, tik tada patvirtini importą.</li>
              </ol>
            </div>
          </div>

          <button
            type="button"
            className="button-secondary mt-6 w-full justify-center gap-2"
            onClick={handleDownloadBackup}
            disabled={downloadingBackup}
          >
            <Download size={16} />
            {downloadingBackup ? "Ruošiama..." : "Atsisiųsti JSON backup"}
          </button>
        </div>
      </section>

      {usageWizardOpen ? (
        <UsageWizardModal
          currentStep={usageWizardCurrentStep}
          isFirstStep={usageWizardStep === 0}
          isLastStep={usageWizardStep === USAGE_WIZARD_STEPS.length - 1}
          onBack={() => setUsageWizardStep((current) => Math.max(current - 1, 0))}
          onClose={closeUsageWizard}
          onComplete={completeUsageWizard}
          onGoToSection={goToUsageWizardTarget}
          onNext={() => setUsageWizardStep((current) => Math.min(current + 1, USAGE_WIZARD_STEPS.length - 1))}
          stepIndex={usageWizardStep}
          totalSteps={USAGE_WIZARD_STEPS.length}
        />
      ) : null}
    </div>
  );
};

const ActionPriorityRow = ({ action, index, onOpen }) => {
  const toneClasses = {
    danger: {
      container: "border-red-400/20 bg-red-400/10 text-red-50",
      body: "text-red-50/80",
      meta: "text-red-100/70",
    },
    warning: {
      container: "border-amber-300/20 bg-amber-300/10 text-amber-50",
      body: "text-amber-50/80",
      meta: "text-amber-100/70",
    },
    success: {
      container: "border-emerald-400/20 bg-emerald-400/10 text-emerald-50",
      body: "text-emerald-50/80",
      meta: "text-emerald-100/70",
    },
    info: {
      container: "border-white/10 bg-white/5 text-white",
      body: "text-white/72",
      meta: "text-white/48",
    },
  };

  const classes = toneClasses[action.tone] || toneClasses.info;

  return (
    <div className={`rounded-[18px] border px-4 py-4 ${classes.container}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
          {index + 1}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{action.title}</p>
          <p className={`mt-2 text-sm leading-6 ${classes.body}`}>{action.body}</p>
          <p className={`mt-3 text-xs uppercase tracking-[0.18em] ${classes.meta}`}>{action.meta}</p>
          {action.ctaLabel ? (
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-current"
              onClick={() => onOpen?.(action)}
            >
              {action.ctaLabel}
              <ArrowUpRight size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const ForecastMetricTile = ({ hint, label, value }) => (
  <div className="soft-card rounded-[24px] p-5">
    <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
    <p className="mt-3 text-2xl font-semibold">{value}</p>
    <p className="mt-2 text-sm leading-6 text-muted">{hint}</p>
  </div>
);

const GoalScenarioCard = ({ scenario }) => (
  <div className="soft-card rounded-[24px] p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">{scenario.label}</p>
        <h3 className="mt-2 text-xl font-semibold">{money.format(scenario.monthlyAmount)} / mėn.</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Jei laikysies tokio tempo, tikslą pasieksi apie {scenario.finishLabel}.
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
          scenario.status === "behind"
            ? "bg-red-50 text-red-600"
            : scenario.status === "tight"
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {goalPaceStatusLabel(scenario.status)}
      </span>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Mėnesiai iki tikslo</p>
        <p className="mt-2 text-lg font-semibold">{scenario.monthsToGoal}</p>
      </div>
      <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Rezervas po recurring</p>
        <p
          className={`mt-2 text-lg font-semibold ${
            scenario.slack !== null && scenario.slack < 0 ? "text-red-600" : ""
          }`}
        >
          {scenario.slack === null ? "—" : money.format(scenario.slack)}
        </p>
      </div>
    </div>
  </div>
);

const CategoryShiftCard = ({ currentMonthLabel, item, onOpen, previousMonthLabel }) => (
  <div className="soft-card rounded-[24px] p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold">{item.category}</h3>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              item.direction === "up"
                ? "bg-red-50 text-red-600"
                : item.direction === "down"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-[rgb(var(--surface-soft))] text-muted"
            }`}
          >
            {item.direction === "up" ? "Auga" : item.direction === "down" ? "Mažėja" : "Stabilu"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          {currentMonthLabel} išleidai {money.format(item.currentTotal)}, o {previousMonthLabel} buvo{" "}
          {money.format(item.previousTotal)}.
        </p>
      </div>
      <div className="text-right">
        <p
          className={`text-lg font-semibold ${
            item.delta > 0 ? "text-red-600" : item.delta < 0 ? "text-emerald-700" : ""
          }`}
        >
          {item.delta > 0 ? "+" : ""}
          {money.format(item.delta)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
          {item.deltaPercent > 0 ? "+" : ""}
          {item.deltaPercent}%
        </p>
      </div>
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">
        {item.direction === "up"
          ? "Čia verta pažiūrėti konkrečius pirkinius ir tempą."
          : item.direction === "down"
          ? "Matyti realus atlaisvėjimas šioje kategorijoje."
          : "Kategorija kol kas juda gana stabiliai."}
      </p>
      <button type="button" className="button-secondary gap-2" onClick={onOpen}>
        Rodyti įrašus
        <ArrowUpRight size={14} />
      </button>
    </div>
  </div>
);

const ActivityTimelineItem = ({ item, onOpen }) => {
  const toneClasses = {
    warning: "border-amber-300/25 bg-amber-50/60",
    success: "border-emerald-300/25 bg-emerald-50/60",
    info: "border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-soft))]",
  };

  return (
    <div className={`rounded-[24px] border p-5 ${toneClasses[item.tone] || toneClasses.info}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{item.timestamp}</p>
          <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
        </div>

        {item.ctaLabel ? (
          <button type="button" className="button-secondary gap-2 sm:shrink-0" onClick={() => onOpen?.(item)}>
            {item.ctaLabel}
            <ArrowUpRight size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

const GoalStrategyCard = ({ goal, onOpen }) => {
  const priorityClasses = {
    focus: "bg-red-50 text-red-600",
    watch: "bg-amber-50 text-amber-700",
    steady: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="soft-card rounded-[24px] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold">{goal.title}</h3>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${priorityClasses[goal.priority] || priorityClasses.steady}`}>
              {goal.strategyTitle}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{goal.strategyNote}</p>
        </div>
        <button type="button" className="button-secondary gap-2 sm:shrink-0" onClick={onOpen}>
          Peržiūrėti tikslą
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Liko sukaupti</p>
          <p className="mt-2 text-lg font-semibold">{money.format(goal.remaining)}</p>
        </div>
        <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Reikia per mėn.</p>
          <p className="mt-2 text-lg font-semibold">{money.format(goal.recommendedMonthly)}</p>
        </div>
        <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Vietos reikalauja</p>
          <p className="mt-2 text-lg font-semibold">
            {goal.shareOfFree === null ? "—" : `${goal.shareOfFree}%`}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {goal.monthsLeft ? `Tikslinė data po maždaug ${goal.monthsLeft} mėn.` : "Šis tikslas dar neturi tikslios datos."}
      </p>
    </div>
  );
};

const RecurringReviewCard = ({ expense, onOpen }) => {
  const priorityClasses = {
    focus: "bg-red-50 text-red-600",
    watch: "bg-amber-50 text-amber-700",
    steady: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="soft-card rounded-[24px] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold">{expense.title}</h3>
            <span className="premium-tag">{expense.category}</span>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${priorityClasses[expense.priority] || priorityClasses.steady}`}>
              {expense.priority === "focus" ? "Review first" : expense.priority === "watch" ? "Stebėti" : "Stabilu"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{expense.note}</p>
        </div>
        <button type="button" className="button-secondary gap-2 sm:shrink-0" onClick={onOpen}>
          Rodyti kategoriją
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Per mėn.</p>
          <p className="mt-2 text-lg font-semibold">{money.format(expense.monthlyEquivalent)}</p>
        </div>
        <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Per metus</p>
          <p className="mt-2 text-lg font-semibold">{money.format(expense.annualEquivalent)}</p>
        </div>
        <div className="rounded-[18px] bg-[rgb(var(--surface-soft))] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Recurring dalis</p>
          <p className="mt-2 text-lg font-semibold">{expense.shareOfRecurring}%</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {formatRecurringFrequency(expense.frequency, [
          { value: "weekly", label: "Kas savaitę" },
          { value: "monthly", label: "Kas mėnesį" },
          { value: "quarterly", label: "Kas ketvirtį" },
          { value: "yearly", label: "Kartą per metus" },
        ])}
        {expense.shareOfIncome !== null ? ` · apie ${expense.shareOfIncome}% mėnesio pajamų` : ""}
      </p>
    </div>
  );
};

const SummaryArchiveItem = ({ item, onDownload, onSend }) => {
  const frequency = item.metadata?.frequency || "weekly";
  const isBackup = item.action === "backup-export";

  return (
    <div className="rounded-[20px] bg-[rgb(var(--surface-soft))] px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{item.timestamp}</p>
          <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
        </div>
        {!isBackup ? (
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <button type="button" className="button-secondary gap-2" onClick={() => onDownload(frequency)}>
              <Download size={14} />
              Atsisiųsti vėl
            </button>
            <button type="button" className="button-secondary gap-2" onClick={() => onSend(frequency)}>
              <Mail size={14} />
              Siųsti dar kartą
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const InsightTile = ({ hint, icon: Icon, label, value }) => (
  <div className="metric-card">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</p>
      <Icon size={18} style={{ color: "rgb(var(--accent-strong))" }} />
    </div>
    <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    <p className="mt-2 text-sm text-white/62">{hint}</p>
  </div>
);

const InsightSignalCard = ({ insight }) => {
  const toneMap = {
    success: {
      icon: CheckCircle2,
      borderClass: "border-emerald-400/20 bg-emerald-400/10",
      metricClass: "text-emerald-200",
    },
    warning: {
      icon: AlertTriangle,
      borderClass: "border-amber-300/20 bg-amber-300/10",
      metricClass: "text-amber-100",
    },
    danger: {
      icon: TrendingDown,
      borderClass: "border-red-400/20 bg-red-400/10",
      metricClass: "text-red-100",
    },
    info: {
      icon: ShieldCheck,
      borderClass: "border-white/10 bg-white/5",
      metricClass: "text-white",
    },
  };

  const config = toneMap[insight.tone] || toneMap.info;
  const Icon = config.icon;

  return (
    <div className={`rounded-[18px] border px-4 py-4 ${config.borderClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{insight.title}</p>
          <p className="mt-2 text-sm leading-6 text-white/72">{insight.body}</p>
        </div>
        <Icon size={18} className={config.metricClass} />
      </div>
      {insight.metric ? <p className={`mt-3 text-sm font-semibold ${config.metricClass}`}>{insight.metric}</p> : null}
    </div>
  );
};

const UsageWizardModal = ({
  currentStep,
  isFirstStep,
  isLastStep,
  onBack,
  onClose,
  onComplete,
  onGoToSection,
  onNext,
  stepIndex,
  totalSteps,
}) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_30px_120px_rgba(0,0,0,0.28)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted">{currentStep.eyebrow}</p>
          <h2 className="mt-3 text-4xl font-bold">{currentStep.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{currentStep.description}</p>
        </div>

        <button type="button" className="button-secondary" onClick={onClose}>
          Uždaryti
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="soft-card rounded-[28px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Ką padaryti šiame žingsnyje</p>
          <div className="mt-4 space-y-4">
            {currentStep.bullets.map((bullet, index) => (
              <div key={bullet} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-sm font-semibold text-[rgb(var(--accent-contrast))]">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-6 text-muted">{bullet}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card rounded-[28px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Progresas</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgb(var(--surface-soft))]">
            <div
              className="h-full rounded-full bg-[rgb(var(--accent))]"
              style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-muted">
            Žingsnis {stepIndex + 1} iš {totalSteps}
          </p>

          <div className="mt-6 space-y-3">
            <button type="button" className="button-primary w-full" onClick={onGoToSection}>
              Rodyti šią vietą puslapyje
            </button>
            <p className="text-sm leading-6 text-muted">
              Šis mygtukas uždarys gidą ir nuves tiesiai į tą Stilloak vietą, kurią verta susitvarkyti dabar.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {!isFirstStep ? (
            <button type="button" className="button-secondary gap-2" onClick={onBack}>
              <ChevronLeft size={16} />
              Atgal
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {!isLastStep ? (
            <button type="button" className="button-primary gap-2" onClick={onNext}>
              Toliau
              <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" className="button-primary gap-2" onClick={onComplete}>
              <CheckCircle2 size={16} />
              Užbaigti gidą
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default SavingsStudioPage;
