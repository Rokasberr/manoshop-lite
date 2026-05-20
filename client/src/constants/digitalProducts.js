import { translations } from "../i18n/translations";

const sharedProductMeta = {
  formats: ["XLSX"],
  lastUpdated: "2026",
  isPublic: true,
  isPaid: true,
  productType: "digital_download",
  stripePriceEnvKey: null,
  stripePriceIdReference: "dynamic_one_time_checkout",
  ctaLabels: {
    guest: "Prisiregistruoti ir įsigyti",
    purchase: "Pirkti dabar",
    download: "Atsisiųsti Excel",
  },
};

export const digitalProducts = [
  {
    ...sharedProductMeta,
    id: "personal-budget-system",
    slug: "stilloak-personal-budget-system",
    title: "StillOak Personal Budget System",
    subtitle: "Premium asmeninio biudžeto Excel sistema aiškesniam pinigų valdymui.",
    description:
      "Profesionalus Excel modelis pajamoms, išlaidoms, kategorijoms, taupymo tikslams ir mėnesio balansui valdyti vienoje aiškioje sistemoje.",
    salesDescription:
      "Sukurtas žmonėms, kurie nori matyti realų finansų vaizdą be chaoso. Įveskite planą, faktinius skaičius ir taupymo tikslus, o dashboard padės greitai suprasti, kur pinigai juda gerai ir kur verta koreguoti įpročius.",
    category: "Finansai",
    priceLabel: "€19",
    priceCents: 1900,
    version: "V10",
    imageUrl: "/digital-products/previews/personal-budget-system-preview.png",
    pdfFileName: null,
    excelFileName: "StillOak_Personal_Budget_System.xlsx",
    highlightBadge: "Geriausia pradžiai",
    badges: ["Excel", "Su formulėmis", "Automatinis dashboard", "Finansai"],
    trustBadges: ["Saugus pirkimas", "Skaitmeninis atsisiuntimas", "Prieiga po apmokėjimo", "Paruošta naudoti"],
    benefits: [
      "Aiškiai parodo mėnesio pajamas, išlaidas ir balansą.",
      "Padeda pastebėti, kurios kategorijos viršija planą.",
      "Sujungia taupymo tikslus ir progresą vienoje vietoje.",
      "Suteikia paruoštą dashboard be papildomo kūrimo darbo.",
      "Tinka asmeniniam arba namų ūkio biudžetui.",
    ],
    includedItems: [
      "Excel biudžeto modelis su formulėmis",
      "Pajamų ir išlaidų sekimo lentelės",
      "Kategorijų analizė",
      "Taupymo tikslų sistema",
      "Automatinis mėnesio dashboard",
      "Monthly Review darbo lapas",
    ],
    whatsIncluded: [
      "Dashboard su pagrindiniais biudžeto rodikliais",
      "Income, Expenses ir Savings Goals lapai",
      "Category Summary analizė",
      "Start Here naudojimosi instrukcija",
      "Settings lapas kategorijoms ir statusams",
    ],
    targetAudience: [
      "Žmonėms, kurie nori tvarkingai valdyti asmeninį biudžetą.",
      "Poroms ar namų ūkiams, norintiems matyti bendrą finansų vaizdą.",
      "Pradedantiesiems, kuriems reikia aiškios struktūros be sudėtingo pasiruošimo.",
      "Visiems, kurie nori kas mėnesį priimti ramesnius finansinius sprendimus.",
    ],
    howToUseSteps: [
      "Atsidarykite Start Here lapą ir peržiūrėkite naudojimosi eigą.",
      "Įveskite mėnesio pajamas, išlaidas ir taupymo tikslus.",
      "Dashboard lape stebėkite balansą, kategorijas ir progresą.",
    ],
    excelFeatures: [
      "Automatiniai pajamų ir išlaidų skaičiavimai",
      "Kategorijų analizė",
      "Taupymo tikslų progreso formulės",
      "Biudžeto dashboard",
      "Mėnesio peržiūros struktūra",
    ],
    dashboardMetrics: [
      "Total Income",
      "Total Expenses",
      "Monthly Balance",
      "Savings Rate",
      "Category Analysis",
      "Savings Goals",
    ],
    estimatedUseTime: "30-45 min.",
    difficultyLevel: "Lengvas",
    fileNotes: "Mokamas Excel modelis. Atsisiuntimas pasiekiamas tik po sėkmingo pirkimo.",
  },
  {
    ...sharedProductMeta,
    id: "12-month-savings-tracker",
    slug: "stilloak-savings-tracker",
    title: "StillOak Savings Tracker",
    subtitle: "English Excel template with demo numbers, savings goals, monthly deposits, and dashboard preview.",
    description:
      "Ready-to-use English savings tracker for goals, monthly deposits, remaining balance, and progress tracking with realistic demo data.",
    salesDescription:
      "Use the dashboard preview to understand savings progress quickly: set your goals, follow monthly deposits, compare saved amounts, and see what remains without building formulas from scratch.",
    category: "Finansai",
    priceLabel: "€15",
    priceCents: 1500,
    version: "V15",
    imageUrl: "/digital-products/previews/stilloak-savings-tracker-preview.png",
    imageAlt: "StillOak Savings Tracker English Excel dashboard preview",
    pdfFileName: null,
    excelFileName: "StillOak_Savings_Tracker.xlsx",
    highlightBadge: "Populiaru",
    badges: ["Excel", "Su formulėmis", "Automatinis dashboard", "Finansai"],
    trustBadges: ["Saugus pirkimas", "Skaitmeninis atsisiuntimas", "Prieiga po apmokėjimo", "Paruošta naudoti"],
    benefits: [
      "English Excel dashboard with realistic demo numbers already included.",
      "Tracks savings goals, monthly deposits, saved amount, and remaining balance.",
      "Automatically calculates progress percentage and savings status.",
      "Helps keep a steady savings rhythm across the year.",
      "Works for emergency funds, trips, equipment, investments, or other goals.",
    ],
    includedItems: [
      "English Excel savings tracker",
      "Realistic demo numbers",
      "Savings Goals sheet",
      "Monthly Deposits tracking",
      "Progress and remaining balance formulas",
      "Dashboard preview and automatic overview",
    ],
    whatsIncluded: [
      "Goal setup for multiple savings targets",
      "Monthly deposit tracking with formulas",
      "Target amount, saved amount, and remaining balance",
      "Progress percentage and status messages",
      "Clean dashboard preview for quick review",
    ],
    targetAudience: [
      "Žmonėms, kurie taupo konkrečiam tikslui.",
      "Pradedantiesiems, norintiems paprastos metinės struktūros.",
      "Tiems, kurie nori matyti ne tik sumą, bet ir taupymo tempą.",
      "Vartotojams, kuriems svarbus aiškus progreso dashboard.",
    ],
    howToUseSteps: [
      "Review the English demo data and dashboard preview first.",
      "Replace example savings goals with your own targets.",
      "Add monthly deposits and track progress automatically.",
    ],
    excelFeatures: [
      "English labels and workbook structure",
      "Demo numbers included",
      "Monthly deposit formulas",
      "Progress tracking formulas",
      "Dashboard preview with automatic overview",
    ],
    dashboardMetrics: [
      "Target Amount",
      "Saved Amount",
      "Remaining Amount",
      "Monthly Progress",
      "Milestones",
      "Scenario View",
    ],
    estimatedUseTime: "20-30 min.",
    difficultyLevel: "Lengvas",
    fileNotes: "Mokamas Excel modelis. Atsisiuntimas pasiekiamas tik po sėkmingo pirkimo.",
  },
  {
    ...sharedProductMeta,
    id: "weekly-planning-system",
    slug: "stilloak-weekly-planning-system",
    title: "StillOak Weekly Planning System",
    subtitle: "Premium savaitės planavimo sistema prioritetams, užduotims ir fokusui valdyti.",
    description:
      "Profesionalus savaitės planavimo Excel modelis, padedantis susidėlioti prioritetus, valdyti užduotis ir aiškiai matyti savaitės progresą.",
    salesDescription:
      "Sukurtas žmonėms, kurie nori mažiau chaoso ir daugiau krypties. Modelis sujungia savaitės tikslus, prioritetus, užduočių eigą ir refleksiją į vieną aiškų planavimo ritmą.",
    category: "Planavimas",
    priceLabel: "€12",
    priceCents: 1200,
    version: "V15",
    imageUrl: "/digital-products/previews/weekly-planning-system-preview.png",
    pdfFileName: null,
    excelFileName: "StillOak_Weekly_Planning_System.xlsx",
    highlightBadge: "Planavimui",
    badges: ["Excel", "Su formulėmis", "Automatinis dashboard", "Planavimas"],
    trustBadges: ["Saugus pirkimas", "Skaitmeninis atsisiuntimas", "Prieiga po apmokėjimo", "Paruošta naudoti"],
    benefits: [
      "Padeda susidėlioti savaitės prioritetus prieš prasidedant darbams.",
      "Suteikia aiškų užduočių, terminų ir statusų vaizdą.",
      "Parodo savaitės progresą ir fokuso kokybę.",
      "Padeda užbaigti savaitę su refleksija ir kitu veiksmu.",
      "Tinka darbui, mokslams, projektams ar asmeniniams tikslams.",
    ],
    includedItems: [
      "Weekly Plan lapas",
      "Task Tracker su formulėmis",
      "Priority Matrix",
      "Weekly Review lapas",
      "Settings struktūra",
      "Automatinis dashboard",
    ],
    whatsIncluded: [
      "Savaitės tikslų ir prioritetų planavimas",
      "Užduočių sekimas pagal statusą ir prioritetą",
      "Prioritetų matrica",
      "Savaitės peržiūros klausimai",
      "Dashboard su progreso rodikliais",
    ],
    targetAudience: [
      "Žmonėms, kurie nori planuoti savaitę aiškiau ir ramiau.",
      "Freelanceriams, kūrėjams ir specialistams su daug skirtingų užduočių.",
      "Tiems, kurie nori matyti progresą, o ne tik užduočių sąrašą.",
      "Vartotojams, kuriems reikia paprastos, bet profesionalios planavimo sistemos.",
    ],
    howToUseSteps: [
      "Pradėkite nuo Weekly Plan ir pasirinkite pagrindinius savaitės prioritetus.",
      "Task Tracker lape pildykite užduotis, statusus ir terminus.",
      "Savaitės pabaigoje užpildykite Weekly Review ir suplanuokite kitą žingsnį.",
    ],
    excelFeatures: [
      "Užduočių progreso formulės",
      "Prioritetų ir statusų struktūra",
      "Dashboard su savaitės rodikliais",
      "Weekly Review darbo eiga",
      "Planavimo lapai be makrokomandų",
    ],
    dashboardMetrics: [
      "Weekly Focus",
      "Task Progress",
      "Priority Mix",
      "Completion Rate",
      "Review Notes",
      "Next Actions",
    ],
    estimatedUseTime: "15-25 min.",
    difficultyLevel: "Lengvas",
    fileNotes: "Mokamas Excel modelis. Atsisiuntimas pasiekiamas tik po sėkmingo pirkimo.",
  },
];

export const getLocalizedDigitalProducts = (language = "lt") => {
  const locale = translations[language] || translations.lt;
  const fallback = translations.lt;
  const productCopies = locale.digitalProductItems || {};
  const fallbackProductCopies = fallback.digitalProductItems || {};
  const common = locale.common || fallback.common;

  return digitalProducts.map((product) => {
    const localizedProduct = {
      ...(fallbackProductCopies[product.id] || {}),
      ...(productCopies[product.id] || {}),
    };

    return {
      ...product,
      ...localizedProduct,
      ctaLabels: {
        guest: common.buttons.registerAndBuy,
        purchase: common.buttons.buyNow,
        download: common.buttons.downloadExcel,
        ...(localizedProduct.ctaLabels || {}),
      },
    };
  });
};
