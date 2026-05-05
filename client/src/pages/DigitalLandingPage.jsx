import { ArrowRight, Download, LayoutPanelTop, Palette, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ritualCards = [
  {
    icon: LayoutPanelTop,
    title: "Prieiga be laukimo",
    description: "Jokio siuntimo ar logistikos. Po apmokėjimo failas atsiranda tavo paskyroje.",
  },
  {
    icon: Palette,
    title: "Sukurta vientisam skoniui",
    description: "Spausdinamas menas, interjero gidai ir planavimo įrankiai dera su ramiu Stilloak tonu.",
  },
  {
    icon: Sparkles,
    title: "Aiškus skaitmeninis pasiūlymas",
    description: "Skaitmeninis sluoksnis leidžia kurti vertingus rinkinius be fizinio pristatymo triukšmo.",
  },
];

const steps = [
  {
    step: "01",
    title: "Rinkis",
    description: "Pasirink PDF gidą, spausdinamą rinkinį ar planavimo įrankį, kuris atitinka tavo ritmą.",
  },
  {
    step: "02",
    title: "Apmokėk",
    description: "Patvirtink pirkimą per tą patį saugų apmokėjimo kelią kaip ir visoje parduotuvėje.",
  },
  {
    step: "03",
    title: "Atsisiųsk",
    description: "Failas atsiranda tavo profilyje po apmokėjimo ir lieka pasiekiamas, kai jo prireikia.",
  },
];

const teaserPanels = [
  {
    eyebrow: "Planuojamas atidarymas",
    title: "Spausdinami rinkiniai ir PDF gidai",
    text: "Pirmas atidarymas kuruojamas kaip viena aiški lentyna, o ne atsitiktiniai pavieniai produktai.",
  },
  {
    eyebrow: "Kas bus viduje",
    title: "Plakatų setai, kambarių gidai, planavimo įrankiai",
    text: "Kolekcija kuriama kaip redakcinis, sąmoningas sluoksnis su mažiau, bet stipresnių produktų.",
  },
  {
    eyebrow: "Dabartinė būsena",
    title: "Laikinai rodoma atidarymo puslapyje",
    text: "Kol failai, rinkiniai ir atidarymo kelias dar ruošiami, skaitmeninis sluoksnis lieka peržiūroje.",
  },
];

const teaserProducts = [
  "Calm Home Poster Bundle",
  "The Atelier Living Room Guide",
  "Sunday Reset Ritual Planner",
];

const launchSignals = [
  "Apsaugota atsisiuntimo prieiga paskyroje",
  "Rinkinių logika didesnei vertei",
  "Aiškesnė atidarymo seka prieš atveriant lentyną",
];

const DigitalLandingPage = () => {
  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-between">
            <div>
              <span className="hero-chip">Skaitmeninė kolekcija</span>
              <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.92] sm:text-6xl lg:text-7xl">
                Skaitmeniniai produktai ramesnėms erdvėms ir aiškesnėms rutinoms.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Ši kolekcija skirta PDF gidams, spausdinamiems rinkiniams ir planavimo įrankiams, kurie jaučiasi
                kaip natūrali Stilloak tąsa, o ne atsitiktinis priedas prie kolekcijos.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
                Pilna skaitmeninė kolekcija šiuo metu perkelta į atskirą <span className="font-semibold text-white/80">Netrukus</span> sluoksnį,
                kad atsidarytų tik tada, kai visa patirtis bus iki galo paruošta.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/launch-soon" className="button-primary gap-2">
                  Peržiūrėti atidarymą
                  <ArrowRight size={16} />
                </Link>
                <Link to="/pricing" className="hero-outline-button">
                  Peržiūrėti narystę
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Formatas</p>
                <p className="mt-3 font-display text-3xl font-bold">PDF</p>
                <p className="mt-2 text-sm text-white/60">Gidai, planavimo įrankiai ir skaitmeniniai rinkiniai.</p>
              </div>
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Prieiga</p>
                <p className="mt-3 font-display text-3xl font-bold">Iškart</p>
                <p className="mt-2 text-sm text-white/60">Atsisiuntimai atsiranda pirkėjo profilyje po apmokėjimo.</p>
              </div>
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Kryptis</p>
                <p className="mt-3 font-display text-3xl font-bold">Atrinkta</p>
                <p className="mt-2 text-sm text-white/60">Sukurta taip, kad jaustųsi ramu, šilta ir sąmoninga.</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="hero-screen relative w-full max-w-[620px]">
              <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Skaitmeninė kolekcija</p>
                  <p className="text-xs text-white/50">Plakatai, gidai, planavimo įrankiai</p>
                </div>
                <span className="hero-chip">Iškart pasiekiama</span>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Atidarymo būsena</p>
                  <h3 className="mt-4 font-display text-3xl font-bold">Lentyna kol kas rodoma kaip peržiūra</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    Užuot rodžius pusiau paruoštus produktus, skaitmeninis sluoksnis laikinai lieka kuruotoje peržiūroje.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <p className="text-xs text-white/45">Būsena</p>
                      <p className="mt-2 font-display text-2xl font-bold">Netrukus</p>
                    </div>
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <p className="text-xs text-white/45">Tikslas</p>
                      <p className="mt-2 font-display text-2xl font-bold">Stipresnis pirmas leidimas</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Kas ruošiama</p>
                    <div className="mt-4 space-y-3">
                      {launchSignals.map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm text-white/74">
                          <Download size={16} className="mt-0.5" style={{ color: "rgb(var(--accent-strong))" }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Peržiūros pavadinimai</p>
                    <div className="mt-4 grid gap-3">
                      {teaserProducts.map((product, index) => (
                        <div
                          key={product}
                          className="flex items-center justify-between rounded-[18px] bg-white/4 px-4 py-3 text-sm"
                        >
                          <span>{product}</span>
                          <span className="text-white/45">0{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute -right-3 top-10 hidden h-28 w-28 rounded-full blur-3xl lg:block"
              style={{ backgroundColor: "rgb(var(--accent) / 0.18)" }}
            />
          </div>
        </div>
      </section>

      <section className="public-section grid gap-4 sm:grid-cols-3">
        {ritualCards.map((card) => (
          <div key={card.title} className="marketing-mini-card">
            <card.icon size={22} style={{ color: "rgb(var(--accent))" }} />
            <h2 className="mt-5 font-display text-2xl font-bold">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
          </div>
        ))}
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">Kol kas peržiūra</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Skaitmeninė lentyna dabar veikia kaip pažadas, ne kaip gyvas katalogas.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Kol produktai dar ruošiami, ši sekcija nukreipia į atidarymo būseną ir nekuria pusiau užbaigto pirkimo kelio.
            </p>
          </div>
          <Link to="/launch-soon" className="button-secondary">
            Peržiūrėti atidarymą
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {teaserPanels.map((panel) => (
            <div key={panel.title} className="marketing-card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{panel.eyebrow}</p>
              <h3 className="mt-4 font-display text-3xl font-bold text-[rgb(28,24,20)]">{panel.title}</h3>
              <p className="mt-4 text-base leading-7 text-muted">{panel.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="eyebrow">Kas atsidarys vėliau</span>
              <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Pirmas leidimas planuojamas kaip viena aiškesnė atranka.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                Tikslas - atsidaryti su stipresniais rinkiniais, aiškesniu produktų pateikimu ir geresne atsisiuntimo patirtimi.
              </p>
            </div>
            <div className="grid gap-3">
              {teaserProducts.map((product) => (
                <div
                  key={product}
                  className="rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-4 text-sm text-[rgb(98,87,74)]"
                >
                  {product}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="text-center">
          <span className="eyebrow">Kaip tai veiks</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Švaresnis pirkimo kelias skaitmeniniams produktams.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">
            Visa patirtis remiasi tuo pačiu saugiu apmokėjimu, bet rezultatas pirkėjui daug greitesnis: jokios logistikos,
            tik iškart atrakintas turinys paskyroje.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="mx-auto timeline-dot">{step.step}</div>
              <h3 className="mt-5 font-display text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <span className="hero-chip">Rinkinių potencialas</span>
            <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">
              Čia skaitmeniniai rinkiniai pradeda kurti daugiau vertės.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/68">
              Skaitmeniniai produktai leidžia pasiūlyti ne tik atskirą failą, bet ir aiškią patirtį:
              plakatai, interjero gidas ir planavimo įrankis viename ramesniame pakete.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">Rinkinio idėja</p>
              <h3 className="mt-4 font-display text-3xl font-bold">Home Edit Bundle</h3>
              <p className="mt-3 text-sm leading-6 text-white/74">
                Plakatų rinkinys ir svetainės gidas, sujungti į vieną aiškų kambario atnaujinimą.
              </p>
              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="font-semibold text-[rgb(227,196,149)]">Netrukus</p>
                <span className="text-sm font-medium text-white/72">Peržiūra</span>
              </div>
            </div>

            <div className="rounded-[24px] bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">Rinkinio idėja</p>
              <h3 className="mt-4 font-display text-3xl font-bold">Calm Living Bundle</h3>
              <p className="mt-3 text-sm leading-6 text-white/74">
                Plakatų rinkinys, gidas ir planavimo įrankis kaip pilnesnis skaitmeninis gyvenimo ritmo sluoksnis.
              </p>
              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="font-semibold text-[rgb(227,196,149)]">Netrukus</p>
                <span className="text-sm font-medium text-white/72">Peržiūra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-6 text-[rgb(29,24,19)] sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
                Paruošta atidarymui
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold">Atverk skaitmeninę lentyną ir augink ją produktas po produkto.</h3>
              <p className="mt-2 text-sm text-[rgb(98,87,74)]">
                Pradėk nuo trijų stiprių produktų, tada plėsk į teminius rinkinius ir kuruotas kolekcijas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Link to="/launch-soon" className="button-primary">
                  Peržiūrėti atidarymą
                </Link>
              <Link to="/admin/products" className="button-secondary">
                Valdyti kolekciją
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DigitalLandingPage;
