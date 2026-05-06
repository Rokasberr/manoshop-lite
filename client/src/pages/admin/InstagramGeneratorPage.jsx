import {
  Clipboard,
  Clock3,
  Download,
  FileImage,
  Image,
  Instagram,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import AdminPageHeader from "../../components/admin-dashboard/AdminPageHeader";
import instagramPostService from "../../services/instagramPostService";

const postTypeOptions = [
  { value: "brand-intro", label: "Brand intro" },
  { value: "bazinis-planas", label: "Bazinis planas" },
  { value: "asmeninis-planas", label: "Asmeninis planas" },
  { value: "privatus-verslas", label: "Privatus verslas" },
  { value: "plan-comparison", label: "Plan comparison" },
  { value: "faq", label: "FAQ" },
  { value: "cta-join-now", label: "CTA / Join now" },
];

const formatOptions = [
  { value: "square", label: "Square", size: "1080x1080", ratio: "1 / 1" },
  { value: "portrait", label: "Portrait", size: "1080x1350", ratio: "4 / 5" },
  { value: "story", label: "Story/Reel", size: "1080x1920", ratio: "9 / 16" },
];

const outputTypeOptions = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
];

const initialForm = {
  postType: "brand-intro",
  format: "square",
  headline: "Pasirink nario erdvę pagal savo etapą.",
  subtitle:
    "Sukurta tiems, kurie nori tvarkingos, premium ir lengvai suprantamos skaitmeninės patirties.",
  badge: "PRIVATI NARIO ERDVĖ",
  features: ["Bazinis", "Asmeninis", "Privatus verslas"].join("\n"),
  price: "",
  website: "stilloak-studio.com",
  ctaText: "Paprasta pradėti. Aišku naudoti. Sukurta augimui.",
  outputType: "jpg",
};

const presets = [
  {
    label: "Brand intro",
    icon: Sparkles,
    values: {
      ...initialForm,
      postType: "brand-intro",
      format: "square",
    },
  },
  {
    label: "Bazinis",
    icon: FileImage,
    values: {
      ...initialForm,
      postType: "bazinis-planas",
      headline: "Pradėk paprastai su Baziniu planu.",
      subtitle:
        "Skirta tiems, kurie nori aiškios pradžios, paprasto naudojimo ir tvarkingos nario erdvės.",
      badge: "BAZINIS PLANAS",
      features: ["Pagrindinės funkcijos", "Aiški pradžia", "Lengvas naudojimas", "5.99 €/mėn."].join("\n"),
      ctaText: "Prisijungti dabar",
    },
  },
  {
    label: "Asmeninis",
    icon: FileImage,
    values: {
      ...initialForm,
      postType: "asmeninis-planas",
      headline: "Daugiau galimybių su Asmeniniu planu.",
      subtitle: "Skirta aktyviam naudojimui, daugiau lankstumo ir patogesnei nario patirčiai.",
      badge: "ASMENINIS PLANAS",
      features: ["Daugiau funkcijų", "Aktyviam naudojimui", "Patogesnė patirtis", "15.99 €/mėn."].join("\n"),
      ctaText: "Populiariausias pasirinkimas",
    },
  },
  {
    label: "Privatus verslas",
    icon: FileImage,
    values: {
      ...initialForm,
      postType: "privatus-verslas",
      headline: "Premium sprendimas verslo augimui.",
      subtitle: "Skirta rimtesniems poreikiams, daugiau kontrolės ir profesionaliam naudojimui.",
      badge: "PRIVATUS VERSLAS",
      features: [
        "Verslo lygio funkcijos",
        "Daugiau kontrolės",
        "Prioritetinis aptarnavimas",
        "44.99 €/mėn.",
      ].join("\n"),
      ctaText: "Atrakinti verslo erdvę",
    },
  },
  {
    label: "Plan comparison",
    icon: Image,
    values: {
      ...initialForm,
      postType: "plan-comparison",
      headline: "Palygink planus pagal savo etapą.",
      subtitle: "Aiškus kelias nuo paprastos pradžios iki premium verslo naudojimo.",
      badge: "PLANŲ PALYGINIMAS",
      features: ["Bazinis - 5.99 €/mėn.", "Asmeninis - 15.99 €/mėn.", "Privatus verslas - 44.99 €/mėn."].join("\n"),
      ctaText: "Pasirink savo planą",
    },
  },
  {
    label: "Story version",
    icon: Instagram,
    values: {
      ...initialForm,
      postType: "brand-intro",
      format: "story",
      outputType: "jpg",
    },
  },
];

const characterCount = (value) => String(value || "").length;

