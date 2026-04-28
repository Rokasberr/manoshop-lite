import {
  AlertTriangle,
  CheckCircle2,
  PiggyBank,
  Pencil,
  Plus,
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
  currentMonthKey,
  dateFormatter,
  DEFAULT_CATEGORIES,
  emptyEntry,
  formatChange,
  getBudgetStatus,
  money,
} from "../components/savings/savingsStudioHelpers";

const SavingsStudioPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [budgetInputs, setBudgetInputs] = useState({});
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
  const [deletingId, setDeletingId] = useState("");

  const deferredSearch = useDeferredValue(filters.search.trim().toLowerCase());
  const selectedBudgetMonth = filters.month === "all" ? currentMonthKey() : filters.month;

  useEffect(() => {
    const loadStudio = async () => {
      try {
        setLoading(true);

        const [metaResult, entriesResult, summaryResult, budgetsResult] = await Promise.all([
          savingsStudioService.getMeta(),
          savingsStudioService.getEntries(),
          savingsStudioService.getSummary(),
          savingsStudioService.getBudgets(currentMonthKey()),
        ]);

        startTransition(() => {
          const apiCategories = metaResult.categories?.length ? metaResult.categories : DEFAULT_CATEGORIES;
          setCategories(apiCategories);
          setEntries(entriesResult.entries || []);
          setSummary(summaryResult.summary || null);
          setBudgets(budgetsResult.budgets || []);
          setBudgetInputs(
            Object.fromEntries(
              (budgetsResult.budgets || []).map((budget) => [budget.category, String(budget.limitAmount)])
            )
          );
          setEntryForm((current) => ({
            ...current,
            category: current.category || apiCategories[1] || apiCategories[0] || "Maistas",
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
          Object.fromEntries(
            (budgetResult.budgets || []).map((budget) => [budget.category, String(budget.limitAmount)])
          )
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
  const budgetProgress = categories
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
    .filter((entry) => entry.limitAmount > 0 || entry.spent > 0);

  const budgetOverview = {
    setCount: budgetProgress.filter((entry) => entry.limitAmount > 0).length,
    overCount: budgetProgress.filter((entry) => entry.status === "over").length,
    warningCount: budgetProgress.filter((entry) => entry.status === "warning").length,
  };

  const refreshStudio = async () => {
    const [entriesResult, summaryResult] = await Promise.all([
      savingsStudioService.getEntries(),
      savingsStudioService.getSummary(),
    ]);

    startTransition(() => {
      setEntries(entriesResult.entries || []);
      setSummary(summaryResult.summary || null);
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setEntryForm((current) => ({
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await savingsStudioService.updateEntry(editingId, entryForm);
      } else {
        await savingsStudioService.createEntry(entryForm);
      }

      await refreshStudio();
      setEntryForm(emptyEntry(categories));
      setEditingId("");
      toast.success(editingId ? "Išlaida atnaujinta." : "Išlaida išsaugota.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko išsaugoti išlaidos.");
    } finally {
      setSubmitting(false);
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
      await refreshStudio();
      toast.success("Išlaida ištrinta.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko ištrinti išlaidos.");
    } finally {
      setDeletingId("");
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

  const handleCancelEdit = () => {
    setEditingId("");
    setEntryForm(emptyEntry(categories));
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
        Object.fromEntries(
          (budgetResult.budgets || []).map((budget) => [budget.category, String(budget.limitAmount)])
        )
      );
      toast.success("Biudžetai atnaujinti.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko išsaugoti biudžetų.");
    } finally {
      setSavingBudgets(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const monthlyTotals = summary?.monthlyTotals || [];
  const categoryTotals = summary?.categoryTotals || [];
  const highestMonthlyTotal = Math.max(...monthlyTotals.map((entry) => entry.total), 1);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="members tool"
        title="Savings Studio"
        subtitle="Privati nario darbo zona, kur matai, kur išeina pinigai, kaip keičiasi mėnesiai ir kur gali susigrąžinti finansinį aiškumą."
      />

      <section className="marketing-dark overflow-hidden rounded-[34px] px-6 py-7 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="hero-chip">Circle feature</span>
            <h2 className="mt-6 font-display text-5xl font-bold leading-[0.95]">
              {user?.name?.split(" ")[0]}, čia tavo pinigų aiškumo kambarys.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
              Šis modulis leidžia suvesti kasdienes išlaidas, pamatyti bendrą mėnesio vaizdą ir rasti
              kategorijas, kuriose lengviausia sutaupyti be chaoso.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <InsightTile
                icon={WalletCards}
                label="Šis mėnuo"
                value={money.format(summary?.monthTotal || 0)}
                hint={formatChange(summary?.change)}
              />
              <InsightTile
                icon={TrendingDown}
                label="Vidutinė išlaida"
                value={money.format(summary?.averageSpend || 0)}
                hint={`${summary?.recentCount || 0} įrašų`}
              />
              <InsightTile
                icon={PiggyBank}
                label="Didžiausia sritis"
                value={summary?.topCategory || "Dar nėra"}
                hint={money.format(categoryTotals[0]?.total || 0)}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <InsightTile
                icon={Target}
                label="Biudžetai"
                value={String(budgetOverview.setCount)}
                hint={`${selectedBudgetMonth} mėnuo`}
              />
              <InsightTile
                icon={AlertTriangle}
                label="Viršyti"
                value={String(budgetOverview.overCount)}
                hint="Kategorijos virš limito"
              />
              <InsightTile
                icon={CheckCircle2}
                label="Prie ribos"
                value={String(budgetOverview.warningCount)}
                hint="85% ir daugiau panaudota"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Taupymo signalai</p>
                <h3 className="mt-3 font-display text-3xl font-bold">Kur verta žiūrėti pirmiausia</h3>
              </div>
              <ShieldCheck size={20} style={{ color: "rgb(var(--accent-strong))" }} />
            </div>

            <div className="mt-6 space-y-3">
              {[
                `Filtruota suma: ${money.format(filteredTotal)}`,
                `Top kategorija: ${summary?.topCategory || "Dar nėra duomenų"}`,
                `Mėnesio pokytis: ${formatChange(summary?.change)}`,
                `Aktyvus biudžeto mėnuo: ${selectedBudgetMonth}`,
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

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Pavadinimas</span>
              <input
                name="title"
                value={entryForm.title}
                onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
                  className="input-field"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted">Kategorija</span>
              <select
                name="category"
                value={entryForm.category}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                  Nustatyk, kiek nori skirti kiekvienai kategorijai pasirinktam mėnesiui, ir stebėk kiek lieka.
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
