import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Compass,
  FileText,
  LockKeyhole,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const STRATEGY_STORAGE_KEY = "stilloak_private_business_strategy";
const OFFER_STORAGE_KEY = "stilloak_private_business_offer";
const ACTION_PLAN_STORAGE_KEY = "stilloak_private_business_action_plan";
const DECISION_STORAGE_KEY = "stilloak_private_business_decision";

const defaultStrategy = {
  monthlyGoal: "Aiškiau suformuluoti pagrindinį pasiūlymą ir pirmą kliento žingsnį.",
  keyOffer: "Premium narystės ar paslaugos pasiūlymas su aiškia verte ir ramiu sprendimo keliu.",
  clientSegment: "Sąmoningi kūrėjai, smulkūs verslai arba projektų savininkai, kuriems reikia struktūros.",
  growthAction: "Perrašyti pagrindinį CTA ir patikrinti, ar jis veda į vieną aiškų veiksmą.",
};

const defaultOffer = {
  audience: "Verslams ar projektų savininkams, kurie nori aiškesnio skaitmeninio augimo kelio.",
  problem: "Pasiūlymas atrodo geras, bet klientui ne visada aišku, kodėl verta rinktis dabar.",
  value: "Struktūruota erdvė, kuri padeda aiškiau parodyti vertę, pasitikėjimą ir kitą žingsnį.",
  nextStep: "Pakviesti klientą pasirinkti planą, peržiūrėti resursą arba pradėti aiškų pirmą veiksmą.",
};

const snapshotCards = [
  {
    title: "Verslo kryptis",
    text: "Matyk, kur fokusuoti dėmesį šį mėnesį.",
    detail: "Kryptis sujungiama su pasiūlymu, klientu ir vienu realiu augimo veiksmu.",
    icon: Compass,
  },
  {
    title: "Šio mėnesio prioritetas",
    text: "Laikyk svarbiausią sprendimą vienoje vietoje.",
    detail: "Mažiau triukšmo, daugiau aiškios vykdymo krypties.",
    icon: Target,
  },
  {
    title: "Pasiūlymo aiškumas",
    text: "Greitai pasitikrink, ar klientui aišku, ką jis gauna.",
    detail: "Keturi klausimai padeda sutvarkyti žinutę prieš komunikaciją.",
    icon: FileText,
  },
  {
    title: "Augimo veiksmai",
    text: "Vienas praktinis judesys svarbiau už dešimt idėjų.",
    detail: "Privati erdvė padeda išsirinkti, ką gerinti toliau.",
    icon: TrendingUp,
  },
];

const strategyFields = [
  {
    key: "monthlyGoal",
    label: "Pagrindinis šio mėnesio tikslas",
    placeholder: "Pvz., aiškiau pristatyti pagrindinį pasiūlymą",
  },
  {
    key: "keyOffer",
    label: "Svarbiausias pasiūlymas",
    placeholder: "Pvz., premium narystė, konsultacija, programa ar skaitmeninis produktas",
  },
  {
    key: "clientSegment",
    label: "Pagrindinis klientų segmentas",
    placeholder: "Pvz., smulkūs verslai, kūrėjai, studijos ar projektų savininkai",
  },
  {
    key: "growthAction",
    label: "Vienas augimo veiksmas",
    placeholder: "Pvz., patikrinti pagrindinį CTA arba perrašyti hero tekstą",
  },
];

const offerFields = [
  {
    key: "audience",
    title: "Kam skirta?",
    placeholder: "Aprašyk, kam šis pasiūlymas yra tinkamiausias.",
  },
  {
    key: "problem",
    title: "Kokią problemą sprendžia?",
    placeholder: "Įvardink vieną aiškią problemą arba įtampą.",
  },
  {
    key: "value",
    title: "Kokia pagrindinė vertė?",
    placeholder: "Aprašyk, ką klientas gauna praktiškai ar strategiškai.",
  },
  {
    key: "nextStep",
    title: "Koks kitas žingsnis klientui?",
    placeholder: "Įvardink vieną ramų, aiškų veiksmą.",
  },
];

