import {
  CheckCircle2,
  ArrowRight,
  BadgeEuro,
  ChartNoAxesColumn,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  Target,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { hasActiveMembership } from "../utils/membership";
import {
  dateFormatter,
  formatChange,
  money,
} from "../components/savings/savingsStudioHelpers";

const demoSummary = {
  monthTotal: 1286.42,
  change: -12.5,
  averageSpend: 32.16,
  topCategory: "Maistas",
  recentCount: 40,
  categoryTotals: [
    { category: "Maistas", total: 342.28 },
    { category: "Transportas", total: 188.5 },
    { category: "Pramogos", total: 154.9 },
    { category: "Apsipirkimas", total: 136.35 },
  ],
  monthlyTotals: [
    { key: "2025-11", label: "lapkr. 2025", total: 1424.2 },
    { key: "2025-12", label: "gruod. 2025", total: 1561.9 },
    { key: "2026-01", label: "saus. 2026", total: 1498.3 },
    { key: "2026-02", label: "vas. 2026", total: 1378.15 },
    { key: "2026-03", label: "kov. 2026", total: 1469.8 },
    { key: "2026-04", label: "bal. 2026", total: 1286.42 },
  ],
};

const demoEntries = [
  {
    id: "demo-1",
    title: "Savaitės maisto pirkimas",
    amount: 84.6,
    category: "Maistas",
    date: "2026-04-24",
    notes: "Didžiausias šuolis atsirado dėl spontaniškų pirkinių.",
  },
  {
    id: "demo-2",
    title: "Kava ir pietūs mieste",
    amount: 23.4,
    category: "Pramogos",
    date: "2026-04-22",
    notes: "Maži kasdieniai pirkiniai susideda greičiau nei atrodo.",
  },
  {
    id: "demo-3",
    title: "Kuro papildymas",
    amount: 61.2,
    category: "Transportas",
    date: "2026-04-20",
    notes: "Padeda matyti, kiek realiai kainuoja judėjimas per mėnesį.",
  },
];

const demoCopy = {
  lt: {
    chip: "Nario programa",
    title: "Stilloak parodo, kur pinigai slysta ir ką verta keisti pirmiausia.",
    intro:
      "Stilloak yra privati nario erdvė išlaidoms, biudžetams, tikslams ir mėnesio signalams. Ji padeda priimti mažiau sprendimų iš nuojautos ir daugiau iš aiškaus vaizdo.",
    primary: "Atrakinti Circle",
    primaryOpen: "Atidaryti Stilloak",
    secondary: "Peržiūrėti narystę",
    monthLabel: "Šis mėnuo",
    averageLabel: "Vidutinė išlaida",
    topLabel: "Top kategorija",
    previewTitle: "Stilloak peržiūra",
    previewSubtitle: "Kaip atrodo aiškesnis mėnuo",
    monthPulse: "Mėnesio pulsas",
    signalTitle: "Taupymo signalas",
    signalText: "Maisto kategorija artėja prie ribos, todėl čia verta pradėti nuo mažų, aiškių korekcijų.",
    memberChangeTitle: "Kas pasikeičia su naryste",
    reasons: [
      {
        icon: WalletCards,
        title: "Matai, kur pinigai slysta",
        description: "Ne per bendrą jausmą, o per aiškias kategorijas, sumas ir pasikartojančius įpročius.",
      },
      {
        icon: ChartNoAxesColumn,
        title: "Palygini mėnesius",
        description: "Iš karto matai, ar išlaidos juda gera kryptimi, ar brangsta tyliai ir nepastebimai.",
      },
      {
        icon: PiggyBank,
        title: "Sprendimai tampa lengvesni",
        description: "Kai skaičiai aiškūs, lengviau nuspręsti, ką mažinti, o ko nereikia liesti.",
      },
      {
        icon: Target,
        title: "Nustatai ribas pagal kategoriją",
        description: "Biudžetai parodo ne tik kiek išleidai, bet ir kiek planavai skirti konkrečiai sričiai.",
      },
    ],
    transformations: [
      "Matai, kuri kategorija brangsta greičiausiai",
      "Nustatai mėnesio limitus maistui, transportui ar laisvalaikiui",
      "Iš karto matai, ar likai biudžete",
      "Grįžti prie aiškaus mėnesio vaizdo bet kada",
    ],
    first10Eyebrow: "Pirmos 10 minučių",
    first10Title: "Taip narys pradeda be chaoso.",
    first10Intro:
      "Narystė suteikia greitesnį rezultatą: aiškesnį mėnesio vaizdą ir mažiau chaoso sprendžiant, ką mažinti.",
    journey: [
      {
        step: "01",
        title: "Susivedi pajamas ir pirmus limitus",
        text: "Per kelias minutes nusistatai mėnesio tikslą, tris svarbiausias kategorijas ir pradedi nuo aiškaus plano.",
      },
      {
        step: "02",
        title: "Matai kur pinigai dingsta greičiausiai",
        text: "Programa pati išryškina, kuri kategorija brangsta, kur limitas jau arti ir kokia suma dar telpa taupymui.",
      },
      {
        step: "03",
        title: "Gauni kryptį ką koreguoti kitą savaitę",
        text: "Vietoje bendro jausmo gauni konkretų veiksmą: ką pristabdyti, kur neviršyti limito ir kiek atsidėti tikslui.",
      },
    ],
    compareChip: "Peržiūra ir narystė",
    compareTitle: "Peržiūra parodo pažadą. Narystė atrakina sistemą.",
    comparisonRows: [
      {
        label: "Peržiūra",
        publicValue: "Matai, kaip veikia pagrindinė logika",
        memberValue: "Naudoji pilną darbo erdvę su savo skaičiais",
      },
      {
        label: "Biudžetai",
        publicValue: "Matai tik pavyzdį",
        memberValue: "Nustatai realius limitus ir matai likutį kiekvienai kategorijai",
      },
      {
        label: "Automatinės įžvalgos",
        publicValue: "Matai pavyzdinius signalus",
        memberValue: "Gauni konkrečius signalus iš savo mėnesio duomenų",
      },
      {
        label: "Taupymo tikslai",
        publicValue: "Matai funkcijos kryptį",
        memberValue: "Seki progresą, likutį ir rekomenduojamą mėnesio tempą",
      },
    ],
    openMember: "Atidaryti nario versiją",
    unlockMember: "Atrakinti nario prieigą",
    viewPricing: "Peržiūrėti narystę",
    publicLabel: "Peržiūra",
    memberLabel: "Narystė",
    whatMemberSees: "Ką mato narys",
    memberTitle: "Programa ne tik seka išlaidas. Ji parodo kryptį.",
    memberText:
      "Tikras narys savo paskyroje mato gyvą darbo erdvę: gali pridėti išlaidas, jas redaguoti, filtruoti pagal kategoriją, stebėti mėnesio pokytį ir iškart matyti, ar telpa į nusistatytus biudžetus.",
    accessChip: "Prieiga",
    accessTitle: "Pilna versija atrakinta nariams.",
    accessText:
      "Peržiūra parodo, kaip Stilloak veikia. Pilna darbo erdvė atsiranda aktyviame Circle arba Private plane.",
    accessBullets: [
      { icon: LockKeyhole, text: "Pilna darbo erdvė atsidaro tik aktyviems nariams." },
      { icon: ShieldCheck, text: "Prieiga susieta su tavo privačia paskyra." },
      { icon: BadgeEuro, text: "Tikslas aiškus: pamatyti taupymo vietas ir biudžeto ribas." },
    ],
    includedTitle: "Įskaičiuota į Circle",
    journalCta: "Peržiūrėti Journal",
  },
  en: {
    chip: "Member program",
    title: "Stilloak shows where money slips and what to change first.",
    intro:
      "`Stilloak` is a private member space for spending, budgets, goals, and monthly signals. It helps you make fewer decisions from instinct and more from a clear picture.",
    primary: "Start with Circle",
    primaryOpen: "Open Stilloak",
    secondary: "View membership",
    monthLabel: "This month",
    averageLabel: "Average expense",
    topLabel: "Top category",
    previewTitle: "Stilloak demo",
    previewSubtitle: "What a clearer month looks like",
    monthPulse: "Month pulse",
    signalTitle: "Savings signal",
    signalText: "Food is moving close to its limit, so this is where small, clear adjustments are worth starting.",
    memberChangeTitle: "What changes with membership",
    reasons: [
      {
        icon: WalletCards,
        title: "You see where money slips",
        description: "Not through a vague feeling, but through clear categories, totals, and recurring habits.",
      },
      {
        icon: ChartNoAxesColumn,
        title: "You compare months",
        description: "You immediately see whether spending is moving in a healthier direction or quietly getting more expensive.",
      },
      {
        icon: PiggyBank,
        title: "Decisions become easier",
        description: "Once the numbers are clear, it becomes easier to decide what to cut and what to leave alone.",
      },
      {
        icon: Target,
        title: "You set limits by category",
        description: "Budgets show not only how much you spent, but how much you meant to allocate to each area.",
      },
    ],
    transformations: [
      "See which category is rising fastest",
      "Set monthly limits for food, transport, or lifestyle",
      "See immediately whether you stayed inside budget",
      "Return to a clearer monthly picture at any time",
    ],
    first10Eyebrow: "First 10 minutes",
    first10Title: "How a member starts without chaos.",
    first10Intro:
      "Membership creates a faster result: a clearer month and less chaos when deciding what to reduce.",
    journey: [
      {
        step: "01",
        title: "Set income and your first limits",
        text: "Within minutes you set a monthly target, your key categories, and begin from a clearer financial plan.",
      },
      {
        step: "02",
        title: "See where money disappears fastest",
        text: "The program highlights which category is rising, where a limit is close, and how much still fits savings.",
      },
      {
        step: "03",
        title: "Get direction for the next week",
        text: "Instead of a vague feeling, you get a concrete next step: what to slow down, where not to exceed the limit, and how much to set aside.",
      },
    ],
    compareChip: "Demo and membership",
    compareTitle: "The demo shows the promise. Membership unlocks the system.",
    comparisonRows: [
      {
        label: "Demo",
        publicValue: "You see how the core logic works",
        memberValue: "You use the full dashboard with your own numbers",
      },
      {
        label: "Budgets",
        publicValue: "You only see the idea",
        memberValue: "You set real limits and see the remaining balance for each category",
      },
      {
        label: "Automatic insights",
        publicValue: "You see example signals",
        memberValue: "You receive concrete signals from your own monthly data",
      },
      {
        label: "Savings goals",
        publicValue: "You see the feature direction",
        memberValue: "You track progress, remaining amount, and recommended monthly pace",
      },
    ],
    openMember: "Open member version",
    unlockMember: "Unlock member access",
    viewPricing: "View membership",
    publicLabel: "Demo",
    memberLabel: "Membership",
    whatMemberSees: "What the member sees",
    memberTitle: "The program does more than track expenses. It gives direction.",
    memberText:
      "A real member sees a living dashboard inside the account: they can add expenses, edit them, filter by category, track monthly change, and instantly see whether spending still fits their budgets.",
    accessChip: "Access",
    accessTitle: "The full version unlocks for members.",
    accessText:
      "The demo shows how Stilloak works. The full workspace appears inside an active Circle or Private plan.",
    accessBullets: [
      { icon: LockKeyhole, text: "The full dashboard opens only for active members." },
      { icon: ShieldCheck, text: "Access is tied to your private account." },
      { icon: BadgeEuro, text: "The goal is clear: spot savings opportunities and budget pressure." },
    ],
    includedTitle: "Included in Circle",
    journalCta: "View Journal",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  demoCopy[languageCode] = demoCopy.en;
});

const SavingsStudioDemoPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const copy = demoCopy[language] || demoCopy.lt;
  const canOpenStudio = hasActiveMembership(user);
  const monthPulseEntries = demoSummary.monthlyTotals.slice(-4);
  const highestMonthlyTotal = Math.max(...monthPulseEntries.map((entry) => entry.total), 1);

  return (
    <div className="space-y-10">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">{copy.chip}</span>
              <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.92] sm:text-6xl lg:text-7xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{copy.intro}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={canOpenStudio ? "/members/savings-studio" : "/pricing"} className="button-primary gap-2">
                  {canOpenStudio ? copy.primaryOpen : copy.primary}
                  <ArrowRight size={16} />
                </Link>
                <Link to="/pricing" className="hero-outline-button">
                  {copy.secondary}
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <DemoMetric label={copy.monthLabel} value={money.format(demoSummary.monthTotal)} hint={formatChange(demoSummary.change)} />
              <DemoMetric label={copy.averageLabel} value={money.format(demoSummary.averageSpend)} hint={`${demoSummary.recentCount} įrašų`} />
              <DemoMetric label={copy.topLabel} value={demoSummary.topCategory} hint={money.format(demoSummary.categoryTotals[0].total)} />
            </div>
          </div>

          <div className="hero-screen relative">
            <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{copy.previewTitle}</p>
                <p className="text-xs text-white/50">{copy.previewSubtitle}</p>
              </div>
              <span className="hero-chip">{copy.publicLabel}</span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">{copy.monthPulse}</p>
                <h2 className="mt-4 font-display text-4xl font-bold">{money.format(demoSummary.monthTotal)}</h2>
                <p className="mt-2 text-sm text-white/62">{formatChange(demoSummary.change)}</p>

                <div className="mt-6 grid h-[216px] grid-cols-4 items-end gap-4">
                  {monthPulseEntries.map((entry) => {
                    const height = `${Math.max((entry.total / highestMonthlyTotal) * 100, 18)}%`;
                    const [, monthPart] = entry.key.split("-");
                    const shortLabel = `${monthPart}/${entry.key.slice(2, 4)}`;

                    return (
                      <div key={entry.key} className="grid h-full grid-rows-[1fr_auto] items-end gap-3">
                        <div className="relative h-full w-full overflow-hidden rounded-full bg-white/8">
                          <div
                            className="absolute inset-x-0 bottom-0 rounded-full"
                            style={{
                              height,
                              background:
                                "linear-gradient(180deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
                            }}
                          />
                        </div>
                        <div className="min-h-[22px] text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-white/54">
                          <span className="block">{shortLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">{copy.signalTitle}</p>
                  <p className="mt-3 text-sm leading-6 text-white/72">{copy.signalText}</p>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">{copy.memberChangeTitle}</p>
                  <div className="mt-4 space-y-3">
                    {copy.transformations.slice(0, 3).map((entry) => (
                      <div key={entry} className="flex items-start gap-3 rounded-[18px] bg-white/4 px-4 py-3 text-sm">
                        <CheckCircle2 size={16} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                        <span className="text-white/72">{entry}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {copy.reasons.map((reason) => (
          <div key={reason.title} className="marketing-mini-card">
            <reason.icon size={22} style={{ color: "rgb(var(--accent))" }} />
            <h2 className="mt-5 font-display text-2xl font-bold">{reason.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{reason.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="public-section">
          <span className="eyebrow">{copy.first10Eyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.first10Title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{copy.first10Intro}</p>

          <div className="mt-8 space-y-4">
            {copy.journey.map((item) => (
              <div key={item.step} className="soft-card rounded-[24px] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))]/12 text-sm font-semibold text-[rgb(var(--accent))]">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8">
          <span className="hero-chip">{copy.compareChip}</span>
          <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">{copy.compareTitle}</h2>
          <div className="mt-8 space-y-4">
            {copy.comparisonRows.map((row) => (
              <div key={row.label} className="rounded-[22px] border border-white/8 bg-white/4 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="md:w-[30%]">
                    <p className="text-sm font-semibold text-white">{row.label}</p>
                  </div>
                  <div className="grid gap-3 md:w-[70%] md:grid-cols-2">
                    <div className="rounded-[18px] bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">{copy.publicLabel}</p>
                      <p className="mt-2 text-sm leading-6 text-white/68">{row.publicValue}</p>
                    </div>
                    <div className="rounded-[18px] bg-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">{copy.memberLabel}</p>
                      <p className="mt-2 text-sm leading-6 text-white/82">{row.memberValue}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={canOpenStudio ? "/members/savings-studio" : "/pricing"} className="button-primary">
              {canOpenStudio ? copy.openMember : copy.unlockMember}
            </Link>
            <Link to="/pricing" className="hero-outline-button">
              {copy.viewPricing}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="public-section">
          <span className="eyebrow">{copy.whatMemberSees}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.memberTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{copy.memberText}</p>

          <div className="mt-8 space-y-4">
            {demoEntries.map((entry) => (
              <div key={entry.id} className="soft-card rounded-[22px] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-2xl font-bold">{entry.title}</h3>
                      <span className="premium-tag">{entry.category}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{entry.notes}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xl font-semibold">{money.format(entry.amount)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {dateFormatter.format(new Date(`${entry.date}T00:00:00`))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8">
          <span className="hero-chip">{copy.accessChip}</span>
          <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">{copy.accessTitle}</h2>
          <p className="mt-4 text-base leading-7 text-white/68">{copy.accessText}</p>

          <div className="mt-8 space-y-4">
            {copy.accessBullets.map((item) => (
              <div key={item.text} className="metric-card flex items-start gap-3">
                <item.icon size={18} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="text-sm leading-6 text-white/72">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">{copy.includedTitle}</p>
            <div className="mt-4 space-y-3">
              {copy.transformations.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-white/74">
                  <CheckCircle2 size={16} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={canOpenStudio ? "/members/savings-studio" : "/pricing"} className="button-primary">
              {canOpenStudio ? copy.openMember : copy.primary}
            </Link>
            <Link to="/journal" className="hero-outline-button">
              {copy.journalCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const DemoMetric = ({ hint, label, value }) => (
  <div className="metric-card">
    <p className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</p>
    <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    <p className="mt-2 text-sm text-white/62">{hint}</p>
  </div>
);

export default SavingsStudioDemoPage;
