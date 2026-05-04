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
    chip: "Privati mėnesio kontrolė",
    title: "Stilloak padeda aiškiai matyti mėnesį, apsaugoti biudžetą ir ramiau judėti link tikslų.",
    intro:
      "Tai narystės produktas žmonėms, kurie nori ne dar vienos išlaidų lentelės, o vienos ramios sistemos: kur spaudžia mėnuo, kiek dar telpa tikslui ir ką verta daryti toliau.",
    primaryCta: "Peržiūrėti narystę",
    secondaryCta: "Pamatyti programą",
    highlights: [
      "Biudžetai pagal kategoriją su realiu mėnesio spaudimu",
      "Pastovios išlaidos, CSV importas ir tikslai vienoje darbo erdvėje",
      "Savaitinės ir mėnesinės suvestinės, kurios pasako ką verta daryti toliau",
    ],
    stats: [
      { label: "Pagrindas", value: "Biudžetai", hint: "Ne tik sumos, o limitai su aiškiu mėnesio vaizdu." },
      { label: "Svarbiausia nauda", value: "Aiškumas", hint: "Matai, kur realiai dingsta pinigai ir kur verta koreguoti ritmą." },
      { label: "Automatinis sluoksnis", value: "Suvestinės", hint: "Sistema grąžina prie svarbiausio signalo be papildomo triukšmo." },
    ],
    previewEyebrow: "Kas laukia viduje",
    previewTitle: "Vienas ekranas vietoj penkių padrikų įrankių",
    previewText:
      "Savings Studio vienoje vietoje sujungia mėnesio spaudimą, pastovias išlaidas, taupymo progresą ir trumpą veiksmų kryptį, kurią gali pamatyti iškart prisijungęs.",
    previewRows: [
      ["Šio mėnesio spaudimas", "Maisto kategorija artėja prie limito"],
      ["Pastovios išlaidos", "312 € / mėn."],
      ["Kelionės tikslas", "62% pasiekta"],
      ["Kitas žingsnis", "Pristabdyti smulkias išlaidas šią savaitę"],
    ],
    promiseEyebrow: "Launch-ready pažadas",
    promiseTitle: "Viešas puslapis turi aiškiai parduoti produktą, ne jo istoriją.",
    promiseText:
      "Todėl pagrindinis puslapis veda tiesiai į demonstraciją, narystę ir tai, kokią realią kontrolę žmogus įgauna prisijungęs.",
    unlockEyebrow: "Ką realiai gauni",
    unlockList: [
      "Pilną Savings Studio darbo zoną",
      "Privatų sąskaitų, laiškų ir suvestinių archyvą",
      "Tvarkingą nario patirtį nuo prisijungimo iki mėnesio apžvalgos",
    ],
    layersEyebrow: "Produkto sluoksniai",
    layersTitle: "Svarbiausi moduliai, dėl kurių Stilloak tampa naudingu kas savaitę",
    layersIntro:
      "Rinkai paruoštas produktas turi aiškiai pasakyti, ką daro gerai. Stilloak nėra bandymas daryti viską apie finansus. Jis skirtas tam, kad mėnuo būtų aiškesnis ir lengviau valdomas.",
    layers: [
      {
        icon: WalletCards,
        title: "Biudžetai su spaudimo vaizdu",
        description: "Kategorijų limitai rodo ne tik kiek jau išleista, bet ir kur mėnuo pradeda spausti per stipriai.",
      },
      {
        icon: Target,
        title: "Tikslai su tikru tempu",
        description: "Tikslų progresas rodo ar dabartinis mėnesio ritmas realiai nuves iki plano, o ne tik kiek liko sukaupti.",
      },
      {
        icon: Mail,
        title: "Suvestinės, kurios turi vertę",
        description: "Savaitiniai ir mėnesiniai laiškai paaiškina skaičius paprasta kalba: riziką, progresą ir kitą veiksmą.",
      },
      {
        icon: ShieldCheck,
        title: "Privati nario erdvė",
        description: "Prisijungęs gauni tvarkingą archyvą, aiškią paskyrą ir vietą, kuri jaučiasi kaip produktas, ne tik panelė.",
      },
    ],
    workflowEyebrow: "Kaip tai veikia",
    workflowTitle: "Nuo kelių įrašų iki aiškesnio mėnesio sprendimo",
    workflowIntro:
      "Kelias turi būti labai paprastas: suvedi ar importuoji išlaidas, sistema parodo spaudimą, o tada grįžti prie realaus kito žingsnio.",
    workflowSteps: [
      {
        step: "01",
        title: "Sukeli mėnesio duomenis",
        description: "Gali vesti ranka, naudoti pastovias išlaidas arba įkelti banko CSV, kai nori susitvarkyti mėnesį greičiau.",
      },
      {
        step: "02",
        title: "Stilloak sutraukia vaizdą",
        description: "Vienoje vietoje pamatai biudžetų spaudimą, tikslų tempą, pastovias išlaidas ir svarbiausią riziką.",
      },
      {
        step: "03",
        title: "Gauni kryptį, ne triukšmą",
        description: "Sistema parodo ką verta daryti dabar ir palaiko ritmą per suvestines, archyvą ir nuoseklią nario zoną.",
      },
    ],
    plansEyebrow: "Aiškus kelias",
    plansTitle: "Nuo pirmo apsilankymo iki pilnos narystės",
    plansIntro:
      "Pagrindiniame puslapyje žmogus turi greitai suprasti, kur yra dabar ir ką atrakina narystė. Be nereikalingų nukrypimų, be papildomo pasakojimo sluoksnio.",
    membershipCards: [
      {
        label: "Guest",
        title: "Pamatai demonstraciją prieš pirkimą",
        description: "Prieš mokėdamas žmogus gali susipažinti su programos logika, dizainu ir tuo, kuo skiriasi narystės planai.",
      },
      {
        label: "Circle",
        title: "Pilna Savings Studio prieiga",
        description: "Tai pagrindinis planas tiems, kurie nori naudoti programą kiekvieną savaitę ir turėti visą aiškumo sluoksnį vienoje vietoje.",
      },
      {
        label: "Private",
        title: "Aukštesnis santykio sluoksnis",
        description: "Tiems, kurie nori daugiau premium jausmo, stipresnio nario sluoksnio ir dar brandesnės patirties aplink produktą.",
      },
    ],
    membershipPrimary: "Palyginti planus",
    membershipSecondary: "Atidaryti demonstraciją",
    closingEyebrow: "Pasiruošęs pradėti?",
    closingTitle: "Gali pradėti nuo demonstracijos arba iškart atrakinti narystę.",
    closingText:
      "Rinkai paruoštas produktas turi duoti aiškų pasirinkimą: pirmiausia pamatyti kaip veikia arba iškart eiti į Circle ir pradėti naudoti sistemą savo mėnesiui.",
    closingPrimary: "Peržiūrėti planus",
    closingSecondary: "Atidaryti Savings Studio demo",
  },
  en: {
    chip: "Private monthly control",
    title: "Stilloak helps people see the month clearly, protect the budget, and move toward goals with less friction.",
    intro:
      "It is a membership product for people who do not need another expense sheet. They need one calm system: where the month is under pressure, what still fits the goal, and what to do next.",
    primaryCta: "View membership",
    secondaryCta: "See the product",
    highlights: [
      "Category budgets with real monthly pressure",
      "Recurring spending, CSV import, and goals in one working space",
      "Weekly and monthly summaries that explain what to do next",
    ],
    stats: [
      { label: "Foundation", value: "Budgets", hint: "Not just totals, but limits with a usable monthly view." },
      { label: "Main result", value: "Clarity", hint: "See where money is actually leaking and where to correct the pace." },
      { label: "Automatic layer", value: "Summaries", hint: "The system brings people back to the most useful signal." },
    ],
    previewEyebrow: "Inside the product",
    previewTitle: "One focused screen instead of five scattered tools",
    previewText:
      "Savings Studio brings monthly pressure, recurring load, savings progress, and the next best move into one place the moment a member logs in.",
    previewRows: [
      ["Monthly pressure", "Food category is moving close to its limit"],
      ["Recurring load", "312 € / month"],
      ["Travel goal", "62% reached"],
      ["Next move", "Reduce small spending this week"],
    ],
    promiseEyebrow: "Launch-ready promise",
    promiseTitle: "The homepage should sell the product, not its backstory.",
    promiseText:
      "That is why the public page now leads directly into the demo, membership, and the practical control people gain after joining.",
    unlockEyebrow: "What you actually get",
    unlockList: [
      "The full Savings Studio working area",
      "A private archive for invoices, emails, and summaries",
      "A cleaner member experience from login to monthly review",
    ],
    layersEyebrow: "Product layers",
    layersTitle: "The key modules that make Stilloak useful every week",
    layersIntro:
      "A market-ready product should say clearly what it does well. Stilloak is not trying to be everything about personal finance. It exists to make the month clearer and easier to manage.",
    layers: [
      {
        icon: WalletCards,
        title: "Budgets with pressure signals",
        description: "Category limits show not only what has been spent, but where the month starts pressing too hard.",
      },
      {
        icon: Target,
        title: "Goals with real pace",
        description: "Goal progress shows whether the current monthly rhythm will actually get someone to the target.",
      },
      {
        icon: Mail,
        title: "Summaries that matter",
        description: "Weekly and monthly emails explain the numbers simply: risk, progress, and the next best action.",
      },
      {
        icon: ShieldCheck,
        title: "Private member space",
        description: "After login, members get a tidy archive, a clear account, and a space that feels like a product, not just a panel.",
      },
    ],
    workflowEyebrow: "How it works",
    workflowTitle: "From a few entries to a clearer monthly decision",
    workflowIntro:
      "The path should stay simple: add or import the data, let the system show where pressure builds, then return to the one action that matters most.",
    workflowSteps: [
      {
        step: "01",
        title: "Bring the month in",
        description: "People can add expenses manually, track recurring items, or import a bank CSV when they want to clean up the month faster.",
      },
      {
        step: "02",
        title: "Stilloak condenses the picture",
        description: "Budgets, goals, recurring load, and the biggest risk appear together in one place.",
      },
      {
        step: "03",
        title: "The next move becomes obvious",
        description: "The system points to what to do now and keeps the rhythm going with summaries, archives, and a calmer member flow.",
      },
    ],
    plansEyebrow: "A clear path",
    plansTitle: "From the first visit to full membership",
    plansIntro:
      "A homepage should help people understand where they are and what membership unlocks without unnecessary detours.",
    membershipCards: [
      {
        label: "Guest",
        title: "See the demo before paying",
        description: "Before buying, people can understand the product logic, the design, and what the membership tiers actually change.",
      },
      {
        label: "Circle",
        title: "Full Savings Studio access",
        description: "This is the core plan for people who want to use the program weekly and keep the full clarity layer in one place.",
      },
      {
        label: "Private",
        title: "A higher-touch member layer",
        description: "For people who want more premium feel, a stronger member relationship, and a deeper product experience.",
      },
    ],
    membershipPrimary: "Compare plans",
    membershipSecondary: "Open the demo",
    closingEyebrow: "Ready to begin?",
    closingTitle: "Start with the demo or unlock membership right away.",
    closingText:
      "A market-ready product should offer one clear choice: preview the experience first or go straight into Circle and start using the system for the month.",
    closingPrimary: "View membership",
    closingSecondary: "Open Savings Studio demo",
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
                  <p className="mt-3 font-display text-3xl font-bold">{item.value}</p>
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
                <span className="hero-chip">Circle access</span>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/66">{copy.previewText}</p>

              <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-white/95 p-2">
                <img
                  src="/story/members-dashboard-preview.svg"
                  alt="Stilloak member dashboard preview"
                  className="block w-full rounded-md"
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
