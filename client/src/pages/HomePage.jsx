import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

const clarityPillars = [
  {
    icon: WalletCards,
    title: "Vienas aiškus pinigų vaizdas",
    description: "Biudžetai, mėnesio išlaidos, pasikartojantys mokėjimai ir tikslai gyvena vienoje ramioje nario erdvėje.",
  },
  {
    icon: Target,
    title: "Sprendimai, ne tik skaičiai",
    description: "Stilloak parodo, kur mėnuo praranda kontrolę ir kur atsiranda reali vieta pradėti taupyti.",
  },
  {
    icon: Mail,
    title: "Suvestinės, kurios dirba už tave",
    description: "Savaitiniai ir mėnesiniai laiškai grąžina prie svarbiausių signalų net tada, kai neatsidarai dashboardo.",
  },
];

const insideProgram = [
  {
    eyebrow: "01",
    title: "Biudžetai pagal kategoriją",
    text: "Nusistatai limitus maistui, transportui, būstui ar laisvalaikiui ir iš karto matai, kiek jau spaudžia mėnesis.",
  },
  {
    eyebrow: "02",
    title: "Taupymo tikslai su tempu",
    text: "Programoje matai ne tik tikslą, bet ir ar dabartinis mėnesio tempas jį realiai pasieks laiku.",
  },
  {
    eyebrow: "03",
    title: "Recurring ir CSV importas",
    text: "Pastovūs mokėjimai ir banko CSV importas leidžia susikurti pilnesnį mėnesio vaizdą be rankinio chaoso.",
  },
  {
    eyebrow: "04",
    title: "AI suvestinės el. paštu",
    text: "Gauni aiškų komentarą, rizikos signalus ir kitą žingsnį, kad sistema padėtų veikti, o ne tik kaupti duomenis.",
  },
];

const useCases = [
  {
    title: "Jei nori pagauti, kur pinigai dingsta kasdien",
    description: "Stilloak greitai išryškina, kurios smulkios išlaidos auga greičiausiai ir kur verta pristabdyti pirmiausia.",
  },
  {
    title: "Jei taupai konkrečiam tikslui",
    description: "Tikslų progresas ir rekomenduojamas mėnesio atsidėjimas padeda matyti, ar judi link rezultato, ar tik tikiesi.",
  },
  {
    title: "Jei nori ramesnio mėnesio ritmo",
    description: "Biudžetų spaudimas, recurring našta ir savaitiniai svyravimai sudedami į vieną aiškesnę sistemą.",
  },
];

const membershipLevels = [
  {
    label: "Guest",
    title: "Peržiūra prieš įsipareigojant",
    description: "Matai pasaulį, pricing logiką ir viešą produkto pažadą, bet pilnas įrankis lieka už narystės sluoksnio.",
  },
  {
    label: "Circle",
    title: "Pilna Stilloak prieiga",
    description: "Atrakina dashboardą, biudžetus, taupymo tikslus, recurring išlaidas, CSV importą ir AI suvestines.",
  },
  {
    label: "Private",
    title: "Aukštesnio lygio santykis",
    description: "Tiems, kas nori stipresnio palaikymo, gilesnės nario patirties ir daugiau vietos būsimoms premium funkcijoms.",
  },
];

const trustSignals = [
  "Stripe apmokėjimas ir aiški narystės aktyvacija",
  "Privatus paskyros archyvas su sąskaitomis ir downloadais",
  "Members-only įrankis, o ne viešas demo dashboardas",
  "AI savaitinės ir mėnesinės suvestinės tiesiai į el. paštą",
];

