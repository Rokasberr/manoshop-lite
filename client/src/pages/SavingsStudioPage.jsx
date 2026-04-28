import {
  AlertTriangle,
  CheckCircle2,
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
  recurringMonthlyEquivalent,
} from "../components/savings/savingsStudioHelpers";

const ONBOARDING_BUDGET_CATEGORIES = ["Būstas", "Maistas", "Transportas"];

const SavingsStudioPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [focusOptions, setFocusOptions] = useState(DEFAULT_FOCUS_OPTIONS);
  const [recurringFrequencies, setRecurringFrequencies] = useState(DEFAULT_RECURRING_FREQUENCIES);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    monthlyIncome: "",
    monthlySavingsTarget: "",
    primaryFocus: DEFAULT_FOCUS_OPTIONS[0],
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
  const [deletingId, setDeletingId] = useState("");
  const [deletingGoalId, setDeletingGoalId] = useState("");
  const [deletingRecurringId, setDeletingRecurringId] = useState("");

  const deferredSearch = useDeferredValue(filters.search.trim().toLowerCase());
  const selectedBudgetMonth = filters.month === "all" ? currentMonthKey() : filters.month;

  useEffect(() => {
    const loadStudio = async () => {
      try {
        setLoading(true);

        const [metaResult, profileResult, entriesResult, summaryResult, budgetsResult, goalsResult, recurringResult] =
          await Promise.all([
            savingsStudioService.getMeta(),
            savingsStudioService.getProfile(),
            savingsStudioService.getEntries(),
            savingsStudioService.getSummary(),
            savingsStudioService.getBudgets(currentMonthKey()),
            savingsStudioService.getGoals(),
            savingsStudioService.getRecurringExpenses(),
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
          setProfileForm({
            monthlyIncome: profileResult.profile?.monthlyIncome ? String(profileResult.profile.monthlyIncome) : "",
            monthlySavingsTarget: profileResult.profile?.monthlySavingsTarget
              ? String(profileResult.profile.monthlySavingsTarget)
              : "",
            primaryFocus: profileResult.profile?.primaryFocus || apiFocusOptions[0] || "",
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
        toast.error(error.response?.data?.message || "Nepavyko užkrauti Savings Studio.");
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
          const spent = Number(spentByCategory[category] || 0);
          const limitAmount = Number(budget?.limitAmount || 0);
          const remaining = limitAmount ? Number((limitAmount - spent).toFixed(2)) : 0;
          const percentUsed = limitAmount ? Math.min((spent / limitAmount) * 100, 100) : 0;

          return {
            category,
            spent,
            limitAmount,
            remaining,
            percentUsed,
            status: getBudgetStatus({ spent, limitAmount }),
          };
        })
        .filter((entry) => entry.limitAmount > 0 || entry.spent > 0),
    [budgets, categories, spentByCategory]
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

  const recurringMonthlyTotal = recurringExpenses.reduce(
    (sum, recurringExpense) => sum + Number(recurringExpense.monthlyEquivalent || recurringMonthlyEquivalent(recurringExpense)),
    0
  );

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
      toast.success("Pirmasis Savings Studio setup baigtas.");
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

  const monthlyTotals = summary?.monthlyTotals || [];
  const categoryTotals = summary?.categoryTotals || [];
  const highestMonthlyTotal = Math.max(...monthlyTotals.map((entry) => entry.total), 1);
  const activeGoalsCount = decoratedGoals.filter((goal) => !goal.complete).length;

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="members tool"
        title="Savings Studio"
        subtitle="Privati nario darbo zona, kur matai, kur išeina pinigai, kaip keičiasi mėnesiai ir kur gali susigrąžinti finansinį aiškumą."
      />

      {!profile?.onboardingCompleted && (
        <section className="public-section">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <span className="eyebrow">first setup</span>
              <h2 className="mt-5 text-5xl font-bold">Susidėk pirmą taupymo pagrindą</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                Šitas trumpas onboarding padeda tau iškart pradėti prasmingai: nustatai pajamas, mėnesio taupymo
                tikslą ir kelias pirmas biudžeto ribas svarbiausioms kategorijoms.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSaveOnboarding}>
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

              <button type="submit" className="button-primary w-full gap-2" disabled={savingOnboarding}>
                <CheckCircle2 size={16} />
                {savingOnboarding ? "Kuriama..." : "Užbaigti pirmą setup"}
              </button>
            </form>
          </div>
        </section>
      )}

      <section className="marketing-dark overflow-hidden rounded-[34px] px-6 py-7 sm:px-8 lg:px-10">
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

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <InsightTile
                icon={WalletCards}
                label="Šis mėnuo"
                value={money.format(summary?.monthTotal || 0)}
                hint={formatChange(summary?.change)}
              />
              <InsightTile
                icon={Target}
                label="Mėnesio tikslas"
                value={money.format(profile?.monthlySavingsTarget || 0)}
                hint={profile?.primaryFocus || "Dar nesuvestas fokusas"}
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
                icon={PiggyBank}
                label="Tikslai"
                value={String(activeGoalsCount)}
                hint="Aktyvūs taupymo tikslai"
              />
              <InsightTile
                icon={AlertTriangle}
                label="Viršyti"
                value={String(budgetOverview.overCount)}
                hint="Kategorijos virš limito"
              />
              <InsightTile
                icon={TrendingDown}
                label="Prie ribos"
                value={String(budgetOverview.warningCount)}
                hint="85% ir daugiau panaudota"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Aiškumo signalai</p>
                <h3 className="mt-3 font-display text-3xl font-bold">Kur verta žiūrėti pirmiausia</h3>
              </div>
              <ShieldCheck size={20} style={{ color: "rgb(var(--accent-strong))" }} />
            </div>

            <div className="mt-6 space-y-3">
              {[
                `Filtruota suma: ${money.format(filteredTotal)}`,
                `Top kategorija: ${summary?.topCategory || "Dar nėra duomenų"}`,
                `Mėnesio pajamos: ${money.format(profile?.monthlyIncome || 0)}`,
                `Biudžetų mėnuo: ${selectedBudgetMonth}`,
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-white/5 px-4 py-3 text-sm text-white/76">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.1fr_0.98fr]">
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
          <div className="panel p-6">
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
                        {money.format(entry.spent)} / {money.format(entry.limitAmount || 0)}
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

      <section className="grid gap-6 lg:grid-cols-2">
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

        <div className="panel p-6">
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

export default SavingsStudioPage;