const journeySteps = [
  {
    title: "Atranda",
    text: "Klientas pirmą kartą pamato pasiūlymą, turinį ar narystės idėją.",
    suggestion: "Sustiprink pirmą ekraną: vienas sakinys turi pasakyti, kam tai skirta ir kodėl verta likti.",
  },
  {
    title: "Supranta vertę",
    text: "Klientas vertina, ar pasiūlymas sprendžia jo realų poreikį.",
    suggestion: "Prie kainos ar plano pridėk aiškų vertės paaiškinimą, ne tik funkcijų sąrašą.",
  },
  {
    title: "Pasirenka planą",
    text: "Klientas lygina pasirinkimus ir ieško saugiausio sprendimo.",
    suggestion: "Padaryk skirtumus tarp lygių greitai nuskaitomus, ypač tarp Asmeninis ir Privatus verslas.",
  },
  {
    title: "Tampa nariu / klientu",
    text: "Po pasirinkimo svarbu, kad žmogus iškart rastų aiškų pirmą veiksmą.",
    suggestion: "Sukurk trumpą pirmos dienos orientyrą: ką atsidaryti, ką užpildyti, ką peržiūrėti.",
  },
];

const resources = [
  {
    id: "offer-structure",
    title: "Premium pasiūlymo struktūra",
    bullets: [
      "Vienu sakiniu įvardink, kam pasiūlymas skirtas.",
      "Prieš funkcijas parodyk sprendžiamą problemą.",
      "Atskirk bazinę vertę nuo premium vertės.",
      "Įtrauk vieną pasitikėjimo signalą prieš CTA.",
      "Užbaik vienu aiškiu kliento veiksmu.",
    ],
  },
  {
    id: "conversion-check",
    title: "Svetainės konversijos patikra",
    bullets: [
      "Patikrink, ar pirmas ekranas turi vieną pagrindinį CTA.",
      "Peržiūrėk, ar kainos ir planai lengvai palyginami telefone.",
      "Pašalink pasikartojančius ar konkuruojančius veiksmus.",
      "Pridėk ramų paaiškinimą, kas vyksta po paspaudimo.",
      "Įsitikink, kad svarbiausias tekstas netelpa tik į dekoratyvias korteles.",
    ],
  },
  {
    id: "journey-audit",
    title: "Kliento kelionės auditas",
    bullets: [
      "Užrašyk kelią nuo pirmo kontakto iki apmokėjimo.",
      "Pažymėk, kur klientui gali pritrūkti pasitikėjimo.",
      "Įvertink, ar kiekvienas puslapis turi vieną pagrindinę užduotį.",
      "Peržiūrėk, ar po pirkimo narys gauna aiškų pirmą žingsnį.",
    ],
  },
  {
    id: "growth-plan",
    title: "Skaitmeninio augimo planas",
    bullets: [
      "Pasirink vieną augimo kanalą artimiausioms 30 dienų.",
      "Susiek kanalą su vienu konkrečiu pasiūlymu.",
      "Numatyk, kokį turinį ar resursą paruoši pirmiausia.",
      "Po savaitės peržiūrėk ne tik skaičius, bet ir žinutės aiškumą.",
      "Neplėsk kanalų, kol pagrindinis pasiūlymas nėra aiškus.",
    ],
  },
  {
    id: "membership-optimization",
    title: "Narystės programos optimizavimas",
    bullets: [
      "Aiškiai parodyk, kuo skiriasi kiekvienas narystės lygis.",
      "Aukščiausią planą pristatyk kaip strateginę erdvę, ne kaip funkcijų priedą.",
      "Įtrauk pirmo mėnesio orientyrą naujam nariui.",
      "Paaiškink, kas yra netrukus, o kas jau pasiekiama šiandien.",
      "Sumažink perteklinę kalbą, kuri neskatina sprendimo.",
    ],
  },
];

