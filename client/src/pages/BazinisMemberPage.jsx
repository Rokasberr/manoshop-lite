import {
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Newspaper,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const bazinisCards = [
  {
    title: "Mėnesio apžvalga",
    text: "Matyk pagrindinę mėnesio kryptį ir svarbiausius akcentus.",
    label: "Pasiekiama",
    access: "Įtraukta Bazinyje",
    icon: CalendarRange,
  },
  {
    title: "Riboti skaitmeniniai resursai",
    text: "Gauk atrinktus pradinius resursus ir nario turinio peržiūras.",
    label: "Ribota",
    access: "Ribota prieiga",
    icon: FileText,
  },
  {
    title: "Nario naujienos",
    text: "Sek naujus pristatymus, produkto atnaujinimus ir StillOak Studio kryptį.",
    label: "Pasiekiama",
    access: "Įtraukta Bazinyje",
    icon: Newspaper,
  },
];

const lockedAsmeninisFeatures = [
  "Pilna nario zona",
  "Mėnesio suvestinės",
  "Tikslų ir progreso kortelės",
  "Journal tik nariams",
  "Premium skaitmeniniai resursai",
];

const BazinisMemberPage = () => (
  <div className="space-y-8 pb-6">
    <section className="public-section overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <div className="min-w-0">
          <span className="signal-pill">Bazinis · pradinis planas</span>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
            Bazinio nario erdvė
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Paprasta pradžia mėnesio apžvalgai, pagrindiniams resursams ir StillOak Studio naujienoms.
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted">
            Bazinis skirtas susipažinti su nario ritmu. Čia aktyvios pagrindinės peržiūros ir naujienos, o pilni
            darbo įrankiai atsiveria natūraliai atnaujinus planą į Asmeninį.
          </p>
        </div>

        <div className="soft-card rounded-[28px] p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck size={20} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">rami pradžia</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Čia matai tik pagrindinį nario sluoksnį: aiškią kryptį, ribotus resursus ir svarbiausius atnaujinimus
                be pažangių Asmeninio įrankių.
              </p>
              <p className="mt-5 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-muted">
                Atšauk bet kada · Atnaujink planą bet kuriuo metu · Saugus apmokėjimas
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="signal-pill">Pasiekiama Bazinyje</span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">Tavo pradinis nario sluoksnis</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted">
          Šios dalys yra sukurtos lengvam startui. Jos rodo kryptį ir turinio peržiūras, bet neapsimeta pilna
          Asmeninio plano darbo zona.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {bazinisCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className="marketing-card flex h-full min-h-[250px] flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: "rgb(var(--surface-soft))",
                    color: "rgb(var(--accent-strong))",
                  }}
                >
                  <Icon size={20} />
                </div>
                <span className="signal-pill shrink-0">{card.label}</span>
              </div>
              <h3 className="mt-7 font-display text-3xl font-bold leading-tight">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{card.text}</p>
              <p className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-muted">
                <CheckCircle2 size={14} className="shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                {card.access}
              </p>
            </div>
          );
        })}
      </div>
    </section>

    <section className="surface-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div className="min-w-0">
          <span className="hero-chip">Atnaujinimas</span>
          <h2 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Norisi pilnos patirties?
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
            Asmeninis planas atrakina pilną nario zoną, suvestines, tikslų korteles, Journal ir premium resursus.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
            Bazinis lieka pradžios erdve. Asmeninis yra skirtas tada, kai nori pilno mėnesio valdymo ir gilesnės
            StillOak Studio patirties.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/pricing" className="button-primary gap-2">
              Atnaujinti į Asmeninį
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <LockKeyhole size={20} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">reikia Asmeninio</p>
              <p className="mt-3 text-sm leading-7 text-white/68">
                Šios dalys nėra sugedusios ar prarastos. Jos tiesiog priklauso Asmeniniam planui, kai būsi pasiruošęs
                pilnai nario patirčiai.
              </p>
              <div className="mt-5 grid gap-3 text-sm text-white/70">
                {lockedAsmeninisFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-[18px] bg-white/5 px-4 py-3">
                    <LockKeyhole size={14} className="shrink-0 text-white/42" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link to="/pricing" className="button-secondary mt-6 gap-2">
                Atnaujinti į Asmeninį
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default BazinisMemberPage;
