export const targetAudienceOptions = [
  "Pradedantieji",
  "Individualūs specialistai",
  "Mažos įmonės",
  "Studentai",
  "Turinio kūrėjai",
  "E-commerce pardavėjai",
  "Freelanceriai",
  "Verslo savininkai",
  "Kita",
];

export const skillLevelOptions = ["Pradedantysis", "Vidutinis", "Pažengęs", "Ekspertas"];

export const budgetOptions = ["0–50 €", "50–200 €", "200–500 €", "500 €+"];

export const timeAvailableOptions = ["1 diena", "3 dienos", "7 dienos", "14 dienų", "30 dienų"];

export const productGoalOptions = [
  "Greitai paleisti pirmą produktą",
  "Sukurti pasyvias pajamas",
  "Parduoti premium produktą",
  "Gauti pirmus klientus",
  "Auginti asmeninį brandą",
  "Sukurti SaaS idėją",
];

export const preferredProductTypeOptions = [
  "PDF produktai",
  "Šablonai",
  "Checklistai",
  "Mini kursai",
  "Narystės",
  "Mini SaaS",
  "Notion / Excel / Google Sheets įrankiai",
  "AI promptų rinkiniai",
];

export const toneOptions = [
  "Premium",
  "Paprastas ir praktiškas",
  "Greitam startui",
  "Verslui",
  "Luxury / high-ticket",
];

export const outputCategories = [
  "PDF produktai",
  "Šablonai",
  "Checklistai",
  "Mini kursai",
  "Narystės",
  "Mini SaaS idėjos",
];

const maxNicheLength = 80;

const categoryPreferenceMap = {
  "PDF produktai": ["PDF produktai", "AI promptų rinkiniai"],
  Šablonai: ["Šablonai", "Notion / Excel / Google Sheets įrankiai", "AI promptų rinkiniai"],
  Checklistai: ["Checklistai"],
  "Mini kursai": ["Mini kursai"],
  Narystės: ["Narystės"],
  "Mini SaaS idėjos": ["Mini SaaS", "Notion / Excel / Google Sheets įrankiai"],
};

const typeScoreBase = {
  "PDF produktai": { profit: 6.8, ease: 8.7, speed: 8.5, demand: 7.1 },
  Šablonai: { profit: 7.5, ease: 7.6, speed: 7.4, demand: 7.6 },
  Checklistai: { profit: 6.2, ease: 9.1, speed: 9.2, demand: 7.0 },
  "Mini kursai": { profit: 8.1, ease: 5.7, speed: 5.8, demand: 7.8 },
  Narystės: { profit: 8.5, ease: 4.8, speed: 4.6, demand: 7.7 },
  "Mini SaaS idėjos": { profit: 8.8, ease: 3.9, speed: 3.6, demand: 8.2 },
};

const timeSpeedModifier = {
  "1 diena": { speed: 1.2, ease: 0.4, complexPenalty: -1.8 },
  "3 dienos": { speed: 0.9, ease: 0.3, complexPenalty: -1.1 },
  "7 dienos": { speed: 0.5, ease: 0.1, complexPenalty: -0.4 },
  "14 dienų": { speed: 0.1, ease: 0, complexPenalty: 0.2 },
  "30 dienų": { speed: -0.2, ease: 0, complexPenalty: 0.7 },
};

const budgetProfitModifier = {
  "0–50 €": { profit: -0.2, ease: 0.4 },
  "50–200 €": { profit: 0.2, ease: 0.1 },
  "200–500 €": { profit: 0.5, ease: -0.1 },
  "500 €+": { profit: 0.8, ease: -0.2 },
};

const skillModifier = {
  Pradedantysis: { ease: -0.5, profit: -0.1 },
  Vidutinis: { ease: 0.1, profit: 0.1 },
  Pažengęs: { ease: 0.4, profit: 0.4 },
  Ekspertas: { ease: 0.6, profit: 0.7 },
};

