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
    chip: "Privati finansų studija",
    title: "Aiškesnis mėnuo. Ramesni sprendimai. Viena Stilloak erdvė.",
    intro:
      "Premium narystė žmonėms, kurie nori matyti išlaidas, tikslus ir kitą žingsnį be lentelių chaoso.",
    primaryCta: "Atrakinti narystę",
    secondaryCta: "Peržiūrėti programą",
    highlights: [
      "Aiškūs biudžetai pagal kategoriją",
      "Tikslai, pastovios išlaidos ir CSV importas vienoje vietoje",
      "Trumpi savaitės ir mėnesio signalai be triukšmo",
    ],
    stats: [
      { label: "Pagrindas", value: "Biudžetai", hint: "Limitai, likutis ir mėnesio spaudimas viename vaizde." },
      { label: "Nauda", value: "Aiškumas", hint: "Matai, kur pinigai slysta ir ką verta koreguoti." },
      { label: "Ritmas", value: "Suvestinės", hint: "Trumpi signalai padeda grįžti prie svarbiausio." },
    ],
    previewEyebrow: "Viduje",
    previewTitle: "Vienas ramus ekranas vietoj penkių padrikų įrankių",
    previewText:
      "Savings Studio sujungia mėnesio spaudimą, pastovias išlaidas, taupymo progresą ir aiškų kitą veiksmą iškart po prisijungimo.",
    previewRows: [
      ["Šio mėnesio spaudimas", "Maisto kategorija artėja prie limito"],
      ["Pastovios išlaidos", "312 € / mėn."],
      ["Kelionės tikslas", "62% pasiekta"],
      ["Kitas žingsnis", "Pristabdyti smulkias išlaidas šią savaitę"],
    ],
    promiseEyebrow: "Pažadas",
    promiseTitle: "Mažiau spėlionių. Daugiau kontrolės.",
    promiseText:
      "Stilloak veda tiesiai į tai, ko reikia: aiškią peržiūrą, paprastą narystę ir privačią erdvę tavo mėnesiui.",
    unlockEyebrow: "Įtraukta",
    unlockList: [
      "Pilna Savings Studio darbo erdvė",
      "Privatus sąskaitų, laiškų ir suvestinių archyvas",
      "Tvarkinga nario patirtis nuo prisijungimo iki mėnesio apžvalgos",
    ],
    layersEyebrow: "Sluoksniai",
    layersTitle: "Viskas, ko reikia aiškesniam savaitės ritmui",
    layersIntro:
      "Stilloak nesistengia daryti visko. Jis sutelkia mėnesio biudžetą, tikslus ir suvestines į vieną lengvai grįžtamą vietą.",
    layers: [
      {
        icon: WalletCards,
        title: "Biudžetai su signalu",
        description: "Kategorijų limitai parodo ne tik išlaidas, bet ir vietas, kur mėnuo pradeda spausti.",
      },
      {
        icon: Target,
        title: "Tikslai su tempu",
        description: "Progresas rodo, ar dabartinis ritmas realiai veda iki tikslo.",
      },
      {
        icon: Mail,
        title: "Suvestinės be triukšmo",
        description: "Savaitės ir mėnesio laiškai trumpai paaiškina riziką, progresą ir kitą veiksmą.",
      },
      {
        icon: ShieldCheck,
        title: "Privati nario erdvė",
        description: "Paskyra, archyvas ir narystė laikomi vienoje saugioje, tvarkingoje vietoje.",
      },
    ],
    workflowEyebrow: "Kaip veikia",
    workflowTitle: "Nuo pirmų įrašų iki aiškaus kito žingsnio",
    workflowIntro:
      "Įkeli arba suvedi duomenis, pamatai kur kaupiasi spaudimas ir grįžti prie vieno veiksmo, kuris dabar svarbiausias.",
    workflowSteps: [
      {
        step: "01",
        title: "Įsivedi mėnesį",
        description: "Pridėk išlaidas ranka, naudok pastovius mokėjimus arba importuok CSV, kai nori pradėti greičiau.",
      },
      {
        step: "02",
        title: "Stilloak sutraukia vaizdą",
        description: "Biudžetai, tikslai, pastovios išlaidos ir pagrindinė rizika atsiranda viename ekrane.",
      },
      {
        step: "03",
        title: "Matai kitą veiksmą",
        description: "Sistema parodo, ką verta pristabdyti, ką palikti ir kaip išlaikyti ritmą iki mėnesio pabaigos.",
      },
    ],
    plansEyebrow: "Narystė",
    plansTitle: "Pasirink paprastai: peržiūra, Circle arba Private",
    plansIntro:
      "Kiekvienas lygis turi aiškią paskirtį: susipažinti, naudoti kas savaitę arba gauti daugiau prioritetinės priežiūros.",
    membershipCards: [
      {
        label: "Guest",
        title: "Pamatai patirtį prieš sprendimą",
        description: "Trumpa peržiūra padeda suprasti Stilloak logiką, vertę ir narystės skirtumus.",
      },
      {
        label: "Circle",
        title: "Pilna Savings Studio prieiga",
        description: "Pagrindinis planas kas savaitę naudoti biudžetus, tikslus ir suvestines vienoje vietoje.",
      },
      {
        label: "Private",
        title: "Daugiau prioriteto",
        description: "Aukštesnis lygis nariams, kuriems svarbu daugiau priežiūros ir ramesnis aptarnavimas.",
      },
    ],
    membershipPrimary: "Pasirinkti planą",
    membershipSecondary: "Peržiūrėti programą",
    closingEyebrow: "Pradėk šiandien",
    closingTitle: "Peržiūrėk programą arba atrakink Stilloak iškart.",
    closingText:
      "Aiškus mėnuo prasideda nuo vieno sprendimo: pamatyti kaip tai veikia arba iškart pradėti su Circle.",
    closingPrimary: "Atrakinti narystę",
    closingSecondary: "Peržiūrėti Savings Studio",
  },
  en: {
    chip: "Private finance studio",
    title: "A clearer month. Calmer decisions. One Stilloak space.",
    intro:
      "A premium membership for people who want spending, goals, and the next step without spreadsheet noise.",
    primaryCta: "Unlock membership",
    secondaryCta: "View demo",
    highlights: [
      "Clear category budgets",
      "Goals, recurring spend, and CSV import in one place",
      "Short weekly and monthly signals without noise",
    ],
    stats: [
      { label: "Foundation", value: "Budgets", hint: "Limits, balance, and monthly pressure in one view." },
      { label: "Result", value: "Clarity", hint: "See where money slips and what is worth adjusting." },
      { label: "Rhythm", value: "Summaries", hint: "Short signals bring you back to what matters." },
    ],
    previewEyebrow: "Inside",
    previewTitle: "One calm screen instead of five scattered tools",
    previewText:
      "Savings Studio brings monthly pressure, recurring spend, savings progress, and the next best move into one place as soon as a member signs in.",
    previewRows: [
      ["Monthly pressure", "Food category is moving close to its limit"],
      ["Recurring load", "312 € / month"],
      ["Travel goal", "62% reached"],
      ["Next move", "Reduce small spending this week"],
    ],
    promiseEyebrow: "Promise",
    promiseTitle: "Less guessing. More control.",
    promiseText:
      "Stilloak points directly to what matters: a clear demo, simple membership, and a private space for your month.",
    unlockEyebrow: "Included",
    unlockList: [
      "The full Savings Studio workspace",
      "A private archive for invoices, emails, and summaries",
      "A tidy member experience from login to monthly review",
    ],
    layersEyebrow: "Layers",
    layersTitle: "Everything needed for a clearer weekly rhythm",
    layersIntro:
      "Stilloak is not trying to do everything. It brings budgets, goals, and summaries into one place that is easy to return to.",
    layers: [
      {
        icon: WalletCards,
        title: "Budgets with signals",
        description: "Category limits show what has been spent and where the month starts pressing.",
      },
      {
        icon: Target,
        title: "Goals with pace",
        description: "Progress shows whether the current rhythm is actually moving toward the target.",
      },
      {
        icon: Mail,
        title: "Summaries without noise",
        description: "Weekly and monthly emails explain risk, progress, and the next best action.",
      },
      {
        icon: ShieldCheck,
        title: "Private member space",
        description: "Account, archive, and membership details stay in one secure, considered space.",
      },
    ],
    workflowEyebrow: "How it works",
    workflowTitle: "From first entries to the next clear move",
    workflowIntro:
      "Add or import the data, see where pressure builds, then return to the one action that matters most.",
    workflowSteps: [
      {
        step: "01",
        title: "Bring the month in",
        description: "Add expenses manually, track recurring items, or import a CSV when you want a faster start.",
      },
      {
        step: "02",
        title: "Stilloak condenses the picture",
        description: "Budgets, goals, recurring spend, and the biggest risk appear together in one place.",
      },
      {
        step: "03",
        title: "The next move becomes clear",
        description: "The system shows what to slow down, what to keep, and how to hold the rhythm until month end.",
      },
    ],
    plansEyebrow: "Membership",
    plansTitle: "Choose simply: preview, Circle, or Private",
    plansIntro:
      "Each level has a clear role: explore, use weekly, or receive a higher-touch member experience.",
    membershipCards: [
      {
        label: "Guest",
        title: "Preview before deciding",
        description: "A short preview helps you understand the logic, value, and membership difference.",
      },
      {
        label: "Circle",
        title: "Full Savings Studio access",
        description: "The core plan for using budgets, goals, and summaries every week in one place.",
      },
      {
        label: "Private",
        title: "More priority",
        description: "A higher tier for members who want more care, more calm, and priority handling.",
      },
    ],
    membershipPrimary: "Choose a plan",
    membershipSecondary: "View demo",
    closingEyebrow: "Start today",
    closingTitle: "View the demo or unlock Stilloak now.",
    closingText:
      "A clearer month starts with one choice: see how it works or begin with Circle.",
    closingPrimary: "Unlock membership",
    closingSecondary: "View Savings Studio",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  homeCopy[languageCode] = homeCopy.en;
});