const formatBytes = (bytes) => {
  if (!bytes) {
    return "0 KB";
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("lt-LT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const InstagramGeneratorPage = () => {
  const [form, setForm] = useState(initialForm);
  const [generated, setGenerated] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const selectedFormat = useMemo(
    () => formatOptions.find((format) => format.value === form.format) || formatOptions[0],
    [form.format]
  );
  const generatedFormat = generated
    ? formatOptions.find((format) => format.value === generated.format) || selectedFormat
    : selectedFormat;

  const loadRecentPosts = async () => {
    try {
      setLoadingRecent(true);
      const posts = await instagramPostService.listRecent();
      setRecentPosts(posts);
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko užkrauti sugeneruotų įrašų.");
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    loadRecentPosts();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    const loadPreview = async () => {
      if (!generated?.previewFilename) {
        setPreviewUrl("");
        return;
      }

      try {
        setPreviewLoading(true);
        objectUrl = await instagramPostService.createPreviewUrl(generated.previewFilename);

        if (cancelled) {
          window.URL.revokeObjectURL(objectUrl);
          return;
        }

        setPreviewUrl(objectUrl);
      } catch (error) {
        toast.error(error.response?.data?.message || "Nepavyko užkrauti peržiūros.");
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;

      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [generated?.previewFilename]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const applyPreset = (preset) => {
    setForm((current) => ({
      ...current,
      ...preset.values,
      outputType: current.outputType,
    }));
    setGenerated(null);
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    try {
      setGenerating(true);
      const result = await instagramPostService.generatePost({
        ...form,
        features: form.features
          .split(/\r?\n/)
          .map((feature) => feature.trim())
          .filter(Boolean),
      });

      setGenerated(result);
      toast.success("Instagram įrašas sugeneruotas.");
      await loadRecentPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko sugeneruoti Instagram įrašo.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      await instagramPostService.downloadPost(filename);
    } catch (error) {
      toast.error(error.response?.data?.message || "Nepavyko atsisiųsti failo.");
    }
  };

  const handleCopyCaption = async () => {
    if (!generated?.caption) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generated.caption);
      toast.success("Caption nukopijuotas.");
    } catch (_error) {
      toast.error("Nepavyko nukopijuoti caption.");
    }
  };

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow="Instagram generatorius"
        title="Branded Instagram post generator"
        description="Admin įrankis Stilloak Studio vizualams su server-side JPG ir PNG generavimu."
      />

      <section className="overflow-hidden rounded-[28px] border border-[#b9823a]/35 bg-[#061f18] text-white shadow-[0_28px_80px_rgba(6,31,24,0.22)]">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(185,130,58,0.24),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            {presets.map((preset) => {
              const Icon = preset.icon;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#b9823a]/35 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-[#fff8ee] transition hover:-translate-y-0.5 hover:border-[#b9823a]/70 hover:bg-[#b9823a]/[0.15]"
                >
                  <Icon size={16} />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.02fr_0.98fr]">
          <form onSubmit={handleGenerate} className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-[#d8e1dc]">Post type</span>
                <select
                  value={form.postType}
                  onChange={(event) => updateField("postType", event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b2a20] px-4 text-sm font-semibold text-white"
                >
                  {postTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-[#d8e1dc]">Website text</span>
                <input
                  value={form.website}
                  onChange={(event) => updateField("website", event.target.value)}
                  maxLength={80}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b2a20] px-4 text-sm font-semibold text-white placeholder:text-white/35"
                  placeholder="stilloak-studio.com"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase text-[#d8e1dc]">Format</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("format", option.value)}
                    className={`rounded-[20px] border px-4 py-3 text-left transition ${
                      form.format === option.value
                        ? "border-[#b9823a] bg-[#b9823a]/[0.18] text-white"
                        : "border-white/10 bg-white/[0.045] text-[#d8e1dc] hover:border-[#b9823a]/50"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs text-[#d8e1dc]/80">{option.size}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-[#d8e1dc]">Badge label</span>
                <input
                  value={form.badge}
                  onChange={(event) => updateField("badge", event.target.value)}
                  maxLength={48}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b2a20] px-4 text-sm font-semibold text-white placeholder:text-white/35"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-[#d8e1dc]">
                  Headline <span className="font-medium text-[#d8e1dc]/60">{characterCount(form.headline)}/120</span>
                </span>
                <input
                  value={form.headline}
                  onChange={(event) => updateField("headline", event.target.value)}
                  maxLength={120}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b2a20] px-4 text-sm font-semibold text-white placeholder:text-white/35"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase text-[#d8e1dc]">
                Subtitle / supporting text <span className="font-medium text-[#d8e1dc]/60">{characterCount(form.subtitle)}/260</span>
              </span>
              <textarea
                value={form.subtitle}
                onChange={(event) => updateField("subtitle", event.target.value)}
                maxLength={260}
                rows={4}
                className="min-h-[112px] w-full resize-y rounded-[22px] border border-white/10 bg-[#0b2a20] px-4 py-3 text-sm font-medium leading-6 text-white placeholder:text-white/35"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-[#d8e1dc]">Feature list, 3–5 rows</span>
                <textarea
                  value={form.features}
                  onChange={(event) => updateField("features", event.target.value)}
                  rows={5}
                  className="min-h-[154px] w-full resize-y rounded-[22px] border border-white/10 bg-[#0b2a20] px-4 py-3 text-sm font-medium leading-7 text-white placeholder:text-white/35"
                />
              </label>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase text-[#d8e1dc]">Price field</span>
                  <input
                    value={form.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    maxLength={40}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b2a20] px-4 text-sm font-semibold text-white placeholder:text-white/35"
                    placeholder="Optional"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase text-[#d8e1dc]">CTA text</span>
                  <input
                    value={form.ctaText}
                    onChange={(event) => updateField("ctaText", event.target.value)}
                    maxLength={80}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b2a20] px-4 text-sm font-semibold text-white placeholder:text-white/35"
                    placeholder="Optional"
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-[#d8e1dc]">Output file type</span>
                  <div className="grid grid-cols-2 gap-2">
                    {outputTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField("outputType", option.value)}
                    className={`h-12 rounded-2xl border text-sm font-semibold transition ${
                          form.outputType === option.value
                            ? "border-[#b9823a] bg-[#b9823a]/20 text-white"
                            : "border-white/10 bg-white/[0.045] text-[#d8e1dc] hover:border-[#b9823a]/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b9823a] px-5 py-4 text-sm font-bold text-white shadow-[0_18px_40px_rgba(185,130,58,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              <span>{generating ? "Generuojama..." : "Generate Instagram post"}</span>
            </button>
          </form>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#b9823a]">Preview</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{generated ? generated.formatLabel : selectedFormat.size}</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase text-[#d8e1dc]">
                  {generated ? `${generated.width}x${generated.height}` : selectedFormat.size}
                </span>
              </div>

              <div className="mt-5 flex justify-center rounded-[24px] border border-[#b9823a]/25 bg-black/[0.18] p-4">
                <div
                  className="grid w-full max-w-[420px] place-items-center overflow-hidden rounded-[22px] border border-white/10 bg-[#0b2a20]"
                  style={{ aspectRatio: generatedFormat.ratio }}
                >
                  {previewLoading ? (
                    <Loader2 size={34} className="animate-spin text-[#b9823a]" />
                  ) : previewUrl ? (
                    <img src={previewUrl} alt="Sugeneruotas Stilloak Instagram įrašas" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center text-[#d8e1dc]">
                      <Instagram size={42} className="text-[#b9823a]" />
                      <span className="text-sm font-semibold">Stilloak Studio</span>
                    </div>
                  )}
                </div>
              </div>

              {generated ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {generated.files?.jpg ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(generated.files.jpg)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#b9823a]/[0.45] bg-[#b9823a]/[0.18] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                    >
                      <Download size={16} />
                      <span>Download JPG</span>
                    </button>
                  ) : null}
                  {generated.files?.png ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(generated.files.png)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                    >
                      <Download size={16} />
                      <span>Download PNG</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  >
                    <Clipboard size={16} />
                    <span>Copy caption</span>
                  </button>
                </div>
              ) : null}
            </div>

            {generated?.caption ? (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[#b9823a]">Caption</p>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white"
                    aria-label="Copy caption"
                  >
                    <Clipboard size={15} />
                  </button>
                </div>
                <textarea
                  value={generated.caption}
                  readOnly
                  rows={8}
                  className="mt-4 w-full resize-y rounded-[22px] border border-white/10 bg-[#0b2a20] px-4 py-3 text-sm leading-6 text-[#d8e1dc]"
                />
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="dashboard-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="dashboard-eyebrow">Recent generated posts</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Sugeneruoti failai</h2>
          </div>
          <button type="button" onClick={loadRecentPosts} className="dashboard-button-secondary">
            <RefreshCw size={16} />
            <span>Atnaujinti</span>
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {loadingRecent ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              <span>Kraunama...</span>
            </div>
          ) : recentPosts.length ? (
            recentPosts.map((post) => (
              <div
                key={post.filename}
                className="flex flex-col gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">{post.filename}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} />
                      {formatDate(post.createdAt)}
                    </span>
                    <span>{post.fileType.toUpperCase()}</span>
                    <span>{formatBytes(post.size)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => handleDownload(post.filename)} className="dashboard-button-secondary justify-center">
                  <Download size={16} />
                  <span>Atsisiųsti</span>
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-medium text-slate-500">
              Sugeneruotų Instagram failų dar nėra.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InstagramGeneratorPage;
