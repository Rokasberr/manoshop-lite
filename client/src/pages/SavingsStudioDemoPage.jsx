import {
  ArrowRight,
  BadgeEuro,
  ChartNoAxesColumn,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
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

const reasons = [
  {
    icon: WalletCards,
    title: "Pamatai, kur pinigai išteka",
    description: "Ne per bendrą jausmą, o per aiškias kategorijas, sumas ir pasikartojančius įpročius.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Palygini mėnesius",
    description: "Iš karto matai, ar išlaidos juda gera kryptimi, ar brangsta tyliai ir nepastebimai.",
  },
  {
    icon: PiggyBank,
    title: "Lengviau priimi sprendimus",
    description: "Kai skaičiai aiškūs, lengviau nuspręsti, ką mažinti, o ko nereikia liesti.",
  },
];

const SavingsStudioDemoPage = () => {
  const { user } = useAuth();
  const canOpenStudio = hasActiveMembership(user);
  const highestMonthlyTotal = Math.max(...demoSummary.monthlyTotals.map((entry) => entry.total), 1);

  return (
    <div className="space-y-10">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">subscription tool</span>
              <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.92] sm:text-6xl lg:text-7xl">
                Savings Studio padeda pamatyti, kur galima pradėti taupyti.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Tai members-only modulis tavo paskyroje: paprastas išlaidų sekimas, mėnesių palyginimai ir
                aiškus vaizdas, kur pinigai išeina greičiausiai.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={canOpenStudio ? "/members/savings-studio" : "/pricing"} className="button-primary gap-2">
                  {canOpenStudio ? "Open Savings Studio" : "Unlock with membership"}
                  <ArrowRight size={16} />
                </Link>
                <Link to="/pricing" className="hero-outline-button">
                  View membership plans
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <DemoMetric label="Šis mėnuo" value={money.format(demoSummary.monthTotal)} hint={formatChange(demoSummary.change)} />
              <DemoMetric label="Vidutinė išlaida" value={money.format(demoSummary.averageSpend)} hint={`${demoSummary.recentCount} įrašų`} />
              <DemoMetric label="Top kategorija" value={demoSummary.topCategory} hint={money.format(demoSummary.categoryTotals[0].total)} />
            </div>
          </div>

          <div className="hero-screen relative">
            <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Savings Studio preview</p>
                <p className="text-xs text-white/50">How the program helps you save money</p>
              </div>
              <span className="hero-chip">Demo</span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Month pulse</p>
                <h2 className="mt-4 font-display text-4xl font-bold">{money.format(demoSummary.monthTotal)}</h2>
                <p className="mt-2 text-sm text-white/62">{formatChange(demoSummary.change)}</p>

                <div className="mt-6 grid h-[180px] grid-cols-6 items-end gap-3">
                  {demoSummary.monthlyTotals.map((entry) => {
                    const height = `${Math.max((entry.total / highestMonthlyTotal) * 100, 18)}%`;

                    return (
                      <div key={entry.key} className="flex h-full flex-col items-center justify-end gap-2">
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
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/48">
                          {entry.label.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Savings signal</p>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    Maistas šį mėnesį sudaro didžiausią dalį, todėl būtent čia verta pradėti nuo mažų pakeitimų.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Top categories</p>
                  <div className="mt-4 space-y-3">
                    {demoSummary.categoryTotals.map((entry) => (
                      <div key={entry.category} className="flex items-center justify-between gap-4 rounded-[18px] bg-white/4 px-4 py-3 text-sm">
                        <span>{entry.category}</span>
                        <span className="text-white/72">{money.format(entry.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section grid gap-4 sm:grid-cols-3">
        {reasons.map((reason) => (
          <div key={reason.title} className="marketing-mini-card">
            <reason.icon size={22} style={{ color: "rgb(var(--accent))" }} />
            <h2 className="mt-5 font-display text-2xl font-bold">{reason.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{reason.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="public-section">
          <span className="eyebrow">what the member sees</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Programa ne tik seka išlaidas, bet parodo kryptį.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Tikras narys savo paskyroje mato gyvą dashboardą: gali pridėti išlaidas, jas redaguoti, filtruoti
            pagal kategoriją ir matyti, kaip mėnuo lyginasi su ankstesniu.
          </p>

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
          <span className="hero-chip">Access model</span>
          <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">Atrakinta tik po membership pirkimo.</h2>
          <p className="mt-4 text-base leading-7 text-white/68">
            Viešai matai, kaip programa atrodo ir kuo ji naudinga. Pilnas įrankis atsiranda tik aktyviame
            `Circle` arba `Private` plane, prisijungus prie paskyros.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { icon: LockKeyhole, text: "Pilnas dashboardas atsidaro tik aktyviems nariams." },
              { icon: ShieldCheck, text: "Serveris irgi tikrina membership, ne tik frontend." },
              { icon: BadgeEuro, text: "Paskirtis aiški: padėti tau pamatyti realias taupymo vietas." },
            ].map((item) => (
              <div key={item.text} className="metric-card flex items-start gap-3">
                <item.icon size={18} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="text-sm leading-6 text-white/72">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={canOpenStudio ? "/members/savings-studio" : "/pricing"} className="button-primary">
              {canOpenStudio ? "Open member version" : "Unlock with Circle"}
            </Link>
            <Link to="/journal" className="hero-outline-button">
              See members Journal
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
