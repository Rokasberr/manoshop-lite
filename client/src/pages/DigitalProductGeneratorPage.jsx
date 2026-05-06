import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Copy,
  Download,
  FileText,
  Filter,
  Instagram,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  budgetOptions,
  formatResultsForCopy,
  generateDigitalProductIdeas,
  generateInstagramPostText,
  generateLandingPageCopy,
  outputCategories,
  preferredProductTypeOptions,
  productGoalOptions,
  skillLevelOptions,
  targetAudienceOptions,
  timeAvailableOptions,
  toneOptions,
} from "../lib/digitalProductIdeaEngine";
import { hasActiveMembership } from "../utils/membership";

const savedIdeasVersion = "stilloak_digital_product_saved_ideas_v1";

const initialForm = {
  niche: "",
  audience: "Pradedantieji",
  skillLevel: "Vidutinis",
  budget: "0–50 €",
  timeAvailable: "7 dienos",
  productGoal: "Greitai paleisti pirmą produktą",
  preferredProductTypes: [
    "PDF produktai",
    "Šablonai",
    "Checklistai",
    "Mini kursai",
    "Narystės",
    "Mini SaaS",
  ],
  tone: "Premium",
};

const sortOptions = [
  { id: "overall", label: "Bendras potencialas", icon: Star },
  { id: "profit", label: "Highest profit potential", icon: TrendingUp },
  { id: "speed", label: "Fastest to launch", icon: Clock3 },
  { id: "ease", label: "Easiest to create", icon: CheckCircle2 },
  { id: "premium", label: "Premium / high-ticket", icon: Briefcase },
];

const productTypeFilterOptions = [
  "Visi tipai",
  "PDF produktas",
  "Šablonas",
  "Checklistas",
  "Mini kursas",
  "Narystė",
  "Mini SaaS",
];

const scoreMetrics = [
  { key: "profitPotential", label: "Profit potential" },
  { key: "easeOfCreation", label: "Ease of creation" },
  { key: "speedToLaunch", label: "Speed to launch" },
  { key: "audienceDemand", label: "Audience demand" },
];

const dateFormatter = new Intl.DateTimeFormat("lt-LT", {
  dateStyle: "medium",
  timeStyle: "short",
});

const getUserStorageKey = (user) => {
  const userId = user?._id || user?.id || user?.email || "local";
  return `${savedIdeasVersion}:${userId}`;
};

const readSavedIdeas = (user) => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(getUserStorageKey(user)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const writeSavedIdeas = (user, ideas) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getUserStorageKey(user), JSON.stringify(ideas));
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

const formatDate = (value) => {
  try {
    return dateFormatter.format(new Date(value));
  } catch (_error) {
    return "";
  }
};

const getScoreWidth = (score) => `${Math.max(8, Math.min(100, Number(score || 0) * 10))}%`;

const FieldLabel = ({ htmlFor, label, helper }) => (
  <label htmlFor={htmlFor} className="block space-y-2">
    <span className="block text-sm font-semibold text-white">{label}</span>
    {helper && <span className="block text-xs leading-5 text-white/56">{helper}</span>}
  </label>
);