const HomePage = () => {
  const { language } = useLanguage();
  const copy = homeCopy[language] || homeCopy.lt;

  return (
    <div className="space-y-12 pb-6">
      <section className="marketing-dark overflow-hidden px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="grid gap-10 xl:grid-cols-[0.98fr_1.02fr] xl:items-stretch xl:gap-12">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">{copy.chip}</span>
              <h1 className="mt-7 max-w-4xl font-display text-4xl font-bold leading-[1.02] sm:text-6xl lg:text-[4.7rem]">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{copy.intro}</p>

              <div className="mt-7 grid gap-3">
                {copy.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/76">
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
                  <p
                    className={`mt-3 font-display font-bold leading-tight ${
                      item.value === "Suvestinės" ? "text-[1.55rem] sm:text-[1.65rem]" : "text-3xl"
                    }`}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="editorial-dark-card h-full">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{copy.previewEyebrow}</p>
                  <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{copy.previewTitle}</h2>
                </div>
                <span className="hero-chip">Įtraukta į Circle</span>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/66">{copy.previewText}</p>

              <div className="mt-6 rounded-lg border border-white/10 bg-white/95 p-3 sm:p-4">
                <img
                  src="/story/members-dashboard-preview.svg"
                  alt="Stilloak member dashboard preview"
                  className="mx-auto block h-auto w-full rounded-md object-contain"
                />
              </div>

              <div className="mt-6 grid gap-3">
                {copy.previewRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-2 rounded-lg border border-white/8 bg-white/4 px-4 py-3 text-sm sm:grid-cols-[0.92fr_1.08fr] sm:items-center"
                  >
                    <span className="text-white/54">{label}</span>
                    <span className="font-semibold text-white sm:text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[0.94fr_1.06fr]">
              <div className="editorial-dark-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{copy.promiseEyebrow}</p>
                <h3 className="mt-4 font-display text-3xl font-bold">{copy.promiseTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-white/66">{copy.promiseText}</p>
              </div>

              <div className="editorial-panel bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(249,243,235,0.9))]">
                <div className="flex items-center gap-2 text-[rgb(var(--accent-strong))]">
                  <Sparkles size={16} />
                  <span className="text-xs font-semibold uppercase tracking-[0.28em]">{copy.unlockEyebrow}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {copy.unlockList.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg bg-white px-4 py-3 text-sm text-[rgb(var(--muted))]">
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.layers.map((item) => (
            <div key={item.title} className="marketing-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.12)]">
                <item.icon size={22} style={{ color: "rgb(var(--accent-strong))" }} />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="public-section">
          <span className="eyebrow">{copy.workflowEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.workflowTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.workflowIntro}</p>

          <div className="mt-8 grid gap-4">
            {copy.workflowSteps.map((item) => (
              <div key={item.step} className="soft-card rounded-lg px-5 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.12)] text-sm font-semibold text-[rgb(var(--accent-strong))]">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="public-section flex flex-col justify-between">
          <div>
            <span className="eyebrow">{copy.plansEyebrow}</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.plansTitle}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{copy.plansIntro}</p>
          </div>

          <div className="mt-8 space-y-4">
            {copy.membershipCards.map((item) => (
              <div key={item.label} className="soft-card rounded-lg px-5 py-5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.label}</p>
                <h3 className="mt-3 font-display text-3xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/pricing" className="button-primary">
              {copy.membershipPrimary}
            </Link>
            <Link to="/savings-studio" className="button-secondary">
              {copy.membershipSecondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="public-section text-center">
        <span className="eyebrow">{copy.closingEyebrow}</span>
        <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.closingTitle}</h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted">{copy.closingText}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/pricing" className="button-primary gap-2">
            {copy.closingPrimary}
            <ArrowRight size={16} />
          </Link>
          <Link to="/savings-studio" className="button-secondary">
            {copy.closingSecondary}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