const nicheProfiles = [
  {
    keywords: ["fitness", "fitnessas", "sveikata", "mityba", "sportas"],
    result: "aiškų kūno, energijos arba įpročių progresą",
    pain: "žmonės nori plano, bet pasimeta tarp per daug patarimų",
    asset: "progreso sekimo lentelė",
    channel: "Instagram Reels + 7 dienų nemokamas checklistas",
  },
  {
    keywords: ["finans", "pinig", "biudž", "invest"],
    result: "daugiau finansinio aiškumo ir mažiau impulsyvių sprendimų",
    pain: "auditorijai trūksta paprasto plano, kaip tvarkyti skaičius",
    asset: "biudžeto sekimo lentelė",
    channel: "Instagram karuselės + nemokamas biudžeto mini šablonas",
  },
  {
    keywords: ["grož", "oda", "kosmetik", "makiaž", "salon"],
    result: "tvarkingesnę rutiną, gražesnį įvaizdį arba aiškesnę paslaugos patirtį",
    pain: "klientai nori greitai suprasti, kas jiems tinka",
    asset: "asmeninės rutinos lapas",
    channel: "Instagram Stories + prieš/po turinio serija",
  },
  {
    keywords: ["nekilno", "nt", "real estate", "būst", "but"],
    result: "aiškesnį pirkimo, nuomos arba investavimo sprendimą",
    pain: "auditorijai sunku suprasti dokumentus, kainas ir pirmus žingsnius",
    asset: "sprendimo checklistas",
    channel: "LinkedIn įrašai + nemokamas pirkėjo pasiruošimo PDF",
  },
  {
    keywords: ["ai", "dirbtinis", "prompt", "automat"],
    result: "greitesnį darbą ir praktišką automatizavimo sistemą",
    pain: "žmonės mato AI potencialą, bet nežino, kaip pritaikyti kasdienybėje",
    asset: "promptų biblioteka",
    channel: "LinkedIn + trumpi ekrano įrašai su realiais pavyzdžiais",
  },
  {
    keywords: ["eduk", "mokym", "kurs", "stud"],
    result: "greitesnį mokymąsi ir aiškų žinių kelią",
    pain: "auditorijai trūksta struktūros, kaip mokytis be chaoso",
    asset: "mokymosi planavimo lapas",
    channel: "TikTok / Reels edukacinės serijos + nemokama pamoka",
  },
  {
    keywords: ["e-commerce", "shop", "pardav", "produkt"],
    result: "aiškesnį pardavimo procesą ir geriau paruoštą pasiūlymą",
    pain: "pardavėjai turi produktus, bet pritrūksta struktūros komunikacijai",
    asset: "produkto puslapio šablonas",
    channel: "LinkedIn + el. pašto mini auditas e-commerce pardavėjams",
  },
  {
    keywords: ["dizain", "brand", "graf", "web"],
    result: "tvarkingesnę vizualinę sistemą ir stipresnį pirmą įspūdį",
    pain: "auditorijai sunku išlaikyti nuoseklų vizualinį stilių",
    asset: "brand sistemos šablonas",
    channel: "Pinterest + Instagram karuselės su šablonų peržiūromis",
  },
  {
    keywords: ["social", "media", "instagram", "turin"],
    result: "greitesnį turinio planavimą ir aiškesnę komunikacijos kryptį",
    pain: "kūrėjai stringa ties idėjomis ir neaiškiu turinio ritmu",
    asset: "turinio kalendorius",
    channel: "Instagram Reels + nemokamas 10 postų idėjų sąrašas",
  },
  {
    keywords: ["freelanc", "paslaug", "konsult"],
    result: "aiškesnį pasiūlymą, kainodarą ir klientų pritraukimą",
    pain: "specialistai žino, ką moka, bet sunkiai supakuoja vertę",
    asset: "pasiūlymo struktūros šablonas",
    channel: "LinkedIn + asmeninės žinutės šiltai auditorijai",
  },
];

const genericProfile = {
  result: "aiškų, praktišką rezultatą be sudėtingo pasiruošimo",
  pain: "auditorijai trūksta struktūros ir konkretaus pirmo žingsnio",
  asset: "veiksmų planas",
  channel: "Instagram Reels + nemokamas checklistas kaip lead magnetas",
};