const decisionFocusCards = [
  {
    id: "clarity",
    title: "Svetainės aiškumas",
    text: "Kai lankytojas supranta vertę per pirmas sekundes.",
    recommendation: "Perrašyk pirmą pasiūlymo sakinį taip, kad jame būtų auditorija, problema ir rezultatas.",
  },
  {
    id: "membership",
    title: "Narystės vertė",
    text: "Kai kiekvienas planas turi aiškią priežastį egzistuoti.",
    recommendation: "Palygink Bazinis, Asmeninis ir Privatus verslas pagal rezultatą, ne tik pagal funkcijas.",
  },
  {
    id: "products",
    title: "Produktų pateikimas",
    text: "Kai produktai atrodo kaip kuruotas kelias, o ne sąrašas.",
    recommendation: "Sujunk produktus į aiškias naudojimo situacijas ir prie kiekvieno pridėk konkretų kitą žingsnį.",
  },
  {
    id: "sales-path",
    title: "Pardavimo kelias",
    text: "Kai nuo susidomėjimo iki pasirinkimo lieka mažiau trinties.",
    recommendation: "Sutrumpink kelią iki apmokėjimo ir prie CTA paaiškink, kas atsitiks po paspaudimo.",
  },
  {
    id: "trust",
    title: "Klientų pasitikėjimas",
    text: "Kai aukštesnė kaina jaučiasi pagrįsta ir saugi.",
    recommendation: "Prie premium pasiūlymo pridėk konkretų procesą, aiškų rezultatą ir ramų saugumo signalą.",
  },
];

const recommendations = [
  {
    title: "Sustiprinti pagrindinį pasiūlymą",
    text: "Pirmas pasiūlymo sakinys turėtų aiškiai parodyti, kam skirta erdvė ir kokį sprendimą ji palengvina.",
  },
  {
    title: "Aiškiau parodyti narystės skirtumus",
    text: "Privatus verslas turi jaustis kaip strateginis lygis, o ne tiesiog ilgesnis funkcijų sąrašas.",
  },
  {
    title: "Patobulinti pirmą vartotojo kelionę",
    text: "Naujasis narys turėtų iškart matyti pirmą veiksmą, svarbiausią resursą ir mėnesio kryptį.",
  },
];

const actionItems = [
  "Aiškiai perrašyti pagrindinį pasiūlymą",
  "Sutvarkyti narystės skirtumus",
  "Patikrinti pagrindinį CTA",
  "Paruošti vieną naują resursą",
  "Peržiūrėti klientų kelionę",
];

const includedItems = [
  "Viskas iš Asmeninio plano",
  "Strateginė verslo erdvė",
  "Pasiūlymo aiškumo įrankiai",
  "Kliento kelionės peržiūra",
  "Premium verslo resursai",
  "Prioritetinė pagalba — netrukus",
  "Privačios rekomendacijos — netrukus",
];

const readStoredObject = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "");
    return parsed && typeof parsed === "object" ? { ...fallback, ...parsed } : fallback;
  } catch (_error) {
    return fallback;
  }
};

const readStoredActionPlan = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ACTION_PLAN_STORAGE_KEY) || "{}");
    return actionItems.reduce(
      (state, item) => ({
        ...state,
        [item]: Boolean(parsed[item]),
      }),
      {}
    );
  } catch (_error) {
    return {};
  }
};

const readStoredDecision = () => {
  if (typeof window === "undefined") {
    return "clarity";
  }

  const stored = window.localStorage.getItem(DECISION_STORAGE_KEY);
  return decisionFocusCards.some((card) => card.id === stored) ? stored : "clarity";
};

const FieldLabel = ({ children, detail }) => (
  <div className="space-y-1">
    <span className="text-sm font-semibold text-[rgb(var(--text))]">{children}</span>
    {detail && <p className="text-xs leading-5 text-muted">{detail}</p>}
  </div>
);

const SectionHeading = ({ eyebrow, title, text }) => (
  <div className="max-w-3xl">
    <span className="signal-pill">{eyebrow}</span>
    <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
    {text && <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{text}</p>}
  </div>
);

