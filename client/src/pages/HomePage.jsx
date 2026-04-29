import {
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

const homeCopy = {
  lt: {
    chip: "Members-only pinigų aiškumas",
    title: "Stilloak paverčia mėnesio pinigų chaosą ramesne, aiškesne nario sistema.",
    intro:
      "Tai privati narystės erdvė tiems, kurie nori ne dar vienos išlaidų lentelės, o aiškaus vaizdo: kur spaudžia mėnuo, kiek dar telpa tikslui ir ką verta koreguoti toliau.",
    primaryCta: "Atrakinti Stilloak",
    secondaryCta: "Pamatyti kaip veikia",
    highlights: [
      "Biudžetai pagal kategoriją su realiu mėnesio spaudimu",
      "Recurring išlaidos, CSV importas ir taupymo tikslai vienoje vietoje",
      "AI savaitinės ir mėnesinės suvestinės, kurios pasako ką daryti toliau",
    ],
    stats: [
      { label: "Nario pagrindas", value: "Biudžetai", hint: "Ne tik suma, bet ir ribos, kurios duoda kryptį." },
      { label: "Svarbiausias rezultatas", value: "Aiškumas", hint: "Matai, kur realiai išteka pinigai." },
      { label: "Automatinis sluoksnis", value: "AI laiškai", hint: "Sistema pati grąžina prie svarbiausio vaizdo." },
    ],
    briefEyebrow: "Nario langas",
    briefTitle: "Vienas premium dashboardas vietoj penkių padrikų įrankių",
    briefText:
      "Stilloak sudeda į vieną ekraną biudžetų spaudimą, recurring naštą, taupymo tempą ir aiškų kitos savaitės veiksmų planą.",
    briefRows: [
      ["Maisto biudžetas", "Liko 84 €"],
      ["Recurring našta", "312 € / mėn."],
      ["Kelionės tikslas", "62% pasiekta"],
      ["Mėnesio komentaras", "Reikia pristabdyti smulkias išlaidas"],
    ],
    unlockEyebrow: "Ką atrakini",
    unlockTitle: "Circle ir Private atveria ne turinį, o kontrolę.",
    unlockText:
      "Po pirkimo atsiranda Stilloak darbo zona, AI laiškai, privatūs archyvai ir ramesnis santykis su visa nario patirtimi.",
    unlockList: [
      "Pilna dashboard prieiga",
      "Privatus sąskaitų ir suvestinių archyvas",
      "Members-only Journal ir premium plėtra",
    ],
    layersEyebrow: "Kas sudaro produktą",
    layersTitle: "Keturi sluoksniai, kurie sukuria tikrą mėnesio kontrolės jausmą",
    layersIntro:
      "Aukštos kokybės finansinis produktas neturi atrodyti techninis. Jis turi duoti aiškesnį ritmą ir parodyti, ką verta daryti dabar, ne kitą mėnesį.",
    layers: [
      {
        icon: WalletCards,
        title: "Biudžetų architektūra",
        description: "Limitai pagal kategoriją, aiškiai matomas likutis ir signalai, kai mėnuo pradeda spausti per stipriai.",
      },
      {
        icon: Target,
        title: "Tikslai su tempu",
        description: "Tikslų progresas rodo ne tik kiek liko, bet ir ar dabartinis mėnesio tempas tikrai nuves iki rezultato.",
      },
      {
        icon: Mail,
        title: "AI nario laiškai",
        description: "Savaitinės ir mėnesinės suvestinės parašo tai, ką verta suprasti iš skaičių: riziką, progresą ir kitą žingsnį.",
      },
    ],
    positioningEyebrow: "Prabangesnis pateikimas",
    positioningTitle: "Stilloak nėra paprastas trackeris. Tai nario lygio pinigų apžvalga.",
    positioningIntro:
      "Dėl to visa vieša patirtis turi vesti į vieną pažadą: ramesnę kontrolę, aiškesnį mėnesio vaizdą ir sistemą, prie kurios verta grįžti.",
    membershipCards: [
      {
        label: "Guest",
        title: "Pamatai pasaulį prieš pirkimą",
        description: "Gali susipažinti su naratyvu, pricing logika ir tuo, ką atrakina tikra narystė.",
      },
      {
        label: "Circle",
        title: "Pilna Stilloak prieiga",
        description: "Pats svarbiausias planas žmogui, kuris nori naudoti programą kas savaitę ir gauti visas AI suvestines.",
      },
      {
        label: "Private",
        title: "Dar aukštesnis santykio sluoksnis",
        description: "Tiems, kurie nori daugiau premium palaikymo, stipresnio nario jausmo ir gilesnės patirties.",
      },
    ],
    membershipPrimary: "Peržiūrėti planus",
    membershipSecondary: "Skaityti Story",
  },
  en: {
    chip: "Members-only money clarity",
    title: "Stilloak turns monthly money chaos into a calmer, clearer member system.",
    intro:
      "It is a private membership space for people who do not need another expense sheet. They need a clear view: where the month is under pressure, what still fits the goal, and what to adjust next.",
    primaryCta: "Unlock Stilloak",
    secondaryCta: "See how it works",
    highlights: [
      "Category budgets with real monthly pressure",
      "Recurring spend, CSV import, and savings goals in one place",
      "AI weekly and monthly summaries that explain what to do next",
    ],
    stats: [
      { label: "Member foundation", value: "Budgets", hint: "Not just totals, but limits that create direction." },
      { label: "Main result", value: "Clarity", hint: "See where money is really leaking." },
      { label: "Automatic layer", value: "AI emails", hint: "The system brings you back to the signal on its own." },
    ],
    briefEyebrow: "Member view",
    briefTitle: "One premium dashboard instead of five scattered tools",
    briefText:
      "Stilloak places budget pressure, recurring load, goal pace, and your next best move into one focused screen.",
    briefRows: [
      ["Food budget", "84 € remaining"],
      ["Recurring load", "312 € / month"],
      ["Travel goal", "62% reached"],
      ["Monthly commentary", "Time to reduce small spending"],
    ],
    unlockEyebrow: "What you unlock",
    unlockTitle: "Circle and Private open control, not just content.",
    unlockText:
      "After purchase, Stilloak becomes a working member space with AI emails, private archives, and a calmer relationship with the whole experience.",
    unlockList: [
      "Full dashboard access",
      "Private archive of invoices and summaries",
      "Members-only Journal and premium expansion",
    ],
    layersEyebrow: "What makes the product",
    layersTitle: "Four layers that create real control over the month",
    layersIntro:
      "A high-quality finance product should not feel technical. It should create a clearer rhythm and show you what is worth doing now, not next month.",
    layers: [
      {
        icon: WalletCards,
        title: "Budget architecture",
        description: "Category limits, visible remaining balance, and clear signals when the month starts pressing too hard.",
      },
      {
        icon: Target,
        title: "Goals with pace",
        description: "Goal progress shows not only what remains, but whether your current monthly pace will really get you there.",
      },
      {
        icon: Mail,
        title: "AI member emails",
        description: "Weekly and monthly summaries explain the numbers: risk, progress, and the next best step.",
      },
    ],
    positioningEyebrow: "Premium framing",
    positioningTitle: "Stilloak is not a simple tracker. It is a member-level financial overview.",
    positioningIntro:
      "That is why the whole public experience should guide people into one promise: calmer control, a clearer monthly view, and a system worth returning to.",
    membershipCards: [
      {
        label: "Guest",
        title: "See the world before buying",
        description: "You can understand the narrative, the pricing logic, and what real membership unlocks.",
      },
      {
        label: "Circle",
        title: "Full Stilloak access",
        description: "The most important plan for people who want to use the program weekly and receive the complete AI summary layer.",
      },
      {
        label: "Private",
        title: "A higher-touch member layer",
        description: "For people who want more support, a stronger premium feel, and a deeper relationship with the product.",
      },
    ],
    membershipPrimary: "View membership",
    membershipSecondary: "Read the story",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  homeCopy[languageCode] = homeCopy.en;
});

const HomePage = () => {
  const { language } = useLanguage();
  const copy = homeCopy[language] || homeCopy.lt;

  return (
    <div className="space-y-10 pb-8">
      <section className="marketing-dark overflow-hidden rounded-[40px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:gap-10">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">{copy.chip}</span>
              <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold leading-[0.9] sm:text-6xl lg:text-[5.2rem]">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{copy.intro}</p>

              <div className="mt-7 space-y-3">
                {copy.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-white/76">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/pricing" className="button-primary gap-2">
                  {copy.primaryCta}
                  <ArrowRight size={16} />
                </Link>
                <Link to="/savings-studio" className="hero-outline-button">
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {copy.stats.map((item) => (
                <div key={item.label} className="metric-card">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">{item.label}</p>
                  <p className="mt-3 font-display text-3xl font-bold">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="editorial-dark-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{copy.briefEyebrow}</p>
                  <h2 className="mt-3 font-display text-4xl font-bold">{copy.briefTitle}</h2>
                </div>
                <span className="hero-chip">Circle access</span>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/66">{copy.briefText}</p>

              <div className="mt-6 grid gap-3">
                {copy.briefRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/4 px-4 py-3 text-sm"
                  >
                    <span className="text-white/54">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
              <div className="editorial-dark-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{copy.unlockEyebrow}</p>
                <h3 className="mt-4 font-display text-3xl font-bold">{copy.unlockTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-white/66">{copy.unlockText}</p>
              </div>

              <div className="editorial-panel bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(249,243,235,0.9))]">
                <div className="flex items-center gap-2 text-[rgb(var(--accent-strong))]">
                  <Sparkles size={16} />
                  <span className="text-xs font-semibold uppercase tracking-[0.28em]">{copy.unlockEyebrow}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {copy.unlockList.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[18px] bg-[rgb(255,250,244)] px-4 py-3 text-sm text-[rgb(98,87,74)]">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="max-w-3xl">
          <span className="eyebrow">{copy.layersEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.layersTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.layersIntro}</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {copy.layers.map((item) => (
            <div key={item.title} className="marketing-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgb(var(--accent)/0.12)]">
                <item.icon size={22} style={{ color: "rgb(var(--accent-strong))" }} />
              </div>
              <h3 className="mt-6 font-display text-3xl font-bold">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="public-section">
          <span className="eyebrow">{copy.positioningEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.positioningTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.positioningIntro}</p>

          <div className="mt-8 space-y-4">
            {copy.membershipCards.map((item) => (
              <div key={item.label} className="soft-card rounded-[26px] px-5 py-5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.label}</p>
                <h3 className="mt-3 font-display text-3xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="public-section flex flex-col justify-between">
          <div>
            <span className="eyebrow">{copy.unlockEyebrow}</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.unlockTitle}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{copy.unlockText}</p>
          </div>

          <div className="mt-8 grid gap-4">
            {copy.unlockList.map((item) => (
              <div key={item} className="marketing-card flex items-start gap-3 p-5">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                <span className="text-sm leading-6 text-muted">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/pricing" className="button-primary">
              {copy.membershipPrimary}
            </Link>
            <Link to="/story" className="button-secondary">
              {copy.membershipSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