const sanitizeText = (value, maxLength = maxNicheLength) =>
  String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const clampScore = (value) => Math.min(10, Math.max(1, Number(value.toFixed(1))));

const averageScore = (scores) =>
  Number(((scores.profitPotential + scores.easeOfCreation + scores.speedToLaunch + scores.audienceDemand) / 4).toFixed(1));

const pluralNiche = (niche) => {
  if (!niche) {
    return "pasirinktos nišos";
  }

  return niche;
};

const getNicheProfile = (niche) => {
  const normalizedNiche = niche.toLowerCase();
  return (
    nicheProfiles.find((profile) => profile.keywords.some((keyword) => normalizedNiche.includes(keyword))) ||
    genericProfile
  );
};

const isAllowed = (value, options) => options.includes(value);

export const validateDigitalProductForm = (input = {}) => {
  const errors = [];
  const niche = sanitizeText(input.niche);
  const audience = sanitizeText(input.audience, 60);
  const skillLevel = sanitizeText(input.skillLevel, 40);
  const budget = sanitizeText(input.budget, 30);
  const timeAvailable = sanitizeText(input.timeAvailable, 30);
  const productGoal = sanitizeText(input.productGoal, 80);
  const tone = sanitizeText(input.tone, 50);
  const preferredProductTypes = Array.isArray(input.preferredProductTypes)
    ? input.preferredProductTypes.map((type) => sanitizeText(type, 80)).filter(Boolean)
    : [];

  if (!niche) {
    errors.push("Įrašyk nišą, kad generatorius galėtų sukurti konkrečias idėjas.");
  }

  if (niche.length > maxNicheLength) {
    errors.push(`Niša turi būti trumpesnė nei ${maxNicheLength} simbolių.`);
  }

  if (!isAllowed(audience, targetAudienceOptions)) {
    errors.push("Pasirink galiojančią tikslinę auditoriją.");
  }

  if (!isAllowed(skillLevel, skillLevelOptions)) {
    errors.push("Pasirink galiojantį patirties lygį.");
  }

  if (!isAllowed(budget, budgetOptions)) {
    errors.push("Pasirink galiojantį startinį biudžetą.");
  }

  if (!isAllowed(timeAvailable, timeAvailableOptions)) {
    errors.push("Pasirink galiojantį kūrimo laiką.");
  }

  if (!isAllowed(productGoal, productGoalOptions)) {
    errors.push("Pasirink galiojantį pagrindinį tikslą.");
  }

  if (!isAllowed(tone, toneOptions)) {
    errors.push("Pasirink galiojantį pozicionavimą.");
  }

  const invalidPreferredTypes = preferredProductTypes.filter((type) => !preferredProductTypeOptions.includes(type));

  if (invalidPreferredTypes.length > 0) {
    errors.push("Pasirinkti produkto tipai turi būti iš leistino sąrašo.");
  }

  return {
    errors,
    normalized: {
      niche,
      audience,
      skillLevel,
      budget,
      timeAvailable,
      productGoal,
      preferredProductTypes: preferredProductTypes.length > 0 ? preferredProductTypes : preferredProductTypeOptions,
      tone,
    },
  };
};

