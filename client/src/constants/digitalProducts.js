const buildDownloadUrl = (folder, id, extension) => `/digital-products/${folder}/${id}.${extension}`;

export const digitalProducts = [
  {
    id: "personal-budget-system",
    title: "Personal Budget System",
    subtitle: "Rami mėnesio sistema aiškiai matyti, kur keliauja pinigai.",
    description:
      "A practical budget planning system for income, expenses, savings goals, and monthly balance.",
    category: "Personal finance",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF gidas su aiškia mėnesio biudžeto eiga",
      "Pajamų, išlaidų, taupymo ir balanso planavimo dalys",
      "Excel šablonas mėnesio skaičiams ir tikslų sekimui",
      "Peržiūros klausimai geresniems mėnesio pabaigos sprendimams",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "personal-budget-system", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "personal-budget-system", "xlsx"),
    isPublic: true,
    premiumCtaText: "Pradėkite nuo šios sistemos, o Asmeninis planas atrakins gilesnius finansų įrankius.",
  },
  {
    id: "productivity-planner",
    title: "Productivity Planner",
    subtitle: "Savaitės ir mėnesio ritmas fokusuotam, realistiškam progresui.",
    description:
      "A weekly and monthly productivity planner for goals, tasks, priorities, and progress tracking.",
    category: "Productivity",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF planavimo gidas mėnesio tikslams ir savaitės prioritetams",
      "Užduočių, prioritetų ir progreso peržiūros puslapiai",
      "Excel planuoklis savaitės planui ir užbaigimo sekimui",
      "Paprasti refleksijos klausimai fokusui išlaikyti",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "productivity-planner", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "productivity-planner", "xlsx"),
    isPublic: true,
    premiumCtaText: "Pradėkite nuo planuoklio, o narystėje atrakinkite gilesnę savaitės struktūrą.",
  },
  {
    id: "12-month-savings-tracker",
    title: "12-Month Savings Tracker",
    subtitle: "Metinis trackeris pastovioms įmokoms ir matomam progresui.",
    description:
      "A savings tracker for planning deposits, tracking progress, and building better money habits.",
    category: "Savings",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF gidas taupymo tikslui ir mėnesio ritmui nusistatyti",
      "12 mėnesių progreso vaizdas planuotoms ir realioms įmokoms",
      "Excel trackeris su tikslo, balanso ir skirtumo laukais",
      "Įpročių klausimai, kad taupymą būtų lengviau kartoti",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "12-month-savings-tracker", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "12-month-savings-tracker", "xlsx"),
    isPublic: true,
    premiumCtaText: "Naudokite trackerį Demo versijoje, o narystėje atrakinkite išsamesnį taupymo planavimą.",
  },
  {
    id: "business-idea-validation-kit",
    title: "Business Idea Validation Kit",
    subtitle: "Praktiškas filtras idėjai paversti aiškesniu kitu žingsniu.",
    description:
      "A simple system for checking if a business idea has demand, pricing potential, and clear next steps.",
    category: "Business",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF validavimo gidas paklausai, auditorijai, pasiūlymui ir kainai",
      "Klausimų rinkinys pirkimo motyvui ir kitiems veiksmams įvertinti",
      "Excel vertinimo lentelė idėjos stiprumui palyginti",
      "Sprendimo klausimai, ką testuoti pirmiausia",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "business-idea-validation-kit", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "business-idea-validation-kit", "xlsx"),
    isPublic: true,
    premiumCtaText: "Patikrinkite idėją, o verslo narystėje atrakinkite daugiau paleidimo resursų.",
  },
  {
    id: "social-media-content-calendar",
    title: "Social Media Content Calendar",
    subtitle: "Paprasta savaitės sistema turiniui planuoti be perteklinio triukšmo.",
    description:
      "A content planning system for Instagram, TikTok, YouTube Shorts, and weekly post planning.",
    category: "Content",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF gidas turinio temoms, savaitės ritmui ir peržiūrai",
      "Instagram, TikTok ir YouTube Shorts planavimo dalys",
      "Excel kalendorius įrašams, temoms, būsenai ir rezultatų pastaboms",
      "Savaitiniai klausimai turiniui išlaikyti kryptingam ir naudingam",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "social-media-content-calendar", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "social-media-content-calendar", "xlsx"),
    isPublic: true,
    premiumCtaText: "Susiplanuokite savaitę čia, o narystėje atrakinkite gilesnes turinio sistemas.",
  },
];