const HomePage = () => (
  <div className="space-y-10 pb-6">
    <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between">
          <div>
            <span className="hero-chip">Private money clarity</span>
            <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold leading-[0.92] sm:text-6xl lg:text-7xl">
              Stilloak padeda suprasti, kur realiai pradėti taupyti pinigus.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Tai members-only programa tiems, kurie nori aiškesnio mėnesio vaizdo: biudžetų pagal kategoriją,
              taupymo tikslų, recurring išlaidų, CSV importo ir premium el. pašto suvestinių vienoje ramioje erdvėje.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pricing" className="button-primary gap-2">
                Unlock Stilloak
                <ArrowRight size={16} />
              </Link>
              <Link to="/savings-studio" className="hero-outline-button">
                Preview the program
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <HeroMetric
              label="Pagrindas"
              value="Biudžetai"
              hint="Matai, kiek planavai ir kiek jau suvalgė mėnuo."
            />
            <HeroMetric
              label="Rezultatas"
              value="Aiškumas"
              hint="Ne tik kur išleidai, bet ir ką verta koreguoti toliau."
            />
            <HeroMetric
              label="Ritmas"
              value="Suvestinės"
              hint="Savaitiniai ir mėnesiniai laiškai grąžina prie svarbiausio vaizdo."
            />
          </div>
        </div>

        <div className="hero-screen relative flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Stilloak member preview</p>
              <p className="text-xs text-white/50">What opens after membership</p>
            </div>
            <span className="hero-chip">Circle access</span>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">What the member sees</p>
            <h2 className="mt-4 font-display text-4xl font-bold">Mėnuo, kuris nebesislepia</h2>
            <p className="mt-3 text-sm leading-6 text-white/66">
              Dashboarde atsiranda biudžetų spaudimas, recurring našta, taupymo tempas ir aiškesnis veiksmų planas kitai savaitei.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MemberTile title="Biudžetai" body="Ribos pagal kategoriją su likučiu ir perspėjimais." />
              <MemberTile title="Tikslai" body="Progressas, likutis ir rekomenduojamas mėnesio tempas." />
              <MemberTile title="Recurring" body="Pastovūs mokėjimai, kurie rodo tikrą mėnesio spaudimą." />
              <MemberTile title="AI email" body="Komentaras, rizikos signalai ir aiškus kitas žingsnis." />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Best first path</p>
            <div className="mt-4 space-y-3">
              {[
                "Įsivardini mėnesio pajamas ir tikslą.",
                "Susidedi pirmus 3 biudžetus.",
                "Pradedi matyti, kur iš tiesų atsiranda vieta taupyti.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-white/74">
                  <CheckCircle2 size={16} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="public-section grid gap-4 sm:grid-cols-3">
      {clarityPillars.map((pillar) => (
        <div key={pillar.title} className="marketing-mini-card">
          <pillar.icon size={22} style={{ color: "rgb(var(--accent))" }} />
          <h2 className="mt-5 font-display text-2xl font-bold">{pillar.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{pillar.description}</p>
        </div>
      ))}
    </section>

    <section className="public-section">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow">inside stilloak</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
            Viena programa, keturi sluoksniai, vienas aiškesnis mėnuo.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Čia svarbiausia ne ekranų kiekis, o tai, kad kiekvienas sluoksnis veda prie aiškesnio sprendimo: ką
            pristabdyti, kur per daug spaudžia, ir kiek dar telpa tikslui.
          </p>
        </div>
        <Link to="/savings-studio" className="button-secondary">
          Preview the flow
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {insideProgram.map((item) => (
          <div key={item.title} className="marketing-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.eyebrow}</p>
            <h3 className="mt-4 font-display text-3xl font-bold">{item.title}</h3>
            <p className="mt-4 text-sm leading-7 text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="public-section">
        <span className="eyebrow">who it helps</span>
        <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Stilloak skirtas ne tobulam biudžetuotojui, o žmogui, kuris nori daugiau kontrolės.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Jei tavo pinigų vaizdas dažnai remiasi nuojauta, o ne aiškumu, Stilloak suteikia ramesnę sistemą,
          kurią gali pradėti naudoti be sudėtingo finansinio setup.
        </p>

        <div className="mt-8 space-y-4">
          {useCases.map((item) => (
            <div key={item.title} className="soft-card rounded-[24px] p-5">
              <h3 className="font-display text-2xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8">
        <span className="hero-chip">Membership path</span>
        <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">
          Reklamai svarbiausia viena kryptis: nuo preview iki aktyvios narystės.
        </h2>
        <p className="mt-4 text-base leading-7 text-white/68">
          Dėl to visa svetainė turi aiškiai vesti į vieną veiksmą: suprasti produktą, pamatyti skirtumus tarp planų
          ir atrakinti pilną Stilloak versiją.
        </p>

        <div className="mt-8 space-y-4">
          {membershipLevels.map((item) => (
            <div key={item.label} className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">{item.label}</p>
              <p className="mt-3 font-display text-3xl font-bold">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/pricing" className="button-primary">
            View membership
          </Link>
          <Link to="/story" className="hero-outline-button">
            Read the story
          </Link>
        </div>
      </div>
    </section>

    <section className="public-section">
      <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
        <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
          Before ads
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(29,24,19)]">
          Aukštos kokybės įspūdis ateina iš aiškumo, ne iš perkrovimo.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(98,87,74)]">
          Todėl reklamuojant verta vesti ne į bendrą shopą, o į vieną pažadą: Stilloak padeda ramiau valdyti pinigus,
          suprasti mėnesio spaudimą ir realiau judėti link taupymo tikslų.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {trustSignals.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-3 text-sm text-[rgb(98,87,74)]">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/pricing" className="button-primary">
            Unlock Stilloak
          </Link>
          <Link to="/launch-soon" className="button-secondary">
            View launch status
          </Link>
        </div>
      </div>
    </section>
  </div>
);

const HeroMetric = ({ hint, label, value }) => (
  <div className="metric-card">
    <p className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</p>
    <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    <p className="mt-2 text-sm text-white/60">{hint}</p>
  </div>
);

const MemberTile = ({ body, title }) => (
  <div className="rounded-[20px] bg-white/5 p-4">
    <p className="text-xs text-white/45">{title}</p>
    <p className="mt-2 text-sm leading-6 text-white/72">{body}</p>
  </div>
);

export default HomePage;