const categoryTemplates = [
  {
    category: "PDF produktai",
    productType: "PDF produktas",
    difficulty: "Lengvas",
    creationTime: "3–7 dienos",
    price: { default: "9–29 €", premium: "29–79 €", high: "49–149 €" },
    templates: [
      {
        name: (niche) => `30 dienų ${niche} veiksmų planas`,
        description: (niche, profile) =>
          `Praktinis PDF gidas žmonėms, kurie nori per 30 dienų pasiekti ${profile.result}.`,
        problem: (profile) => `Neaiškus startas, per daug informacijos ir jausmas, kad ${profile.pain}.`,
        included: (profile) => [
          "30 dienų veiksmų planas",
          profile.asset,
          "Savaitinis progreso puslapis",
          "Mėnesio refleksijos lapas",
        ],
        mvp: (profile) => `10–14 puslapių PDF + ${profile.asset}.`,
        monetization: "Parduoti kaip žemos kainos pirmą produktą ir vesti į brangesnį šabloną ar konsultaciją.",
      },
      {
        name: (niche) => `${niche} starto gidas pradedantiesiems`,
        description: (niche, profile) =>
          `Aiškus pradžios gidas auditorijai, kuri nori suprasti ${niche} temą be sudėtingo žargono.`,
        problem: (profile) => `Pradedantieji nežino, kokius veiksmus atlikti pirmus, nes ${profile.pain}.`,
        included: (profile) => [
          "Pagrindinių sąvokų puslapis",
          "Pirmų 7 veiksmų planas",
          profile.asset,
          "Klaidų, kurių vengti, sąrašas",
        ],
        mvp: "8 puslapių PDF su vienu aiškiu veiksmų keliu ir vienu papildomu šablonu.",
        monetization: "Naudoti kaip entry produktą arba lead magneto mokamą versiją.",
      },
    ],
  },
  {
    category: "Šablonai",
    productType: "Šablonas",
    difficulty: "Vidutinis",
    creationTime: "3–10 dienų",
    price: { default: "19–59 €", premium: "49–149 €", high: "99–299 €" },
    templates: [
      {
        name: (niche) => `${niche} valdymo šablonų rinkinys`,
        description: (niche, profile) =>
          `Notion, Excel arba Google Sheets rinkinys, padedantis sistemingai valdyti ${niche} procesą.`,
        problem: (profile) => `Auditorija turi tikslą, bet neturi vienos vietos planui, sekimui ir sprendimams, todėl ${profile.pain}.`,
        included: (profile) => [
          "Pagrindinis valdymo dashboardas",
          profile.asset,
          "Savaitės planavimo lentelė",
          "Instrukcijų mini gidas",
        ],
        mvp: "Vienas Google Sheets arba Notion dashboardas su 3 pagrindiniais vaizdais.",
        monetization: "Parduoti kaip produktyvumo įrankį su papildomu premium versijos upsell.",
      },
      {
        name: (niche) => `${niche} kliento / progreso dashboardas`,
        description: (niche) =>
          `Premium šablonas, skirtas matyti svarbiausią ${niche} progresą, sprendimus ir kitus veiksmus vienoje vietoje.`,
        problem: (profile) => `Duomenys arba veiksmai išsibarstę, todėl žmogui sunku suprasti, kas veikia ir ką daryti toliau.`,
        included: (profile) => [
          "Pagrindinių rodiklių skydelis",
          "Veiksmų backlog",
          profile.asset,
          "Mėnesio peržiūros puslapis",
        ],
        mvp: "Vienas dashboardas su įvedimo laukais, statusais ir automatiniu progreso skaičiavimu.",
        monetization: "Parduoti kaip profesionalų šabloną su diegimo instrukcija ir demonstraciniu video.",
      },
    ],
  },
  {
    category: "Checklistai",
    productType: "Checklistas",
    difficulty: "Lengvas",
    creationTime: "1–3 dienos",
    price: { default: "5–19 €", premium: "19–49 €", high: "29–79 €" },
    templates: [
      {
        name: (niche) => `${niche} paleidimo checklistas`,
        description: (niche) =>
          `Trumpas, praktiškas checklistas žmonėms, kurie nori greitai pradėti ${niche} projektą be chaoso.`,
        problem: () => "Žmonės stringa prieš startą, nes nežino, kas būtina, o kas tik atideda veiksmą.",
        included: () => [
          "Starto pasiruošimo punktai",
          "Pirmų veiksmų seka",
          "Dažniausių klaidų patikra",
          "Mini sprendimų medis",
        ],
        mvp: "2–4 puslapių checklistas su aiškiais žymėjimo laukais.",
        monetization: "Parduoti pigiai arba naudoti kaip mokamą lead magnetą brangesniam produktui.",
      },
      {
        name: (niche) => `${niche} audito checklistas`,
        description: (niche) =>
          `Diagnostinis checklistas, kuris padeda vartotojui greitai įvertinti, kas neveikia jo ${niche} sistemoje.`,
        problem: (profile) => `Auditorija jau kažką daro, bet nemato, kur praranda laiką, pinigus ar progresą.`,
        included: (profile) => [
          "Audito klausimynas",
          "Prioritetų skalė",
          profile.asset,
          "Kito veiksmo rekomendacijos",
        ],
        mvp: "Vienas auditavimo PDF su 20–30 klausimų ir balų lentele.",
        monetization: "Parduoti kaip greitą diagnostiką ir siūlyti konsultaciją arba šablonų rinkinį.",
      },
    ],
  },
  {
    category: "Mini kursai",
    productType: "Mini kursas",
    difficulty: "Vidutinis",
    creationTime: "7–14 dienų",
    price: { default: "39–129 €", premium: "99–299 €", high: "199–599 €" },
    templates: [
      {
        name: (niche) => `${niche} sprintas per 5 pamokas`,
        description: (niche, profile) =>
          `Kompaktiškas mini kursas, kuris veda vartotoją nuo neaiškaus starto iki ${profile.result}.`,
        problem: (profile) => `Auditorijai reikia ne tik informacijos, bet ir aiškios sekos, nes ${profile.pain}.`,
        included: (profile) => [
          "5 trumpos video pamokos",
          "Pamokų darbo lapai",
          profile.asset,
          "Pabaigos įgyvendinimo planas",
        ],
        mvp: "5 ekranų įrašai po 8–12 min. + vienas PDF darbo lapas.",
        monetization: "Parduoti kaip aiškaus rezultato mini programą su riboto laiko paleidimo kaina.",
      },
      {
        name: (niche) => `${niche} premium dirbtuvės`,
        description: (niche) =>
          `Vienos savaitės mokymų formatas su praktinėmis užduotimis ir konkrečiu rezultatu pabaigoje.`,
        problem: () => "Žmonės nori ne bendros teorijos, o vedamo proceso su aiškiu rezultatu.",
        included: () => [
          "3 mokymų moduliai",
          "Praktinės užduotys",
          "Rezultato pristatymo šablonas",
          "Bonus checklistas",
        ],
        mvp: "3 pamokos + vienas gyvas arba įrašytas Q&A blokas.",
        monetization: "Parduoti premium kaina ribotai grupei ir po to paversti evergreen produktu.",
      },
    ],
  },
  {
    category: "Narystės",
    productType: "Narystė",
    difficulty: "Pažengęs",
    creationTime: "14–30 dienų",
    price: { default: "9–29 €/mėn.", premium: "29–99 €/mėn.", high: "99–299 €/mėn." },
    templates: [
      {
        name: (niche) => `${niche} mėnesio klubas`,
        description: (niche, profile) =>
          `Maža narystė, kurioje nariai kas mėnesį gauna veiksmų planą, resursus ir palaikymą ${niche} temai.`,
        problem: (profile) => `Auditorijai sunku išlaikyti ritmą, nes ${profile.pain}.`,
        included: (profile) => [
          "Mėnesio veiksmų planas",
          "Naujas šablonas arba checklistas kas mėnesį",
          profile.asset,
          "Bendruomenės klausimų langas",
        ],
        mvp: "Vienas mėnesio PDF, vienas šablonas ir privatus el. laiškų / bendruomenės ritmas.",
        monetization: "Kurti pasikartojančias pajamas ir kelti kainą su augančia biblioteka.",
      },
      {
        name: (niche) => `${niche} premium resursų biblioteka`,
        description: (niche) =>
          `Uždara resursų biblioteka su šablonais, mini gidais ir mėnesio rekomendacijomis pasirinktos nišos auditorijai.`,
        problem: () => "Pirkėjai nori vienos patikimos vietos, kur nereikia kiekvieną kartą ieškoti sprendimo iš naujo.",
        included: () => [
          "Resursų biblioteka",
          "Naujų failų archyvas",
          "Mėnesio rekomendacijos",
          "Premium palaikymo gairės",
        ],
        mvp: "5 pirmi resursai + viena naujienų el. laiško seka nariams.",
        monetization: "Parduoti kaip narystę su ankstyvos prieigos kaina ir metiniu planu.",
      },
    ],
  },
  {
    category: "Mini SaaS idėjos",
    productType: "Mini SaaS",
    difficulty: "Sudėtingas",
    creationTime: "14–30 dienų",
    price: { default: "9–49 €/mėn.", premium: "49–149 €/mėn.", high: "99–399 €/mėn." },
    templates: [
      {
        name: (niche) => `${niche} rekomendacijų generatorius`,
        description: (niche, profile) =>
          `Mažas SaaS įrankis, kuris pagal vartotojo situaciją sugeneruoja personalizuotą ${niche} veiksmų planą.`,
        problem: (profile) => `Vartotojai nori personalizavimo, nes bendri patarimai nepadeda, kai ${profile.pain}.`,
        included: (profile) => [
          "Klausimyno forma",
          "Taisyklėmis grįstos rekomendacijos",
          profile.asset,
          "Eksporto arba kopijavimo funkcija",
        ],
        mvp: "Vienas klausimynas, 6–10 taisyklių ir rezultato dashboardas.",
        monetization: "Freemium arba mažos mėnesinės kainos modelis su premium rekomendacijomis.",
      },
      {
        name: (niche) => `${niche} progreso sekimo mini įrankis`,
        description: (niche) =>
          `Paprastas naršyklės įrankis, kuris padeda vartotojui sekti veiksmus, rezultatą ir kito žingsnio prioritetą.`,
        problem: () => "Auditorija pradeda, bet pameta progresą, nes neturi lengvo sekimo ir priminimo formato.",
        included: () => [
          "Progreso dashboardas",
          "Tikslų ir užduočių lentelė",
          "Automatinis prioriteto tekstas",
          "Eksporto funkcija",
        ],
        mvp: "Vienas dashboardas su local storage, 3 metrikomis ir paprasta rekomendacija.",
        monetization: "Mėnesinis planas, vienkartinis lifetime deal arba white-label versija specialistams.",
      },
    ],
  },
];