const ScoreBadge = ({ value, compact = false }) => (
  <span className={`digital-score-badge ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}>
    Potencialas: {value}/10
  </span>
);

const LockedState = () => (
  <div className="member-workspace digital-product-workspace p-5 sm:p-8 lg:p-10">
    <section className="digital-locked-state mx-auto max-w-4xl text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/10 text-[#f2d99a]">
        <LockKeyhole size={24} />
      </div>
      <span className="mt-6 inline-flex rounded-lg border border-white/12 bg-white/6 px-3 py-1 text-xs font-semibold uppercase text-white/70">
        Premium nario įrankis
      </span>
      <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-5xl">
        Skaitmeninio produkto idėjų generatorius
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/66">
        Šis įrankis prieinamas aktyviems Stilloak Studio nariams ir admin paskyroms. Pasirink planą, kad atrakintum
        idėjų generavimą, rezultatų eksportą ir išsaugotas idėjas.
      </p>
      <Link to="/pricing" className="button-primary mt-8 gap-2">
        Pasirink planą
        <ArrowUpRight size={16} />
      </Link>
    </section>
  </div>
);

const ProductIdeaCard = ({ idea, isBest = false, onSave }) => (
  <article className={`digital-result-card min-w-0 ${isBest ? "digital-result-card-best" : ""}`}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-white/64">
            {idea.productType}
          </span>
          {isBest && (
            <span className="rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-semibold text-[#f2d99a]">
              Rekomenduojama
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-xl font-bold leading-tight text-white">{idea.productName}</h3>
        <p className="mt-3 text-sm leading-7 text-white/68">{idea.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ScoreBadge value={idea.scores.overall} />
        <button
          type="button"
          onClick={() => onSave(idea)}
          className="digital-icon-button"
          aria-label={`Išsaugoti ${idea.productName}`}
          title="Save idea"
        >
          <Save size={17} />
        </button>
      </div>
    </div>

    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="digital-detail-label">Target customer</p>
          <p className="digital-detail-text">{idea.targetCustomer}</p>
        </div>
        <div>
          <p className="digital-detail-label">Problem it solves</p>
          <p className="digital-detail-text">{idea.problemSolved}</p>
        </div>
        <div>
          <p className="digital-detail-label">What is included</p>
          <ul className="mt-2 space-y-2">
            {idea.included.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-6 text-white/72">
                <CheckCircle2 size={15} className="mt-1 shrink-0 text-[#e2ca91]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="digital-mini-stat">
            <p className="digital-detail-label">Suggested price</p>
            <p className="mt-1 text-sm font-bold text-white">{idea.suggestedPrice}</p>
          </div>
          <div className="digital-mini-stat">
            <p className="digital-detail-label">Difficulty</p>
            <p className="mt-1 text-sm font-bold text-white">{idea.difficultyLevel}</p>
          </div>
          <div className="digital-mini-stat">
            <p className="digital-detail-label">Creation time</p>
            <p className="mt-1 text-sm font-bold text-white">{idea.estimatedCreationTime}</p>
          </div>
        </div>

        <div>
          <p className="digital-detail-label">Monetization angle</p>
          <p className="digital-detail-text">{idea.monetizationAngle}</p>
        </div>
        <div>
          <p className="digital-detail-label">First version MVP</p>
          <p className="digital-detail-text">{idea.firstVersionMvp}</p>
        </div>
        <div>
          <p className="digital-detail-label">Why this could sell</p>
          <p className="digital-detail-text">{idea.whyThisCouldSell}</p>
        </div>
        <div>
          <p className="digital-detail-label">Launch channel</p>
          <p className="digital-detail-text">{idea.launchChannelSuggestion}</p>
        </div>
      </div>
    </div>

    <div className="mt-6 grid gap-3 md:grid-cols-4">
      {scoreMetrics.map((metric) => (
        <div key={metric.key} className="digital-score-meter">
          <div className="flex items-center justify-between gap-3">
            <span>{metric.label}</span>
            <strong>{idea.scores[metric.key]}/10</strong>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#e2ca91]" style={{ width: getScoreWidth(idea.scores[metric.key]) }} />
          </div>
        </div>
      ))}
    </div>
  </article>
);

const DigitalProductGeneratorPage = () => {
  const { user } = useAuth();
  const canAccess = hasActiveMembership(user);
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("Visos");
  const [productTypeFilter, setProductTypeFilter] = useState("Visi tipai");
  const [sortMode, setSortMode] = useState("overall");
  const [savedIdeas, setSavedIdeas] = useState(() => readSavedIdeas(user));
  const [assetOutput, setAssetOutput] = useState(null);

  useEffect(() => {
    setSavedIdeas(readSavedIdeas(user));
  }, [user]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const togglePreferredType = (type) => {
    setForm((current) => {
      const currentTypes = new Set(current.preferredProductTypes);

      if (currentTypes.has(type)) {
        currentTypes.delete(type);
      } else {
        currentTypes.add(type);
      }

      return {
        ...current,
        preferredProductTypes: Array.from(currentTypes),
      };
    });
  };

  const filteredIdeas = useMemo(() => {
    if (!result) {
      return [];
    }

    let ideas = [...result.ideas];

    if (activeCategory !== "Visos") {
      ideas = ideas.filter((idea) => idea.category === activeCategory);
    }

    if (productTypeFilter !== "Visi tipai") {
      ideas = ideas.filter((idea) => idea.productType === productTypeFilter);
    }

    if (sortMode === "premium") {
      ideas = ideas.filter((idea) => ["Mini kursas", "Narystė", "Mini SaaS"].includes(idea.productType));
    }

    const sorters = {
      overall: (left, right) => right.scores.overall - left.scores.overall,
      profit: (left, right) => right.scores.profitPotential - left.scores.profitPotential,
      speed: (left, right) => right.scores.speedToLaunch - left.scores.speedToLaunch,
      ease: (left, right) => right.scores.easeOfCreation - left.scores.easeOfCreation,
      premium: (left, right) => right.scores.profitPotential - left.scores.profitPotential,
    };

    return ideas.sort(sorters[sortMode] || sorters.overall);
  }, [activeCategory, productTypeFilter, result, sortMode]);

  const groupedVisibleIdeas = useMemo(
    () =>
      outputCategories
        .map((category) => ({
          category,
          ideas: filteredIdeas.filter((idea) => idea.category === category),
        }))
        .filter((group) => group.ideas.length > 0),
    [filteredIdeas]
  );

  const handleGenerate = async (event) => {
    event.preventDefault();
    setGenerating(true);
    setError("");
    setAssetOutput(null);

    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 650);
      });

      const generated = generateDigitalProductIdeas(form);
      setResult(generated);
      setActiveCategory("Visos");
      setProductTypeFilter("Visi tipai");
      setSortMode("overall");
      toast.success("Idėjos sugeneruotos.");
    } catch (generationError) {
      const message = generationError.errors?.[0] || generationError.message || "Nepavyko sugeneruoti idėjų.";
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyResults = async () => {
    if (!result) {
      toast.error("Pirmiausia sugeneruok idėjas.");
      return;
    }

    try {
      await copyToClipboard(formatResultsForCopy(result));
      toast.success("Rezultatai nukopijuoti.");
    } catch (_error) {
      toast.error("Nepavyko nukopijuoti rezultatų.");
    }
  };

  const handlePrintPdf = () => {
    if (!result) {
      toast.error("Pirmiausia sugeneruok idėjas.");
      return;
    }

    toast.success("Spausdinimo lange pasirink „Save as PDF“.");
    window.print();
  };

  const handleSaveIdea = (idea) => {
    if (!result) {
      return;
    }

    const now = new Date().toISOString();
    const entry = {
      id: `${idea.id}-${Date.now()}`,
      userId: user?._id || user?.id || user?.email || "local",
      niche: result.input.niche,
      audience: result.input.audience,
      productType: idea.productType,
      productName: idea.productName,
      description: idea.description,
      score: idea.scores.overall,
      resultJson: {
        input: result.input,
        idea,
        recommendation: result.recommendation,
      },
      createdAt: now,
      updatedAt: now,
    };
    const nextSavedIdeas = [entry, ...savedIdeas].slice(0, 30);
    setSavedIdeas(nextSavedIdeas);
    writeSavedIdeas(user, nextSavedIdeas);
    toast.success("Idėja išsaugota.");
  };

  const handleDeleteSavedIdea = (ideaId) => {
    const nextSavedIdeas = savedIdeas.filter((idea) => idea.id !== ideaId);
    setSavedIdeas(nextSavedIdeas);
    writeSavedIdeas(user, nextSavedIdeas);
    toast.success("Idėja pašalinta.");
  };

  const handleGenerateAsset = (type) => {
    if (!result?.bestIdea) {
      toast.error("Pirmiausia sugeneruok idėjas.");
      return;
    }

    const isInstagram = type === "instagram";
    setAssetOutput({
      type,
      title: isInstagram ? "Instagram post text" : "Landing page copy",
      content: isInstagram
        ? generateInstagramPostText(result.bestIdea, result.input)
        : generateLandingPageCopy(result.bestIdea, result.input),
    });
  };

  const handleCopyAsset = async () => {
    if (!assetOutput?.content) {
      return;
    }

    try {
      await copyToClipboard(assetOutput.content);
      toast.success("Tekstas nukopijuotas.");
    } catch (_error) {
      toast.error("Nepavyko nukopijuoti teksto.");
    }
  };

  if (!canAccess) {
    return <LockedState />;
  }

  return (
    <div className="member-workspace digital-product-workspace p-4 sm:p-6 lg:p-8">
      <div className="digital-product-printable space-y-8">
        <section className="digital-product-hero overflow-hidden rounded-lg p-5 sm:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[1fr_0.72fr] xl:items-end">
            <div className="min-w-0">
              <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-semibold uppercase text-[#f2d99a]">
                Premium nario įrankis
              </span>
              <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Skaitmeninio produkto idėjų generatorius
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                Pasirink nišą, auditoriją ir tikslą — gauk konkrečias skaitmeninių produktų idėjas, kurias gali
                paversti parduodamu pasiūlymu.
              </p>
            </div>

            <div className="digital-hero-panel">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e2ca91]/12 text-[#f2d99a]">
                  <Lightbulb size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Idėjos su komerciniu kampu</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Kiekviena idėja turi kainodarą, MVP, pardavimo kanalą ir balą pagal paleidimo potencialą.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <form onSubmit={handleGenerate} className="digital-panel no-print p-5 sm:p-6 lg:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="digital-section-kicker">Generator form</span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">Produkto kryptis</h2>
              </div>
              <Wand2 size={24} className="text-[#e2ca91]" />
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-3">
                <FieldLabel
                  htmlFor="digital-niche"
                  label="Niša"
                  helper="Pvz., fitnessas, finansai, grožis, nekilnojamas turtas, AI įrankiai, edukacija, e-commerce, dizainas, social media, freelancing"
                />
                <input
                  id="digital-niche"
                  value={form.niche}
                  onChange={(event) => updateField("niche", event.target.value)}
                  maxLength={80}
                  className="digital-input"
                  placeholder="Įrašyk savo nišą"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <FieldLabel htmlFor="digital-audience" label="Tikslinė auditorija" />
                  <select
                    id="digital-audience"
                    value={form.audience}
                    onChange={(event) => updateField("audience", event.target.value)}
                    className="digital-input"
                  >
                    {targetAudienceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <FieldLabel htmlFor="digital-skill-level" label="Tavo patirties lygis" />
                  <select
                    id="digital-skill-level"
                    value={form.skillLevel}
                    onChange={(event) => updateField("skillLevel", event.target.value)}
                    className="digital-input"
                  >
                    {skillLevelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <FieldLabel htmlFor="digital-budget" label="Startinis biudžetas" />
                  <select
                    id="digital-budget"
                    value={form.budget}
                    onChange={(event) => updateField("budget", event.target.value)}
                    className="digital-input"
                  >
                    {budgetOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <FieldLabel htmlFor="digital-time" label="Kiek laiko gali skirti kūrimui?" />
                  <select
                    id="digital-time"
                    value={form.timeAvailable}
                    onChange={(event) => updateField("timeAvailable", event.target.value)}
                    className="digital-input"
                  >
                    {timeAvailableOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <FieldLabel htmlFor="digital-goal" label="Pagrindinis tikslas" />
                <select
                  id="digital-goal"
                  value={form.productGoal}
                  onChange={(event) => updateField("productGoal", event.target.value)}
                  className="digital-input"
                >
                  {productGoalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <FieldLabel label="Preferred product types" />
                <div className="grid gap-2 sm:grid-cols-2">
                  {preferredProductTypeOptions.map((type) => {
                    const isChecked = form.preferredProductTypes.includes(type);

                    return (
                      <label key={type} className={`digital-check-option ${isChecked ? "digital-check-option-active" : ""}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePreferredType(type)}
                          className="sr-only"
                        />
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/18 bg-white/6">
                          {isChecked && <CheckCircle2 size={14} className="text-[#e2ca91]" />}
                        </span>
                        <span>{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <FieldLabel htmlFor="digital-tone" label="Tone / positioning" />
                <select
                  id="digital-tone"
                  value={form.tone}
                  onChange={(event) => updateField("tone", event.target.value)}
                  className="digital-input"
                >
                  {toneOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-300/30 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
                  {error}
                </div>
              )}

              <button type="submit" disabled={generating} className="button-primary w-full gap-2 disabled:opacity-60">
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Kuriamos idėjos...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Sugeneruoti idėjas
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {!result ? (
              <section className="digital-empty-state p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#e2ca91]/24 bg-[#e2ca91]/10 text-[#f2d99a]">
                  <Sparkles size={22} />
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-white">Rezultatai atsiras čia</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
                  Užpildyk formą ir generatorius sukurs mažiausiai 12 idėjų per PDF produktus, šablonus, checklistus,
                  mini kursus, narystes ir mini SaaS kryptis.
                </p>
              </section>
            ) : (
              <>
                <section className="digital-panel p-5 sm:p-6 lg:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <span className="digital-section-kicker">Best idea recommendation</span>
                      <h2 className="mt-2 font-display text-2xl font-bold text-white">{result.recommendation.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-white/68">{result.recommendation.whyBest}</p>
                      <p className="mt-2 text-sm leading-7 text-white/68">{result.recommendation.fit}</p>
                    </div>
                    <ScoreBadge value={result.bestIdea.scores.overall} />
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="digital-recommendation-block">
                      <p className="digital-detail-label">What to build first</p>
                      <p className="digital-detail-text">{result.recommendation.buildFirst}</p>
                    </div>
                    <div className="digital-recommendation-block">
                      <p className="digital-detail-label">How to sell it in the first 48 hours</p>
                      <p className="digital-detail-text">{result.recommendation.sellIn48Hours}</p>
                    </div>
                  </div>
                </section>

                <section className="digital-panel p-5 sm:p-6 lg:p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e2ca91]/12 text-[#f2d99a]">
                      <ClipboardList size={22} />
                    </div>
                    <div>
                      <span className="digital-section-kicker">48-hour action plan</span>
                      <h2 className="mt-2 font-display text-2xl font-bold text-white">{result.actionPlan.title}</h2>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="digital-day-card">
                      <p className="text-sm font-bold text-white">Day 1</p>
                      <ul className="mt-4 space-y-3">
                        {result.actionPlan.day1.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-white/70">
                            <Target size={15} className="mt-1 shrink-0 text-[#e2ca91]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="digital-day-card">
                      <p className="text-sm font-bold text-white">Day 2</p>
                      <ul className="mt-4 space-y-3">
                        {result.actionPlan.day2.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-white/70">
                            <Target size={15} className="mt-1 shrink-0 text-[#e2ca91]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="digital-panel no-print p-5 sm:p-6 lg:p-7">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <span className="digital-section-kicker">Export options</span>
                      <h2 className="mt-2 font-display text-2xl font-bold text-white">Rezultatų veiksmai</h2>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap">
                      <button type="button" onClick={handleCopyResults} className="digital-action-button">
                        <Copy size={16} />
                        Copy results
                      </button>
                      <button type="button" onClick={handlePrintPdf} className="digital-action-button">
                        <Download size={16} />
                        Download as PDF
                      </button>
                      <button type="button" onClick={() => handleSaveIdea(result.bestIdea)} className="digital-action-button">
                        <Save size={16} />
                        Save idea
                      </button>
                      <button type="button" onClick={() => handleGenerateAsset("instagram")} className="digital-action-button">
                        <Instagram size={16} />
                        Generate Instagram post text
                      </button>
                      <button type="button" onClick={() => handleGenerateAsset("landing")} className="digital-action-button">
                        <FileText size={16} />
                        Generate landing page copy
                      </button>
                    </div>
                  </div>

                  {assetOutput && (
                    <div className="mt-5 rounded-lg border border-white/10 bg-black/16 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-sm font-bold text-white">{assetOutput.title}</h3>
                        <button type="button" onClick={handleCopyAsset} className="digital-action-button w-full sm:w-auto">
                          <Copy size={16} />
                          Kopijuoti tekstą
                        </button>
                      </div>
                      <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-black/24 p-4 text-sm leading-7 text-white/72">
                        {assetOutput.content}
                      </pre>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </section>

        {result && (
          <section className="space-y-6">
            <div className="digital-panel no-print p-5 sm:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <span className="digital-section-kicker">Filters</span>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">Idėjų dashboardas</h2>
                </div>

                <div className="grid gap-3 lg:grid-cols-[220px_1fr] xl:min-w-[780px]">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/54">
                      <Filter size={14} />
                      Product type
                    </span>
                    <select
                      value={productTypeFilter}
                      onChange={(event) => setProductTypeFilter(event.target.value)}
                      className="digital-input h-11"
                    >
                      {productTypeFilterOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <span className="mb-2 block text-xs font-semibold uppercase text-white/54">Sorting</span>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = sortMode === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSortMode(option.id)}
                            className={`digital-filter-button ${isActive ? "digital-filter-button-active" : ""}`}
                            aria-pressed={isActive}
                          >
                            <Icon size={15} />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {["Visos", ...outputCategories].map((category) => {
                  const isActive = activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`digital-tab ${isActive ? "digital-tab-active" : ""}`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <ProductIdeaCard idea={result.bestIdea} isBest onSave={handleSaveIdea} />

              {groupedVisibleIdeas.length === 0 ? (
                <div className="digital-empty-state p-6">
                  <p className="text-sm leading-7 text-white/66">
                    Šiam filtrui idėjų nėra. Pakeisk produkto tipą arba rūšiavimo filtrą.
                  </p>
                </div>
              ) : (
                groupedVisibleIdeas.map((group) => (
                  <div key={group.category} className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="font-display text-xl font-bold text-white">{group.category}</h2>
                      <span className="rounded-lg border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-white/54">
                        {group.ideas.length}
                      </span>
                    </div>
                    <div className="grid gap-5">
                      {group.ideas.map((idea) => (
                        <ProductIdeaCard
                          key={idea.id}
                          idea={idea}
                          isBest={idea.id === result.bestIdea.id}
                          onSave={handleSaveIdea}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        <section className="digital-panel no-print p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="digital-section-kicker">Saved ideas</span>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">Išsaugotos idėjos</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/58">
              <ShieldCheck size={16} className="text-[#e2ca91]" />
              <span>Saugoma šiame įrenginyje</span>
            </div>
          </div>

          {savedIdeas.length === 0 ? (
            <div className="digital-empty-state mt-5 p-5">
              <p className="text-sm leading-7 text-white/62">
                Dar neturi išsaugotų idėjų. Sugeneravęs rezultatus paspausk „Save idea“ prie geriausio arba pasirinkto
                produkto.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {savedIdeas.map((idea) => (
                <article key={idea.id} className="digital-saved-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-[#e2ca91]">{idea.productType}</p>
                      <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-white">
                        {idea.productName}
                      </h3>
                    </div>
                    <ScoreBadge value={idea.score} compact />
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/62">{idea.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="text-xs text-white/44">{formatDate(idea.createdAt)}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedIdea(idea.id)}
                      className="digital-icon-button"
                      aria-label={`Pašalinti ${idea.productName}`}
                      title="Delete saved idea"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DigitalProductGeneratorPage;