const PrivateBusinessPreview = () => (
  <section className="marketing-dark overflow-hidden rounded-lg p-6 sm:p-8 lg:p-10">
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <span className="hero-chip">Privatus verslas</span>
          <span className="hero-chip">Peržiūra</span>
          <span className="hero-chip">Užrakinta</span>
        </div>
        <h2 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          Privataus verslo erdvė
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
          Aukščiausio lygio strateginė darbo erdvė projektams, pasiūlymams, prioritetams ir skaitmeninio augimo
          sprendimams. Asmeninis planas mato tik šią peržiūrą.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {["Strategijos lenta", "Pasiūlymo aiškumas", "Premium resursai", "30 dienų planas"].map((item) => (
            <div key={item} className="metric-card flex items-center gap-3">
              <LockKeyhole size={16} className="shrink-0 text-white/58" />
              <span className="text-sm font-semibold text-white/78">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="metric-card p-6">
        <p className="text-xs font-semibold uppercase leading-5 text-white/52">aukščiausias lygis</p>
        <h3 className="mt-4 font-display text-3xl font-bold leading-tight">Verslo komandos režimas</h3>
        <p className="mt-4 text-sm leading-7 text-white/66">
          Privatus verslas prideda strateginį sluoksnį virš Asmeninio plano: pasiūlymo aiškumą, kliento kelionės
          peržiūrą ir aukštesnio lygio resursų struktūrą.
        </p>
        <Link to="/pricing" className="button-primary mt-6 w-full gap-2">
          Rinktis Privatų verslą
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  </section>
);

const PrivateBusinessWorkspacePage = ({ lockedPreview = false }) => {
  const [strategy, setStrategy] = useState(() =>
    lockedPreview ? defaultStrategy : readStoredObject(STRATEGY_STORAGE_KEY, defaultStrategy)
  );
  const [offer, setOffer] = useState(() =>
    lockedPreview ? defaultOffer : readStoredObject(OFFER_STORAGE_KEY, defaultOffer)
  );
  const [openResourceIds, setOpenResourceIds] = useState(() => new Set(["offer-structure"]));
  const [selectedDecisionId, setSelectedDecisionId] = useState(() => (lockedPreview ? "clarity" : readStoredDecision()));
  const [checkedActions, setCheckedActions] = useState(() => (lockedPreview ? {} : readStoredActionPlan()));

  useEffect(() => {
    if (!lockedPreview) {
      window.localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(strategy));
    }
  }, [lockedPreview, strategy]);

  useEffect(() => {
    if (!lockedPreview) {
      window.localStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify(offer));
    }
  }, [lockedPreview, offer]);

  useEffect(() => {
    if (!lockedPreview) {
      window.localStorage.setItem(DECISION_STORAGE_KEY, selectedDecisionId);
    }
  }, [lockedPreview, selectedDecisionId]);

  useEffect(() => {
    if (!lockedPreview) {
      window.localStorage.setItem(ACTION_PLAN_STORAGE_KEY, JSON.stringify(checkedActions));
    }
  }, [checkedActions, lockedPreview]);

  const selectedDecision = useMemo(
    () => decisionFocusCards.find((card) => card.id === selectedDecisionId) || decisionFocusCards[0],
    [selectedDecisionId]
  );

  const completedActions = Object.values(checkedActions).filter(Boolean).length;

  const handleStrategyChange = (field, value) => {
    if (lockedPreview) {
      return;
    }

    setStrategy((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleOfferChange = (field, value) => {
    if (lockedPreview) {
      return;
    }

    setOffer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleResource = (resourceId) => {
    setOpenResourceIds((current) => {
      const next = new Set(current);

      if (next.has(resourceId)) {
        next.delete(resourceId);
      } else {
        next.add(resourceId);
      }

      return next;
    });
  };

  const toggleAction = (item) => {
    if (lockedPreview) {
      return;
    }

    setCheckedActions((current) => ({
      ...current,
      [item]: !current[item],
    }));
  };

  if (lockedPreview) {
    return <PrivateBusinessPreview />;
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="marketing-dark overflow-hidden rounded-lg p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[1fr_0.82fr] xl:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {["Privatus verslas", "Aukščiausias planas", "Strateginė erdvė", "Prioritetinė prieiga"].map((chip) => (
                <span key={chip} className="hero-chip">
                  {chip}
                </span>
              ))}
            </div>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
              Privataus verslo erdvė
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-white/74 sm:text-lg">
              Privati strateginė erdvė projektams, pasiūlymams, prioritetams ir aukštesnio lygio skaitmeniniam
              augimui.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#strategijos-lenta" className="button-primary gap-2">
                Atnaujinti strategijos lentą
                <ArrowUpRight size={16} />
              </a>
              <a href="#verslo-resursai" className="hero-outline-button gap-2">
                Peržiūrėti verslo resursus
                <FileText size={16} />
              </a>
              <a href="#veiksmu-planas" className="hero-outline-button gap-2">
                Atidaryti 30 dienų planą
                <ClipboardList size={16} />
              </a>
            </div>
          </div>

          <div className="metric-card p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck size={22} className="mt-1 shrink-0 text-white/72" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase leading-5 text-white/52">lokali darbo erdvė</p>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight">Privatus strateginis kambarys</h2>
                <p className="mt-4 text-sm leading-7 text-white/66">
                  Strategijos, pasiūlymo ir 30 dienų plano įrašai saugomi tik šiame įrenginyje per localStorage.
                  Backend, Stripe ir narystės logika nekeičiama.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {snapshotCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className="marketing-card flex h-full min-h-[230px] flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "rgb(var(--surface-soft))", color: "rgb(var(--accent-strong))" }}
                >
                  <Icon size={20} />
                </div>
                <span className="signal-pill shrink-0">peržiūra</span>
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold leading-tight">{card.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[rgb(var(--text))]">{card.text}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{card.detail}</p>
            </article>
          );
        })}
      </section>

      <section id="strategijos-lenta" className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <div className="panel p-6 sm:p-8">
          <SectionHeading
            eyebrow="Strategijos lenta"
            title="Mėnesio kryptis vienoje vietoje"
            text="Užrašai čia veikia tik kaip lokali darbo erdvė. Jie nesiunčiami į backendą."
          />

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {strategyFields.map((field) => (
              <label key={field.key} className="block space-y-3">
                <FieldLabel>{field.label}</FieldLabel>
                <textarea
                  value={strategy[field.key]}
                  onChange={(event) => handleStrategyChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="textarea-field min-h-[130px]"
                />
              </label>
            ))}
          </div>
        </div>

        <aside className="surface-dark rounded-lg p-6 sm:p-8">
          <span className="hero-chip">Šio mėnesio strateginė kryptis</span>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight">Aiškus vykdymo rėmas</h2>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase leading-5 text-white/48">tikslas</p>
              <p className="mt-2 text-sm leading-7 text-white/74">{strategy.monthlyGoal}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase leading-5 text-white/48">pasiūlymas</p>
              <p className="mt-2 text-sm leading-7 text-white/74">{strategy.keyOffer}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase leading-5 text-white/48">klientas</p>
              <p className="mt-2 text-sm leading-7 text-white/74">{strategy.clientSegment}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase leading-5 text-white/48">augimo veiksmas</p>
              <p className="mt-2 text-sm leading-7 text-white/74">{strategy.growthAction}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="panel p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1fr]">
          <SectionHeading
            eyebrow="Pasiūlymo aiškumas"
            title="Mini rėmas premium pasiūlymui"
            text="Keturi klausimai padeda patikrinti, ar klientui aišku, kodėl verta rinktis."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {offerFields.map((field) => (
              <label key={field.key} className="block space-y-3">
                <FieldLabel>{field.title}</FieldLabel>
                <textarea
                  value={offer[field.key]}
                  onChange={(event) => handleOfferChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="textarea-field min-h-[126px]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-7 rounded-lg border p-5" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Pasiūlymo peržiūra</p>
              <p className="mt-1 text-xs leading-5 text-muted">Lokali santrauka pagal tavo užpildytus laukus.</p>
            </div>
            <span className="signal-pill shrink-0">lokali darbo erdvė</span>
          </div>
          <p className="mt-5 text-sm leading-7 text-muted">
            Šis pasiūlymas skirtas: <span className="font-semibold text-[rgb(var(--text))]">{offer.audience}</span>
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Jis sprendžia: <span className="font-semibold text-[rgb(var(--text))]">{offer.problem}</span>
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Pagrindinė vertė: <span className="font-semibold text-[rgb(var(--text))]">{offer.value}</span>
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Kitas žingsnis klientui: <span className="font-semibold text-[rgb(var(--text))]">{offer.nextStep}</span>
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Kliento kelionė"
          title="Keturi žingsniai iki aiškesnio sprendimo"
          text="Paprastas kelionės žemėlapis, skirtas patikrinti, kur klientui reikia daugiau aiškumo."
        />

        <div className="grid gap-4 lg:grid-cols-4">
          {journeySteps.map((step, index) => (
            <article key={step.title} className="marketing-card p-6">
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, rgb(var(--accent-strong)), rgb(var(--accent)))" }}
                >
                  {index + 1}
                </div>
                <Route size={18} className="text-muted" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold leading-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{step.text}</p>
              <div className="mt-5 border-t pt-4" style={{ borderColor: "rgb(var(--line) / 0.72)" }}>
                <p className="text-xs font-semibold uppercase leading-5 text-muted">praktinis patobulinimas</p>
                <p className="mt-2 text-sm leading-7 text-muted">{step.suggestion}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="verslo-resursai" className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Premium verslo resursai"
            title="Išskleidžiamos verslo darbo kortelės"
            text="Praktiniai rėmai sprendimams, pasiūlymams ir narystės augimui."
          />
          <span className="signal-pill w-fit">peržiūra · statiniai resursai</span>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {resources.map((resource) => {
            const isOpen = openResourceIds.has(resource.id);

            return (
              <article key={resource.id} className="rounded-lg border p-5" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
                <button
                  type="button"
                  onClick={() => toggleResource(resource.id)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-2xl font-bold leading-tight">{resource.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-muted">Atidaryk praktiniams patikros punktams.</span>
                  </span>
                  <ChevronDown
                    size={20}
                    className={`mt-1 shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "rgb(var(--accent-strong))" }}
                  />
                </button>

                {isOpen && (
                  <ul className="mt-5 space-y-3 border-t pt-5" style={{ borderColor: "rgb(var(--line) / 0.72)" }}>
                    {resource.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-7 text-muted">
                        <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
        <div className="panel p-6 sm:p-8">
          <SectionHeading
            eyebrow="Sprendimų kambarys"
            title="Pasirink, ką gerinti toliau"
            text="Aukštesnio lygio erdvė neturi versti daryti visko iš karto. Pasirink vieną kryptį."
          />

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {decisionFocusCards.map((card) => {
              const isSelected = selectedDecisionId === card.id;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedDecisionId(card.id)}
                  className={`rounded-lg border p-5 text-left transition ${
                    isSelected ? "bg-[rgb(var(--surface-soft))]" : "bg-[rgb(var(--surface))]"
                  }`}
                  style={{
                    borderColor: isSelected ? "rgb(var(--accent-strong) / 0.42)" : "rgb(var(--line) / 0.82)",
                  }}
                >
                  <span className="block text-lg font-semibold leading-tight">{card.title}</span>
                  <span className="mt-3 block text-sm leading-6 text-muted">{card.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="surface-dark rounded-lg p-6 sm:p-8">
          <span className="hero-chip">Rekomenduojamas kitas žingsnis</span>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight">{selectedDecision.title}</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">{selectedDecision.recommendation}</p>
          <p className="mt-6 text-xs font-semibold uppercase leading-5 text-white/48">
            Lokali darbo erdvė · automatinis backend vertinimas nepridėtas
          </p>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.82fr_1fr]">
        <div className="marketing-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <Sparkles size={22} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <div className="min-w-0">
              <span className="signal-pill">Prioritetinė pagalba</span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight">Prioritetinės pagalbos užklausos — netrukus</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Ši erdvė skirta aiškesniems klausimams, greitesniems sprendimams ir struktūruotai verslo krypčiai.
              </p>
              <p className="mt-5 text-xs font-semibold uppercase leading-5 text-muted">
                Nefiksuojama kaip reali pagalbos sistema · netrukus
              </p>
            </div>
          </div>
        </div>

        <div className="panel p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Privačios rekomendacijos"
              title="Trys ramūs aukštesnio lygio patobulinimai"
              text="Šios kortelės yra statinė peržiūra, kol dinaminės rekomendacijos dar neaktyvios."
            />
            <span className="signal-pill w-fit">Peržiūra · dinaminės rekomendacijos netrukus</span>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {recommendations.map((recommendation) => (
              <article key={recommendation.title} className="rounded-lg border p-5" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
                <BarChart3 size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <h3 className="mt-5 text-lg font-semibold leading-tight">{recommendation.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{recommendation.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="veiksmu-planas" className="grid gap-6 xl:grid-cols-[0.85fr_1fr]">
        <div className="surface-dark rounded-lg p-6 sm:p-8">
          <span className="hero-chip">30 dienų veiksmų planas</span>
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight">Penkios kryptys, vienas mėnuo</h2>
          <p className="mt-5 text-sm leading-7 text-white/72">
            Planas pildomas lokaliai. Pažymėjimai lieka šiame įrenginyje ir nekeičia paskyros duomenų.
          </p>
          <div className="mt-7 rounded-lg border border-white/10 p-5">
            <p className="text-xs font-semibold uppercase leading-5 text-white/48">progresas</p>
            <p className="mt-3 font-display text-4xl font-bold">
              {completedActions}/{actionItems.length}
            </p>
          </div>
        </div>

        <div className="panel p-6 sm:p-8">
          <div className="space-y-3">
            {actionItems.map((item) => {
              const isChecked = Boolean(checkedActions[item]);

              return (
                <label
                  key={item}
                  className="flex cursor-pointer items-start gap-4 rounded-lg border px-4 py-4 text-sm leading-6 text-muted"
                  style={{ borderColor: "rgb(var(--line) / 0.82)" }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAction(item)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]"
                  />
                  <span className={isChecked ? "line-through opacity-70" : ""}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.76fr]">
        <div className="panel p-6 sm:p-8">
          <SectionHeading
            eyebrow="Įtraukta į Privatus verslas"
            title="Aukščiausias StillOak Studio nario sluoksnis"
            text="Privatus verslas aiškiai stovi virš Asmeninio plano: daugiau strategijos, verslo resursų ir premium sprendimų erdvės."
          />

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {includedItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
                <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                <span className="text-sm leading-6 text-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="marketing-dark rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Briefcase size={22} className="text-white/72" />
            <span className="hero-chip">aukščiausias planas</span>
          </div>
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight">Tęsk kaip privačioje strategijos studijoje</h2>
          <p className="mt-5 text-sm leading-7 text-white/70">
            Čia nėra atnaujinimo kalbos, nes tai jau aukščiausias planas. Naudok veiksmus kaip trumpus kelius į svarbiausias
            darbo zonas.
          </p>
          <div className="mt-7 grid gap-3">
            <a href="#strategijos-lenta" className="button-primary gap-2">
              Atnaujinti strategijos lentą
              <Target size={16} />
            </a>
            <a href="#verslo-resursai" className="hero-outline-button gap-2">
              Peržiūrėti verslo resursus
              <Users size={16} />
            </a>
            <a href="#veiksmu-planas" className="hero-outline-button gap-2">
              Atidaryti 30 dienų planą
              <ClipboardList size={16} />
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default PrivateBusinessWorkspacePage;