const getPriceForTone = (price, tone) => {
  if (tone === "Luxury / high-ticket") {
    return price.high;
  }

  if (tone === "Premium" || tone === "Verslui") {
    return price.premium;
  }

  return price.default;
};

const getToneLabel = (tone) => {
  if (tone === "Luxury / high-ticket") {
    return "high-ticket";
  }

  if (tone === "Paprastas ir praktiškas") {
    return "praktiškas";
  }

  return tone.toLowerCase();
};

const getDifficultyForSkill = (baseDifficulty, skillLevel) => {
  if (skillLevel === "Ekspertas" && baseDifficulty === "Sudėtingas") {
    return "Pažengęs";
  }

  if (skillLevel === "Pradedantysis" && baseDifficulty === "Vidutinis") {
    return "Vidutinis+";
  }

  return baseDifficulty;
};

const computeScores = ({ category, form }) => {
  const base = typeScoreBase[category];
  const budget = budgetProfitModifier[form.budget] || budgetProfitModifier["0–50 €"];
  const time = timeSpeedModifier[form.timeAvailable] || timeSpeedModifier["7 dienos"];
  const skill = skillModifier[form.skillLevel] || skillModifier.Vidutinis;
  const preferenceBoost = (categoryPreferenceMap[category] || []).some((type) =>
    form.preferredProductTypes.includes(type)
  )
    ? 0.8
    : -0.2;
  const goal = form.productGoal;
  const isComplex = category === "Mini SaaS idėjos" || category === "Narystės" || category === "Mini kursai";
  const premiumBoost = form.tone === "Luxury / high-ticket" || form.tone === "Premium" ? 0.5 : 0;
  const saasGoalBoost = goal === "Sukurti SaaS idėją" && category === "Mini SaaS idėjos" ? 1.2 : 0;
  const fastGoalBoost =
    goal === "Greitai paleisti pirmą produktą" && ["Checklistai", "PDF produktai", "Šablonai"].includes(category)
      ? 0.8
      : 0;
  const passiveBoost = goal === "Sukurti pasyvias pajamas" && category !== "Checklistai" ? 0.5 : 0;
  const firstClientBoost =
    goal === "Gauti pirmus klientus" && ["Checklistai", "Šablonai", "Mini kursai"].includes(category) ? 0.6 : 0;

  const profitPotential = clampScore(
    base.profit + budget.profit + skill.profit + preferenceBoost + premiumBoost + saasGoalBoost + passiveBoost
  );
  const easeOfCreation = clampScore(base.ease + budget.ease + skill.ease + preferenceBoost + (isComplex ? time.complexPenalty : time.ease));
  const speedToLaunch = clampScore(base.speed + time.speed + fastGoalBoost + (isComplex ? time.complexPenalty : 0));
  const audienceDemand = clampScore(base.demand + preferenceBoost + firstClientBoost + saasGoalBoost + passiveBoost);

  const scores = {
    profitPotential,
    easeOfCreation,
    speedToLaunch,
    audienceDemand,
  };

  return {
    ...scores,
    overall: averageScore(scores),
  };
};

