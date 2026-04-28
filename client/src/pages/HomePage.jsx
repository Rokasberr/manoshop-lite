import {
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Target,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

const homeCopy = {
  lt: {
    chip: "Privatus pinigų aiškumas",
    title: "Stilloak padeda suprasti, kur realiai pradėti taupyti pinigus.",
    intro:
      "Tai members-only programa tiems, kurie nori aiškesnio mėnesio vaizdo: biudžetų pagal kategoriją, taupymo tikslų, recurring išlaidų, CSV importo ir premium el. pašto suvestinių vienoje ramioje erdvėje.",
    primaryCta: "Atrakinti Stilloak",
    secondaryCta: "Peržiūrėti programą",
    metrics: [
      {
        label: "Pagrindas",
        value: "Biudžetai",
        hint: "Matai, kiek planavai ir kiek jau suvalgė mėnuo.",
      },
      {
        label: "Rezultatas",
        value: "Aiškumas",
        hint: "Ne tik kur išleidai, bet ir ką verta koreguoti toliau.",
      },
      {
        label: "Ritmas",
        value: "Suvestinės",
        hint: "Savaitiniai ir mėnesiniai laiškai grąžina prie svarbiausio vaizdo.",
      },
    ],
    previewTitle: "Stilloak nario peržiūra",
    previewSubtitle: "Kas atsiveria po narystės",
    previewBlockTitle: "Mėnuo, kuris nebesislepia",
    previewBlockText:
      "Dashboarde atsiranda biudžetų spaudimas, recurring našta, taupymo tempas ir aiškesnis veiksmų planas kitai savaitei.",
    tiles: [
      { title: "Biudžetai", body: "Ribos pagal kategoriją su likučiu ir perspėjimais." },
      { title: "Tikslai", body: "Progressas, likutis ir rekomenduojamas mėnesio tempas." },
      { title: "Recurring", body: "Pastovūs mokėjimai, kurie rodo tikrą mėnesio spaudimą." },
      { title: "AI email", body: "Komentaras, rizikos signalai ir aiškus kitas žingsnis." },
    ],
    pathTitle: "Geriausias pirmas kelias",
    pathSteps: [
      "Įsivardini mėnesio pajamas ir tikslą.",
      "Susidedi pirmus 3 biudžetus.",
      "Pradedi matyti, kur iš tiesų atsiranda vieta taupyti.",
    ],
    pillarsEyebrow: "Kodėl tai veikia",
    pillarsTitle: "Viena programa, kuri ne tik seka, bet padeda nuspręsti.",
    pillarsIntro:
      "Stilloak turi duoti mažiau chaoso ir daugiau krypties. Tam svarbiausi ne papildomi ekranai, o aiškesni signalai, kuriuos gali panaudoti dabar.",
    pillars: [
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
    ],
    structureEyebrow: "Kas yra viduje",
    structureTitle: "Vienas įrankis, keturi sluoksniai, vienas aiškesnis mėnuo.",
    structureIntro:
      "Čia svarbiausia ne ekranų kiekis, o tai, kad kiekvienas sluoksnis veda prie aiškesnio sprendimo: ką pristabdyti, kur per daug spaudžia ir kiek dar telpa tikslui.",
    structureCta: "Peržiūrėti eigą",
    structure: [
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
    ],
    useCasesEyebrow: "Kam tai skirta",
    useCasesTitle: "Stilloak skirtas ne tobulam biudžetuotojui, o žmogui, kuris nori daugiau kontrolės.",
    useCasesIntro:
      "Jei tavo pinigų vaizdas dažnai remiasi nuojauta, o ne aiškumu, Stilloak suteikia ramesnę sistemą, kurią gali pradėti naudoti be sudėtingo finansinio setup.",
    useCases: [
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
    ],
    membershipChip: "Narystės kelias",
    membershipTitle: "Reklamai svarbiausia viena kryptis: nuo preview iki aktyvios narystės.",
    membershipIntro:
      "Dėl to visa svetainė turi aiškiai vesti į vieną veiksmą: suprasti produktą, pamatyti skirtumus tarp planų ir atrakinti pilną Stilloak versiją.",
    membershipCards: [
      {
        label: "Guest",
        title: "Peržiūra prieš įsipareigojant",
        description: "Matai pasaulį, pricing logiką ir paskyrą prieš atrakindamas pilną nario įrankį.",
      },
      {
        label: "Circle",
        title: "Pilna Stilloak prieiga",
        description: "Atrakina dashboardą, biudžetus, tikslus, recurring išlaidas, CSV importą ir AI suvestines.",
      },
      {
        label: "Private",
        title: "Aukštesnio lygio santykis",
        description: "Tiems, kas nori stipresnio palaikymo, daugiau premium sluoksnio ir gilesnės nario patirties.",
      },
    ],
    membershipPrimary: "Peržiūrėti narystę",
    membershipSecondary: "Skaityti istoriją",
    trustEyebrow: "Prieš reklamas",
    trustTitle: "Aukštos kokybės įspūdis ateina iš aiškumo, ne iš perkrovimo.",
    trustIntro:
      "Todėl reklamuojant verta vesti ne į bendrą shopą, o į vieną pažadą: Stilloak padeda ramiau valdyti pinigus, suprasti mėnesio spaudimą ir realiau judėti link taupymo tikslų.",
    trustSignals: [
      "Stripe apmokėjimas ir aiški narystės aktyvacija",
      "Privatus paskyros archyvas su sąskaitomis ir atsisiuntimais",
      "Members-only įrankis, o ne viešas demo dashboardas",
      "AI savaitinės ir mėnesinės suvestinės tiesiai į el. paštą",
    ],
    trustPrimary: "Atrakinti Stilloak",
    trustSecondary: "Peržiūrėti launch status",
  },
  en: {
    chip: "Private money clarity",
    title: "Stilloak helps you see where to start saving money for real.",
    intro:
      "It is a members-only program for people who want a clearer monthly view: category budgets, savings goals, recurring spend, CSV import, and premium email summaries in one calm space.",
    primaryCta: "Unlock Stilloak",
    secondaryCta: "Preview the program",
    metrics: [
      { label: "Core", value: "Budgets", hint: "See what you planned and what the month has already consumed." },
      { label: "Result", value: "Clarity", hint: "Not only where you spent, but what to adjust next." },
      { label: "Rhythm", value: "Summaries", hint: "Weekly and monthly emails bring you back to the signal." },
    ],
    previewTitle: "Stilloak member preview",
    previewSubtitle: "What opens after membership",
    previewBlockTitle: "A month that no longer hides",
    previewBlockText:
      "Inside the dashboard you see budget pressure, recurring load, goal pace, and a clearer next-step plan for the coming week.",
    tiles: [
      { title: "Budgets", body: "Category limits with remaining balance and warning signals." },
      { title: "Goals", body: "Progress, remaining amount, and recommended monthly pace." },
      { title: "Recurring", body: "Fixed payments that show the true pressure of the month." },
      { title: "AI email", body: "Commentary, risk signals, and a clear next step." },
    ],
    pathTitle: "Best first path",
    pathSteps: [
      "Define your monthly income and target.",
      "Set your first 3 budgets.",
      "Start seeing where savings space really appears.",
    ],
    pillarsEyebrow: "Why it works",
    pillarsTitle: "One program that does more than track.",
    pillarsIntro:
      "Stilloak should create less chaos and more direction. That depends less on more screens and more on better signals you can use right now.",
    pillars: [
      {
        icon: WalletCards,
        title: "One clear money view",
        description: "Budgets, monthly spending, recurring payments, and goals live in one calm member space.",
      },
      {
        icon: Target,
        title: "Decisions, not just numbers",
        description: "Stilloak shows where the month loses control and where real room to save starts to appear.",
      },
      {
        icon: Mail,
        title: "Summaries that work for you",
        description: "Weekly and monthly emails bring you back to the most important signals, even when you do not open the dashboard.",
      },
    ],
    structureEyebrow: "What is inside",
    structureTitle: "One tool, four layers, one clearer month.",
    structureIntro:
      "The point is not the number of screens. Each layer should help you make a clearer decision: what to slow down, what is putting pressure on the month, and what still fits your goal.",
    structureCta: "Preview the flow",
    structure: [
      { eyebrow: "01", title: "Category budgets", text: "Set limits for food, transport, housing, or lifestyle and instantly see how the month is pressing back." },
      { eyebrow: "02", title: "Goals with pace", text: "You see not just the target, but whether your current monthly pace will realistically get you there." },
      { eyebrow: "03", title: "Recurring + CSV import", text: "Fixed payments and CSV imports let you build a fuller monthly picture without manual chaos." },
      { eyebrow: "04", title: "AI summaries by email", text: "You receive commentary, risk signals, and a clear next step so the system helps you act, not just collect data." },
    ],
    useCasesEyebrow: "Who it helps",
    useCasesTitle: "Stilloak is not for the perfect budgeter. It is for the person who wants more control.",
    useCasesIntro:
      "If your money picture often depends on feeling rather than clarity, Stilloak gives you a calmer system you can start using without a complex financial setup.",
    useCases: [
      { title: "If you want to catch where money leaks daily", description: "Stilloak quickly highlights which small expenses are growing fastest and where it makes sense to slow down first." },
      { title: "If you are saving toward a real goal", description: "Goal progress and recommended monthly saving pace show whether you are moving toward a result or just hoping." },
      { title: "If you want a calmer monthly rhythm", description: "Budget pressure, recurring load, and weekly swings are brought into one clearer system." },
    ],
    membershipChip: "Membership path",
    membershipTitle: "For advertising, one direction matters most: from preview to active membership.",
    membershipIntro:
      "That is why the site should guide people to one action: understand the product, see the differences between plans, and unlock the full Stilloak version.",
    membershipCards: [
      { label: "Guest", title: "Preview before commitment", description: "You see the world, the pricing logic, and the account layer before unlocking the full member tool." },
      { label: "Circle", title: "Full Stilloak access", description: "Unlocks the dashboard, budgets, goals, recurring spend, CSV import, and AI summaries." },
      { label: "Private", title: "A higher-touch relationship", description: "For people who want stronger support, a more premium layer, and a deeper member experience." },
    ],
    membershipPrimary: "View membership",
    membershipSecondary: "Read the story",
    trustEyebrow: "Before ads",
    trustTitle: "A premium impression comes from clarity, not overload.",
    trustIntro:
      "That is why ads should not lead into a generic storefront. They should lead into one promise: Stilloak helps you manage money more calmly, understand monthly pressure, and move more realistically toward savings goals.",
    trustSignals: [
      "Stripe payments and clear membership activation",
      "Private account archive with invoices and downloads",
      "Members-only tool instead of a public demo dashboard",
      "AI weekly and monthly summaries delivered by email",
    ],
    trustPrimary: "Unlock Stilloak",
    trustSecondary: "View launch status",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  homeCopy[languageCode] = homeCopy.en;
});

const HomePage = () => {
  const { language } = useLanguage();
  const copy = homeCopy[language] || homeCopy.lt;

  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">{copy.chip}</span>
              <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold leading-[0.92] sm:text-6xl lg:text-7xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{copy.intro}</p>

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
              {copy.metrics.map((metric) => (
                <HeroMetric key={metric.label} {...metric} />
              ))}
            </div>
          </div>

          <div className="hero-screen relative flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{copy.previewTitle}</p>
                <p className="text-xs text-white/50">{copy.previewSubtitle}</p>
              </div>
              <span className="hero-chip">Circle access</span>
            </div>

            <div className="rounded-[26px] border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">{copy.membershipChip}</p>
              <h2 className="mt-4 font-display text-4xl font-bold">{copy.previewBlockTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-white/66">{copy.previewBlockText}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {copy.tiles.map((tile) => (
                  <MemberTile key={tile.title} {...tile} />
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">{copy.pathTitle}</p>
              <div className="mt-4 space-y-3">
                {copy.pathSteps.map((item) => (
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

      <section className="public-section">
        <div>
          <span className="eyebrow">{copy.pillarsEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.pillarsTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{copy.pillarsIntro}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {copy.pillars.map((pillar) => (
            <div key={pillar.title} className="marketing-mini-card">
              <pillar.icon size={22} style={{ color: "rgb(var(--accent))" }} />
              <h2 className="mt-5 font-display text-2xl font-bold">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">{copy.structureEyebrow}</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.structureTitle}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{copy.structureIntro}</p>
          </div>
          <Link to="/savings-studio" className="button-secondary">
            {copy.structureCta}
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {copy.structure.map((item) => (
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
          <span className="eyebrow">{copy.useCasesEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.useCasesTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{copy.useCasesIntro}</p>

          <div className="mt-8 space-y-4">
            {copy.useCases.map((item) => (
              <div key={item.title} className="soft-card rounded-[24px] p-5">
                <h3 className="font-display text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8">
          <span className="hero-chip">{copy.membershipChip}</span>
          <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">{copy.membershipTitle}</h2>
          <p className="mt-4 text-base leading-7 text-white/68">{copy.membershipIntro}</p>

          <div className="mt-8 space-y-4">
            {copy.membershipCards.map((item) => (
              <div key={item.label} className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">{item.label}</p>
                <p className="mt-3 font-display text-3xl font-bold">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-white/68">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/pricing" className="button-primary">
              {copy.membershipPrimary}
            </Link>
            <Link to="/story" className="hero-outline-button">
              {copy.membershipSecondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
          <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
            {copy.trustEyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(29,24,19)]">
            {copy.trustTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(98,87,74)]">{copy.trustIntro}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {copy.trustSignals.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-3 text-sm text-[rgb(98,87,74)]"
              >
                <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/pricing" className="button-primary">
              {copy.trustPrimary}
            </Link>
            <Link to="/launch-soon" className="button-secondary">
              {copy.trustSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

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
