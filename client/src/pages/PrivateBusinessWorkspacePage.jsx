import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Building2,
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

const BUSINESS_PROFILE_STORAGE_KEY = "stilloak_private_business_profile";
const STRATEGY_STORAGE_KEY = "stilloak_private_business_strategy";
const OFFER_STORAGE_KEY = "stilloak_private_business_offer";
const DECISION_STORAGE_KEY = "stilloak_private_business_decision";
const CLARITY_AUDIT_STORAGE_KEY = "stilloak_private_business_clarity_audit";
const GROWTH_ROADMAP_STORAGE_KEY = "stilloak_private_business_growth_roadmap";

const defaultBusinessProfile = {
  businessName: "",
  industry: "",
  targetClient: "",
  coreOffer: "",
  monthlyGoal: "",
};

const defaultStrategy = {
  monthlyGoal: "Aiškiau suformuluoti pagrindinį pasiūlymą ir pirmą kliento žingsnį.",
  keyOffer: "Premium narystės ar paslaugos pasiūlymas su aiškia verte ir ramiu sprendimo keliu.",
  clientSegment: "Sąmoningi kūrėjai, smulkūs verslai arba projektų savininkai, kuriems reikia struktūros.",
  growthAction: "Perrašyti pagrindinį CTA ir patikrinti, ar jis veda į vieną aiškų veiksmą.",
};

const defaultOffer = {
  audience: "",
  problem: "",
  value: "",
  difference: "",
  nextStep: "",
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

const businessProfileFields = [
  {
    key: "businessName",
    label: "Verslo pavadinimas",
    placeholder: "Pvz., Stilloak Studio",
    compact: true,
  },
  {
    key: "industry",
    label: "Veiklos sritis",
    placeholder: "Pvz., konsultacijos, narystė, dizainas, el. prekyba",
    compact: true,
  },
  {
    key: "targetClient",
    label: "Tikslinis klientas",
    placeholder: "Aprašyk, kas yra geriausias klientas šiam pasiūlymui.",
  },
  {
    key: "coreOffer",
    label: "Pagrindinis pasiūlymas",
    placeholder: "Įvardink svarbiausią paslaugą, produktą, narystę ar nario erdvę.",
  },
  {
    key: "monthlyGoal",
    label: "Pagrindinis tikslas šį mėnesį",
    placeholder: "Pvz., aiškiau pristatyti pasiūlymą ir gauti daugiau kokybiškų užklausų.",
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
    placeholder: "Pvz., premium narystė, konsultacija, nario erdvė ar skaitmeninis produktas",
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
    title: "Kokią vertę suteikia?",
    placeholder: "Aprašyk, ką klientas gauna praktiškai ar strategiškai.",
  },
  {
    key: "difference",
    title: "Kuo skiriasi nuo kitų?",
    placeholder: "Įrašyk, kuo pasiūlymas jaučiasi aiškesnis, ramesnis ar vertingesnis.",
  },
  {
    key: "nextStep",
    title: "Koks kitas žingsnis klientui?",
    placeholder: "Įvardink vieną ramų, aiškų veiksmą.",
  },
];

const websiteAuditItems = [
  {
    id: "first-screen",
    title: "Pirmas sakinys aiškiai pasako vertę",
    text: "Lankytojas iš karto supranta, kokį rezultatą ar pokytį siūlai.",
  },
  {
    id: "main-cta",
    title: "Pagrindinis CTA matomas",
    text: "Svarbiausias veiksmas yra lengvai randamas ir nekonkuruoja su kitais kvietimais.",
  },
  {
    id: "plan-difference",
    title: "Narystės / paslaugų planai aiškiai skiriasi",
    text: "Klientas supranta, kodėl vienas planas ar paslauga verta daugiau nei kita.",
  },
  {
    id: "trust-signal",
    title: "Yra pasitikėjimo tekstas",
    text: "Matomas procesas, saugumo sakinys, patirtis arba paaiškinimas, kas vyksta toliau.",
  },
  {
    id: "mobile-scan",
    title: "Mobilus vaizdas atrodo tvarkingai",
    text: "Tekstai, mygtukai ir kainos telpa be horizontalaus slinkimo ar susigrūdimo.",
  },
  {
    id: "next-step",
    title: "Klientas supranta kitą žingsnį",
    text: "Po pasiūlymo aišku, ar reikia pirkti, registruotis, rašyti ar peržiūrėti detales.",
  },
  {
    id: "payment-trust",
    title: "Kontaktas / apmokėjimas atrodo patikimai",
    text: "Kontaktų, užklausos ar apmokėjimo vieta atrodo saugi, aiški ir profesionali.",
  },
];

const growthRoadmapPhases = [
  {
    id: "week-1",
    label: "Week 1",
    title: "Aiškumas",
    focus: "Sutvarkyk pagrindinę žinutę, kad klientas greitai suprastų vertę.",
    actions: [
      { id: "w1-offer", text: "Perrašyti pagrindinį pasiūlymą" },
      { id: "w1-cta", text: "Patikrinti pagrindinį CTA" },
      { id: "w1-client", text: "Aprašyti tikslinį klientą" },
    ],
  },
  {
    id: "week-2",
    label: "Week 2",
    title: "Pasiūlymas",
    focus: "Sustiprink kainodarą, planų skirtumus ir pasitikėjimo pagrindą.",
    actions: [
      { id: "w2-pricing", text: "Sutvarkyti kainodarą" },
      { id: "w2-value", text: "Aiškiai atskirti planų vertę" },
      { id: "w2-trust", text: "Pridėti pasitikėjimo tekstą" },
    ],
  },
  {
    id: "week-3",
    label: "Week 3",
    title: "Pardavimas",
    focus: "Paruošk vieną aiškią žinutę, turinio veiksmą ir saugų sprendimo kelią.",
    actions: [
      { id: "w3-message", text: "Paruošti vieną pardavimo žinutę" },
      { id: "w3-content", text: "Sukurti vieną turinio įrašą" },
      { id: "w3-checkout", text: "Patikrinti checkout / kontaktą" },
    ],
  },
  {
    id: "week-4",
    label: "Week 4",
    title: "Optimizavimas",
    focus: "Peržiūrėk rezultatus, pašalink trintį ir pasiruošk kitam mėnesiui.",
    actions: [
      { id: "w4-results", text: "Peržiūrėti rezultatus" },
      { id: "w4-weaknesses", text: "Pašalinti silpnas vietas" },
      { id: "w4-next-month", text: "Suplanuoti kitą mėnesį" },
    ],
  },
];

const websiteAuditItemIds = websiteAuditItems.map((item) => item.id);
const growthRoadmapActionIds = growthRoadmapPhases.flatMap((phase) => phase.actions.map((action) => action.id));

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
    suggestion: "Padaryk skirtumus tarp lygių greitai nuskaitomus, ypač tarp Asmeninis ir Verslas.",
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
    title: "Narystės erdvės optimizavimas",
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
    recommendation: "Palygink Demo versiją, Asmeninis ir Verslas pagal rezultatą, ne tik pagal funkcijas.",
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
    text: "Verslo planas turi jaustis kaip strateginis lygis, o ne tiesiog ilgesnis funkcijų sąrašas.",
  },
  {
    title: "Patobulinti pirmą vartotojo kelionę",
    text: "Naujasis narys turėtų iškart matyti pirmą veiksmą, svarbiausią resursą ir mėnesio kryptį.",
  },
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