const buildIdea = ({ blueprint, template, templateIndex, form, profile }) => {
  const niche = pluralNiche(form.niche);
  const scores = computeScores({ category: blueprint.category, form });
  const productName = template.name(niche, profile, form);
  const toneLabel = getToneLabel(form.tone);

  return {
    id: `${blueprint.category}-${templateIndex}-${productName}`.toLowerCase().replace(/[^a-z0-9ąčęėįšųūž]+/gi, "-"),
    productName,
    productType: blueprint.productType,
    category: blueprint.category,
    description: template.description(niche, profile, form),
    targetCustomer: `${form.audience}, kuriems aktualu ${profile.result}.`,
    problemSolved: template.problem(profile, form),
    included: template.included(profile, form),
    suggestedPrice: getPriceForTone(blueprint.price, form.tone),
    difficultyLevel: getDifficultyForSkill(blueprint.difficulty, form.skillLevel),
    estimatedCreationTime: blueprint.creationTime,
    monetizationAngle: template.monetization,
    firstVersionMvp: template.mvp(profile, form),
    whyThisCouldSell: `Aiškus pažadas, konkretus rezultatas ir ${toneLabel} pozicionavimas leidžia greitai parodyti vertę pasirinktai auditorijai.`,
    launchChannelSuggestion: profile.channel,
    scores,
  };
};

const buildActionPlan = (idea, form) => ({
  title: `48 val. paleidimo planas: ${idea.productName}`,
  day1: [
    `Apibrėžk pasiūlymą vienu sakiniu: kam skirta, kokį rezultatą duoda ir kodėl verta pirkti dabar.`,
    `Surašyk produkto struktūrą: ${idea.included.slice(0, 3).join(", ")}.`,
    `Sukurk pirmą MVP versiją: ${idea.firstVersionMvp}`,
    "Paruošk paprastą landing puslapį, Stripe payment link arba aiškų pirkimo CTA.",
    `Paruošk pirmą Instagram įrašą su problema, rezultatu ir kaina ${idea.suggestedPrice}.`,
  ],
  day2: [
    "Publikuok produkto puslapį ir patikrink pirkimo kelią telefone.",
    `Parašyk 10 potencialių pirkėjų iš segmento: ${form.audience}.`,
    `Paskelbk turinį per kanalą: ${idea.launchChannelSuggestion}.`,
    "Ištestuok paleidimo kainą ir pasiūlyk ankstyvą bonusą pirmiems pirkėjams.",
    "Surink 3 atsiliepimus arba klausimus ir pagal juos patobulink produkto aprašymą.",
  ],
});

const buildRecommendation = (bestIdea, form) => ({
  title: `Rekomenduojama pradėti nuo: ${bestIdea.productName}`,
  whyBest: `${bestIdea.productName} turi geriausią bendrą potencialo, kūrimo paprastumo ir paleidimo greičio balansą.`,
  fit: `Tai gerai dera su tavo niša (${form.niche}), auditorija (${form.audience}), tikslu („${form.productGoal}“) ir biudžetu (${form.budget}).`,
  buildFirst: `Pirmiausia kurk MVP: ${bestIdea.firstVersionMvp}`,
  sellIn48Hours: `Per pirmas 48 val. parduok per ${bestIdea.launchChannelSuggestion}, pradėdamas nuo aiškaus rezultato ir riboto starto pasiūlymo.`,
});