const readStoredBusinessProfile = () => {
  const stored = readStoredObject(BUSINESS_PROFILE_STORAGE_KEY, defaultBusinessProfile);

  return {
    businessName: stored.businessName || "",
    industry: stored.industry || stored.businessType || "",
    targetClient: stored.targetClient || stored.audience || "",
    coreOffer: stored.coreOffer || "",
    monthlyGoal: stored.monthlyGoal || stored.growthGoal || "",
  };
};

const readStoredOffer = () => {
  const stored = readStoredObject(OFFER_STORAGE_KEY, defaultOffer);

  return {
    audience: stored.audience || "",
    problem: stored.problem || "",
    value: stored.value || "",
    difference: stored.difference || stored.proof || "",
    nextStep: stored.nextStep || "",
  };
};

const readStoredBooleanMap = (key, ids) => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    return ids.reduce(
      (state, id) => ({
        ...state,
        [id]: Boolean(parsed[id]),
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
  <div className="min-w-0 space-y-1">
    <span className="block break-words text-sm font-semibold text-[rgb(var(--text))]">{children}</span>
    {detail && <p className="text-xs leading-5 text-muted">{detail}</p>}
  </div>
);

const SectionHeading = ({ eyebrow, title, text }) => (
  <div className="min-w-0 max-w-3xl">
    <span className="signal-pill">{eyebrow}</span>
    <h2 className="mt-4 break-words font-display text-2xl font-bold leading-tight sm:text-4xl">{title}</h2>
    {text && <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{text}</p>}
  </div>
);

const PrivateBusinessPreview = () => (
  <section className="member-workspace member-executive-surface overflow-hidden rounded-lg p-5 sm:p-8 lg:p-10">
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.78fr] lg:items-end">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <span className="hero-chip">Verslas</span>
          <span className="hero-chip">Peržiūra</span>
          <span className="hero-chip">Užrakinta</span>
        </div>
        <h2 className="mt-6 max-w-3xl break-words font-display text-4xl font-bold leading-tight sm:text-5xl">
          Verslo erdvė
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

      <div className="metric-card p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase leading-5 text-white/52">aukščiausias lygis</p>
        <h3 className="mt-4 break-words font-display text-3xl font-bold leading-tight">Verslo komandos režimas</h3>
        <p className="mt-4 text-sm leading-7 text-white/66">
          Verslo planas prideda strateginį sluoksnį virš Asmeninio plano: pasiūlymo aiškumą, kliento kelionės
          peržiūrą ir aukštesnio lygio resursų struktūrą.
        </p>
        <Link to="/pricing" className="button-primary mt-6 w-full gap-2">
          Pasirinkti Verslas
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  </section>
);

const PrivateBusinessWorkspacePage = ({ lockedPreview = false }) => {
  const [businessProfile, setBusinessProfile] = useState(() =>
    lockedPreview ? defaultBusinessProfile : readStoredBusinessProfile()
  );
  const [strategy, setStrategy] = useState(() =>
    lockedPreview ? defaultStrategy : readStoredObject(STRATEGY_STORAGE_KEY, defaultStrategy)
  );
  const [offer, setOffer] = useState(() => (lockedPreview ? defaultOffer : readStoredOffer()));
  const [offerStatusMessage, setOfferStatusMessage] = useState("");
  const [openResourceIds, setOpenResourceIds] = useState(() => new Set(["offer-structure"]));
  const [selectedDecisionId, setSelectedDecisionId] = useState(() => (lockedPreview ? "clarity" : readStoredDecision()));
  const [checkedAuditItems, setCheckedAuditItems] = useState(() =>
    lockedPreview ? {} : readStoredBooleanMap(CLARITY_AUDIT_STORAGE_KEY, websiteAuditItemIds)
  );
  const [checkedRoadmapActions, setCheckedRoadmapActions] = useState(() =>
    lockedPreview ? {} : readStoredBooleanMap(GROWTH_ROADMAP_STORAGE_KEY, growthRoadmapActionIds)
  );

  useEffect(() => {
    if (!lockedPreview) {
      window.localStorage.setItem(BUSINESS_PROFILE_STORAGE_KEY, JSON.stringify(businessProfile));
    }
  }, [businessProfile, lockedPreview]);

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
      window.localStorage.setItem(CLARITY_AUDIT_STORAGE_KEY, JSON.stringify(checkedAuditItems));
    }
  }, [checkedAuditItems, lockedPreview]);

  useEffect(() => {
    if (!lockedPreview) {
      window.localStorage.setItem(GROWTH_ROADMAP_STORAGE_KEY, JSON.stringify(checkedRoadmapActions));
    }
  }, [checkedRoadmapActions, lockedPreview]);

  const selectedDecision = useMemo(
    () => decisionFocusCards.find((card) => card.id === selectedDecisionId) || decisionFocusCards[0],
    [selectedDecisionId]
  );

  const businessProfileSummary = useMemo(
    () => [
      {
        label: "Verslo pavadinimas",
        value: businessProfile.businessName.trim(),
        placeholder: "Pavadinimas dar neįrašytas.",
      },
      {
        label: "Veiklos sritis",
        value: businessProfile.industry.trim(),
        placeholder: "Veiklos sritis padės tiksliau formuoti pasiūlymą.",
      },
      {
        label: "Tikslinis klientas",
        value: businessProfile.targetClient.trim(),
        placeholder: "Aprašyk, kam šis verslas turi būti aiškiausias.",
      },
      {
        label: "Pagrindinis pasiūlymas",
        value: businessProfile.coreOffer.trim(),
        placeholder: "Čia atsiras svarbiausias pasiūlymas.",
      },
      {
        label: "Mėnesio tikslas",
        value: businessProfile.monthlyGoal.trim(),
        placeholder: "Pasirink vieną šio mėnesio verslo prioritetą.",
      },
    ],
    [businessProfile]
  );

  const completedBusinessProfileFields = businessProfileSummary.filter((item) => item.value).length;
  const businessNameForPreview = businessProfile.businessName.trim() || "Tavo verslas";
  const targetClientForPreview = offer.audience.trim() || businessProfile.targetClient.trim() || "tiksliniam klientui";
  const problemForPreview = offer.problem.trim() || "aiškiai suprasti, kodėl verta rinktis";
  const valueForPreview = offer.value.trim() || businessProfile.coreOffer.trim() || "aiškesnį sprendimo kelią";
  const differenceForPreview = offer.difference.trim() || "ramiu, struktūruotu ir premium procesu";
  const nextStepForPreview = offer.nextStep.trim() || "žengti aiškų kitą žingsnį";

  const generatedOfferOutputs = useMemo(
    () => [
      {
        title: "Trumpas sakinys svetainei",
        text: `${businessNameForPreview} padeda ${targetClientForPreview} ${problemForPreview} ir suteikia ${valueForPreview}.`,
      },
      {
        title: "Hero sekcijos tekstas",
        text: `Aiškesnis kelias ${targetClientForPreview}. Kai reikia ${problemForPreview}, ${businessNameForPreview} suteikia ${valueForPreview} ir išsiskiria ${differenceForPreview}.`,
      },
      {
        title: "CTA pasiūlymas",
        text: `Pradėti nuo: ${nextStepForPreview}.`,
      },
      {
        title: "Pardavimo žinutė",
        text: `Jei šiuo metu svarbu ${problemForPreview}, ${businessNameForPreview} gali padėti per ${valueForPreview}. Pasiūlymas skirtas ${targetClientForPreview}, o pagrindinis skirtumas yra ${differenceForPreview}. Kitas žingsnis: ${nextStepForPreview}.`,
      },
    ],
    [businessNameForPreview, differenceForPreview, nextStepForPreview, problemForPreview, targetClientForPreview, valueForPreview]
  );

  const generatedOfferText = useMemo(
    () => generatedOfferOutputs.map((output) => `${output.title}\n${output.text}`).join("\n\n"),
    [generatedOfferOutputs]
  );

  const offerClaritySignals = useMemo(
    () => [
      { label: "Auditorija", complete: Boolean(offer.audience.trim() || businessProfile.targetClient.trim()) },
      { label: "Problema", complete: Boolean(offer.problem.trim()) },
      { label: "Vertė", complete: Boolean(offer.value.trim() || businessProfile.coreOffer.trim()) },
      { label: "Skirtumas", complete: Boolean(offer.difference.trim()) },
      { label: "Kitas žingsnis", complete: Boolean(offer.nextStep.trim()) },
    ],
    [businessProfile.coreOffer, businessProfile.targetClient, offer]
  );

  const completedOfferSignals = offerClaritySignals.filter((signal) => signal.complete).length;
  const completedAuditItems = Object.values(checkedAuditItems).filter(Boolean).length;
  const completedRoadmapActions = Object.values(checkedRoadmapActions).filter(Boolean).length;

  const handleBusinessProfileChange = (field, value) => {
    if (lockedPreview) {
      return;
    }

    setBusinessProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

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
    setOfferStatusMessage("");
  };

  const handleSaveOffer = () => {
    if (lockedPreview || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify(offer));
    setOfferStatusMessage("Pasiūlymas išsaugotas.");
  };

  const handleCopyOffer = async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      if (window.navigator?.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(generatedOfferText);
      } else {
        const textarea = window.document.createElement("textarea");
        textarea.value = generatedOfferText;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        window.document.body.appendChild(textarea);
        textarea.select();
        window.document.execCommand("copy");
        window.document.body.removeChild(textarea);
      }

      setOfferStatusMessage("Pasiūlymas nukopijuotas.");
    } catch (_error) {
      setOfferStatusMessage("Nepavyko nukopijuoti teksto.");
    }
  };

  const handleClearOffer = () => {
    if (lockedPreview) {
      return;
    }

    setOffer(defaultOffer);
    setOfferStatusMessage("");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(OFFER_STORAGE_KEY);
    }
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

  const toggleAuditItem = (itemId) => {
    if (lockedPreview) {
      return;
    }

    setCheckedAuditItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  };

  const toggleRoadmapAction = (actionId) => {
    if (lockedPreview) {
      return;
    }

    setCheckedRoadmapActions((current) => ({
      ...current,
      [actionId]: !current[actionId],
    }));
  };

  if (lockedPreview) {
    return <PrivateBusinessPreview />;
  }

  return (
    <div className="member-workspace member-workspace-private space-y-6 pb-10 sm:space-y-8">
      <section className="member-executive-surface overflow-hidden rounded-lg p-5 sm:p-8 lg:p-12">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.72fr] xl:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {["Verslas", "Aukščiausias planas", "Strateginė erdvė", "Prioritetinė prieiga"].map((chip) => (
                <span key={chip} className="hero-chip">
                  {chip}
                </span>
              ))}
            </div>
            <h1 className="mt-7 max-w-4xl break-words font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              Verslo erdvė
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/74 sm:text-lg">
              Privati strateginė erdvė projektams, pasiūlymams, prioritetams ir aukštesnio lygio skaitmeniniam
              augimui.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <a href="#verslo-profilis" className="button-primary w-full gap-2 sm:w-auto">
                Atnaujinti verslo profilį
                <Building2 size={16} />
              </a>
              <a href="#strategijos-lenta" className="hero-outline-button w-full gap-2 sm:w-auto">
                Strategijos lenta
                <Target size={16} />
              </a>
              <a href="#verslo-resursai" className="hero-outline-button w-full gap-2 sm:w-auto">
                Peržiūrėti verslo resursus
                <FileText size={16} />
              </a>
              <a href="#veiksmu-planas" className="hero-outline-button w-full gap-2 sm:w-auto">
                Atidaryti 30 dienų planą
                <ClipboardList size={16} />
              </a>
            </div>
          </div>

          <div className="metric-card p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck size={22} className="mt-1 shrink-0 text-white/72" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase leading-5 text-white/52">lokali darbo erdvė</p>
                <h2 className="mt-4 break-words font-display text-3xl font-bold leading-tight">Verslo strateginis kambarys</h2>
                <p className="mt-4 text-sm leading-7 text-white/66">
                  Strategijos, pasiūlymo ir 30 dienų plano įrašai saugomi tik šiame įrenginyje per localStorage.
                  Backend, Stripe ir narystės logika nekeičiama.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {snapshotCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className="member-value-card flex h-full min-h-[210px] min-w-0 flex-col rounded-lg p-5 transition duration-200 hover:-translate-y-0.5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "rgb(var(--surface-soft))", color: "rgb(var(--accent-strong))" }}
                >
                  <Icon size={20} />
                </div>
                <span className="signal-pill shrink-0">peržiūra</span>
              </div>
              <h2 className="mt-6 break-words font-display text-2xl font-bold leading-tight">{card.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[rgb(var(--text))]">{card.text}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{card.detail}</p>
            </article>
          );
        })}
      </section>

      <section id="verslo-profilis" className="grid scroll-mt-24 gap-6 xl:grid-cols-[1fr_0.82fr]">
        <div className="panel p-5 sm:p-7 lg:p-8">
          <SectionHeading
            eyebrow="Verslo profilis"
            title="Trumpas verslo kontekstas prieš sprendimus"
            text="Užpildyk pagrindinius duomenis, kad ši erdvė jaustųsi susieta su realiu verslu, klientu ir šio mėnesio kryptimi."
          />

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {businessProfileFields.map((field) => (
              <label key={field.key} className="block space-y-3">
                <FieldLabel>{field.label}</FieldLabel>
                {field.compact ? (
                  <input
                    type="text"
                    value={businessProfile[field.key]}
                    onChange={(event) => handleBusinessProfileChange(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="input-field !rounded-lg bg-[rgb(var(--surface))]"
                  />
                ) : (
                  <textarea
                    value={businessProfile[field.key]}
                    onChange={(event) => handleBusinessProfileChange(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="textarea-field min-h-[124px] !rounded-lg bg-[rgb(var(--surface))]"
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        <aside className="surface-dark rounded-lg p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Building2 size={22} className="text-white/72" />
              <span className="hero-chip">lokalus profilis</span>
            </div>
            <span className="hero-chip">
              {completedBusinessProfileFields}/{businessProfileFields.length}
            </span>
          </div>
          <h2 className="mt-6 break-words font-display text-3xl font-bold leading-tight">
            {businessProfile.businessName.trim() || "Verslo profilis laukia pirmo įrašo"}
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/58">
            {completedBusinessProfileFields === businessProfileFields.length
              ? "Santrauka paruošta sprendimams."
              : "Užpildyk laukus ir čia atsiras aiški verslo santrauka."}
          </p>

          <div className="mt-7 space-y-5">
            {businessProfileSummary.map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold uppercase leading-5 text-white/48">{item.label}</p>
                <p className={`mt-2 break-words text-sm leading-7 ${item.value ? "text-white/74" : "text-white/44"}`}>
                  {item.value || item.placeholder}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-7 text-xs font-semibold uppercase leading-5 text-white/48">
            Saugoma šiame įrenginyje · backendas nekeičiamas
          </p>
        </aside>
      </section>

      <section id="strategijos-lenta" className="grid scroll-mt-24 gap-6 xl:grid-cols-[1fr_0.82fr]">
        <div className="panel p-5 sm:p-7 lg:p-8">
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
                  className="textarea-field min-h-[132px] !rounded-lg bg-[rgb(var(--surface))]"
                />
              </label>
            ))}
          </div>
        </div>

        <aside className="surface-dark rounded-lg p-5 sm:p-7 lg:p-8">
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

      <section id="pasiulymo-aiskumas" className="panel scroll-mt-24 p-5 sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1fr]">
          <SectionHeading
            eyebrow="Pasiūlymo aiškumas"
            title="Aiški žinutė svetainei ir pardavimui"
            text="Užpildyk penkis laukus, o peržiūra iškart parodys trumpą svetainės sakinį, hero tekstą, CTA ir pardavimo žinutę."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {offerFields.map((field) => (
              <label key={field.key} className="block space-y-3">
                <FieldLabel>{field.title}</FieldLabel>
                <textarea
                  value={offer[field.key]}
                  onChange={(event) => handleOfferChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="textarea-field min-h-[116px] !rounded-lg bg-[rgb(var(--surface))]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t pt-7 lg:grid-cols-[0.72fr_1fr]" style={{ borderColor: "rgb(var(--line) / 0.72)" }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">Aiškumo signalai</p>
              <span className="signal-pill shrink-0">
                {completedOfferSignals}/{offerClaritySignals.length}
              </span>
            </div>
            {offerClaritySignals.map((signal) => (
              <div key={signal.label} className="flex items-center gap-3 text-sm leading-6 text-muted">
                <CheckCircle2
                  size={16}
                  className="shrink-0"
                  style={{ color: signal.complete ? "rgb(var(--accent-strong))" : "rgb(var(--muted) / 0.38)" }}
                />
                <span>{signal.label}</span>
              </div>
            ))}
            <p className="text-xs font-semibold uppercase leading-5 text-muted">
              Peržiūra · automatinis vertinimas nepridėtas
            </p>

            <div className="grid gap-3 pt-2 sm:flex sm:flex-wrap">
              <button type="button" onClick={handleSaveOffer} className="button-primary w-full sm:w-auto">
                Išsaugoti pasiūlymą
              </button>
              <button type="button" onClick={handleCopyOffer} className="button-secondary w-full sm:w-auto">
                Kopijuoti tekstą
              </button>
              <button type="button" onClick={handleClearOffer} className="button-secondary w-full sm:w-auto">
                Išvalyti
              </button>
            </div>

            {offerStatusMessage && <p className="text-sm font-semibold accent-text">{offerStatusMessage}</p>}
          </div>

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Sugeneruota peržiūra</p>
                <p className="mt-1 text-xs leading-5 text-muted">Tekstas keičiasi gyvai pagal pasiūlymo laukus ir verslo profilį.</p>
              </div>
              <span className="signal-pill shrink-0">lokali darbo erdvė</span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {generatedOfferOutputs.map((output) => (
                <article
                  key={output.title}
                  className="min-w-0 rounded-lg border bg-[rgb(var(--surface-soft))] p-5"
                  style={{ borderColor: "rgb(var(--line) / 0.82)" }}
                >
                  <p className="text-xs font-semibold uppercase leading-5 text-muted">{output.title}</p>
                  <p className="mt-3 break-words text-sm leading-7 text-[rgb(var(--text))]">{output.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="svetaines-auditas" className="grid scroll-mt-24 gap-6 xl:grid-cols-[0.82fr_1fr]">
        <div className="surface-dark rounded-lg p-5 sm:p-7 lg:p-8">
          <span className="hero-chip">Svetainės aiškumo auditas</span>
          <h2 className="mt-6 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">Svetainės aiškumo auditas</h2>
          <p className="mt-5 text-sm leading-7 text-white/72">
            Trumpas kontrolinis sąrašas padeda pamatyti, ar verslo pasiūlymas aiškus prieš klientui priimant sprendimą.
          </p>
          <div className="mt-7 rounded-lg border border-white/10 p-5">
            <p className="text-xs font-semibold uppercase leading-5 text-white/48">progresas</p>
            <p className="mt-3 font-display text-3xl font-bold leading-tight">
              Audito progresas: {completedAuditItems} iš {websiteAuditItems.length}
            </p>
          </div>
          {completedAuditItems === websiteAuditItems.length && (
            <p className="mt-5 rounded-lg border border-white/10 p-4 text-sm font-semibold leading-6 text-white/78">
              Svetainės aiškumas paruoštas kitam augimo žingsniui.
            </p>
          )}
        </div>

        <div className="panel p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Svetainės aiškumo auditas"
              title="Patikrink svarbiausias konversijos vietas"
              text="Pažymėjimai saugomi tik šiame įrenginyje. Tai nėra automatinis svetainės skenavimas."
            />
            <span className="signal-pill w-fit">lokali patikra</span>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {websiteAuditItems.map((item) => {
              const isChecked = Boolean(checkedAuditItems[item.id]);

              return (
                <label
                  key={item.id}
                  className="flex min-w-0 cursor-pointer items-start gap-4 rounded-lg border bg-[rgb(var(--surface))] p-5 transition duration-200 hover:-translate-y-0.5"
                  style={{ borderColor: isChecked ? "rgb(var(--accent-strong) / 0.42)" : "rgb(var(--line) / 0.82)" }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAuditItem(item.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-6 text-[rgb(var(--text))]">{item.title}</span>
                    <span className="mt-2 block text-sm leading-7 text-muted">{item.text}</span>
                  </span>
                </label>
              );
            })}
          </div>
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
            <article key={step.title} className="marketing-card min-w-0 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, rgb(var(--accent-strong)), rgb(var(--accent)))" }}
                >
                  {index + 1}
                </div>
                <Route size={18} className="text-muted" />
              </div>
              <h3 className="mt-6 break-words font-display text-2xl font-bold leading-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{step.text}</p>
              <div className="mt-5 border-t pt-4" style={{ borderColor: "rgb(var(--line) / 0.72)" }}>
                <p className="text-xs font-semibold uppercase leading-5 text-muted">praktinis patobulinimas</p>
                <p className="mt-2 text-sm leading-7 text-muted">{step.suggestion}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="verslo-resursai" className="panel scroll-mt-24 p-5 sm:p-7 lg:p-8">
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
              <article
                key={resource.id}
                className="min-w-0 rounded-lg border bg-[rgb(var(--surface))] p-5"
                style={{ borderColor: "rgb(var(--line) / 0.82)" }}
              >
                <button
                  type="button"
                  onClick={() => toggleResource(resource.id)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <span className="min-w-0">
                    <span className="block break-words font-display text-2xl font-bold leading-tight">{resource.title}</span>
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
        <div className="panel p-5 sm:p-7 lg:p-8">
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
                  className={`min-w-0 rounded-lg border p-5 text-left transition duration-200 hover:-translate-y-0.5 ${
                    isSelected ? "bg-[rgb(var(--surface-soft))]" : "bg-[rgb(var(--surface))]"
                  }`}
                  style={{
                    borderColor: isSelected ? "rgb(var(--accent-strong) / 0.42)" : "rgb(var(--line) / 0.82)",
                  }}
                >
                  <span className="block break-words text-lg font-semibold leading-tight">{card.title}</span>
                  <span className="mt-3 block text-sm leading-6 text-muted">{card.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="surface-dark rounded-lg p-5 sm:p-7 lg:p-8">
          <span className="hero-chip">Rekomenduojamas kitas žingsnis</span>
          <h2 className="mt-6 break-words font-display text-3xl font-bold leading-tight">{selectedDecision.title}</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">{selectedDecision.recommendation}</p>
          <p className="mt-6 text-xs font-semibold uppercase leading-5 text-white/48">
            Lokali darbo erdvė · automatinis backend vertinimas nepridėtas
          </p>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.82fr_1fr]">
        <div className="marketing-card min-w-0 p-5 sm:p-7 lg:p-8">
          <div className="flex items-start gap-4">
            <Sparkles size={22} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <div className="min-w-0">
              <span className="signal-pill">Prioritetinė pagalba</span>
              <h2 className="mt-5 break-words font-display text-3xl font-bold leading-tight">Prioritetinės pagalbos užklausos — netrukus</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Ši erdvė skirta aiškesniems klausimams, greitesniems sprendimams ir struktūruotai verslo krypčiai.
              </p>
              <p className="mt-5 text-xs font-semibold uppercase leading-5 text-muted">
                Nefiksuojama kaip reali pagalbos sistema · netrukus
              </p>
            </div>
          </div>
        </div>

        <div className="panel p-5 sm:p-7 lg:p-8">
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
              <article
                key={recommendation.title}
                className="min-w-0 rounded-lg border bg-[rgb(var(--surface))] p-5"
                style={{ borderColor: "rgb(var(--line) / 0.82)" }}
              >
                <BarChart3 size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <h3 className="mt-5 break-words text-lg font-semibold leading-tight">{recommendation.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{recommendation.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="veiksmu-planas" className="grid scroll-mt-24 gap-6 xl:grid-cols-[0.85fr_1fr]">
        <div className="surface-dark rounded-lg p-5 sm:p-7 lg:p-8">
          <span className="hero-chip">30 dienų verslo augimo planas</span>
          <h2 className="mt-6 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">30 dienų verslo augimo planas</h2>
          <p className="mt-5 text-sm leading-7 text-white/72">
            Keturių savaičių struktūra padeda judėti nuo aiškaus pasiūlymo iki pasitikėjimo, pardavimo ritmo ir mėnesio peržiūros.
          </p>
          <div className="mt-7 rounded-lg border border-white/10 p-5">
            <p className="text-xs font-semibold uppercase leading-5 text-white/48">roadmap progresas</p>
            <p className="mt-3 font-display text-3xl font-bold leading-tight">
              Atlikta: {completedRoadmapActions} iš {growthRoadmapActionIds.length}
            </p>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase leading-5 text-white/48">
            Saugoma lokaliai · be backend užduočių
          </p>
        </div>

        <div className="panel p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="30 dienų verslo augimo planas"
              title="Ką daryti kiekvieną savaitę"
              text="Roadmap yra praktinė peržiūra. Pažymėjimai lieka tik šiame įrenginyje."
            />
            <span className="signal-pill w-fit">peržiūra</span>
          </div>

          <div className="mt-7 grid gap-4">
            {growthRoadmapPhases.map((phase) => (
              <article
                key={phase.id}
                className="min-w-0 rounded-lg border bg-[rgb(var(--surface))] p-5"
                style={{ borderColor: "rgb(var(--line) / 0.82)" }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <span className="signal-pill">{phase.label}</span>
                    <h3 className="mt-4 break-words font-display text-2xl font-bold leading-tight">{phase.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{phase.focus}</p>
                  </div>
                  <span className="text-sm font-semibold text-muted">
                    {phase.actions.filter((action) => checkedRoadmapActions[action.id]).length}/{phase.actions.length}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {phase.actions.map((action) => {
                    const isChecked = Boolean(checkedRoadmapActions[action.id]);

                    return (
                      <label
                        key={action.id}
                        className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border bg-[rgb(var(--surface-soft))] px-4 py-4 text-sm leading-6 text-muted"
                        style={{ borderColor: isChecked ? "rgb(var(--accent-strong) / 0.42)" : "rgb(var(--line) / 0.72)" }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRoadmapAction(action.id)}
                          className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]"
                        />
                        <span className={isChecked ? "line-through opacity-70" : ""}>{action.text}</span>
                      </label>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.76fr]">
        <div className="panel p-5 sm:p-7 lg:p-8">
          <SectionHeading
            eyebrow="Įtraukta į Verslas"
            title="Aukščiausias StillOak Studio nario sluoksnis"
            text="Verslo planas aiškiai stovi virš Asmeninio plano: daugiau strategijos, verslo resursų ir premium sprendimų erdvės."
          />

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {includedItems.map((item) => (
              <div
                key={item}
                className="flex min-w-0 items-start gap-3 rounded-lg border bg-[rgb(var(--surface))] p-4"
                style={{ borderColor: "rgb(var(--line) / 0.82)" }}
              >
                <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                <span className="text-sm leading-6 text-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="member-executive-surface rounded-lg p-5 sm:p-7 lg:p-8">
          <div className="flex items-center gap-3">
            <Briefcase size={22} className="text-white/72" />
            <span className="hero-chip">aukščiausias planas</span>
          </div>
          <h2 className="mt-6 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">Tęsk kaip privačioje strategijos studijoje</h2>
          <p className="mt-5 text-sm leading-7 text-white/70">
            Čia nėra atnaujinimo kalbos, nes tai jau aukščiausias planas. Naudok veiksmus kaip trumpus kelius į svarbiausias
            darbo zonas.
          </p>
          <div className="mt-7 grid gap-3">
            <a href="#strategijos-lenta" className="button-primary w-full gap-2">
              Atnaujinti strategijos lentą
              <Target size={16} />
            </a>
            <a href="#verslo-resursai" className="hero-outline-button w-full gap-2">
              Peržiūrėti verslo resursus
              <Users size={16} />
            </a>
            <a href="#veiksmu-planas" className="hero-outline-button w-full gap-2">
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