export const generateDigitalProductIdeas = (input) => {
  const { errors, normalized } = validateDigitalProductForm(input);

  if (errors.length > 0) {
    const error = new Error(errors[0]);
    error.errors = errors;
    throw error;
  }

  const profile = getNicheProfile(normalized.niche);
  const ideas = categoryTemplates.flatMap((blueprint) =>
    blueprint.templates.map((template, templateIndex) =>
      buildIdea({ blueprint, template, templateIndex, form: normalized, profile })
    )
  );
  const sortedIdeas = [...ideas].sort((left, right) => {
    const overallOrder = right.scores.overall - left.scores.overall;

    if (overallOrder !== 0) {
      return overallOrder;
    }

    if (normalized.productGoal === "Greitai paleisti pirmą produktą") {
      return right.scores.speedToLaunch - left.scores.speedToLaunch;
    }

    return right.scores.profitPotential - left.scores.profitPotential;
  });
  const bestIdea = sortedIdeas[0];

  return {
    input: normalized,
    ideas,
    groupedIdeas: outputCategories.reduce(
      (groups, category) => ({
        ...groups,
        [category]: ideas.filter((idea) => idea.category === category),
      }),
      {}
    ),
    bestIdea,
    recommendation: buildRecommendation(bestIdea, normalized),
    actionPlan: buildActionPlan(bestIdea, normalized),
    generatedAt: new Date().toISOString(),
  };
};

export const generateInstagramPostText = (idea, form) => {
  if (!idea) {
    return "";
  }

  return [
    `HOOK: Turi ${form.niche} idėją, bet nežinai, ką parduoti pirmiausia?`,
    "",
    `Pasiūlymas: ${idea.productName}`,
    idea.description,
    "",
    "Kodėl verta:",
    `1. Sprendžia: ${idea.problemSolved}`,
    `2. MVP galima sukurti taip: ${idea.firstVersionMvp}`,
    `3. Starto kaina: ${idea.suggestedPrice}`,
    "",
    "CTA: Parašyk „IDĖJA“, jei nori gauti pirmą produkto struktūrą.",
  ].join("\n");
};

export const generateLandingPageCopy = (idea, form) => {
  if (!idea) {
    return "";
  }

  return [
    `Hero headline: ${idea.productName}`,
    `Subheadline: ${idea.description}`,
    "",
    `Kam skirta: ${idea.targetCustomer}`,
    `Kokią problemą sprendžia: ${idea.problemSolved}`,
    "",
    "Kas įtraukta:",
    ...idea.included.map((item) => `- ${item}`),
    "",
    `Kaina: ${idea.suggestedPrice}`,
    `Pirmas CTA: Gauti ${idea.productType.toLowerCase()}`,
    "",
    `Kodėl verta dabar: ${idea.whyThisCouldSell}`,
  ].join("\n");
};

export const formatResultsForCopy = (result) => {
  if (!result) {
    return "";
  }

  const lines = [
    "Skaitmeninio produkto idėjų generatorius",
    `Niša: ${result.input.niche}`,
    `Auditorija: ${result.input.audience}`,
    "",
    result.recommendation.title,
    result.recommendation.whyBest,
    result.recommendation.fit,
    "",
    "48 val. planas",
    "Day 1:",
    ...result.actionPlan.day1.map((item) => `- ${item}`),
    "Day 2:",
    ...result.actionPlan.day2.map((item) => `- ${item}`),
    "",
  ];

  result.ideas.forEach((idea) => {
    lines.push(
      `${idea.productName} (${idea.productType})`,
      `Potencialas: ${idea.scores.overall}/10`,
      `Aprašymas: ${idea.description}`,
      `Klientas: ${idea.targetCustomer}`,
      `Problema: ${idea.problemSolved}`,
      `Įtraukta: ${idea.included.join(", ")}`,
      `Kaina: ${idea.suggestedPrice}`,
      `MVP: ${idea.firstVersionMvp}`,
      `Launch: ${idea.launchChannelSuggestion}`,
      ""
    );
  });

  return lines.join("\n");
};
