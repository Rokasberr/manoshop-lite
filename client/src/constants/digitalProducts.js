const buildDownloadUrl = (folder, id, extension) => `/digital-products/${folder}/${id}.${extension}`;

export const digitalProducts = [
  {
    id: "personal-budget-system",
    title: "Personal Budget System",
    subtitle: "A calm monthly system for seeing where your money goes.",
    description:
      "A practical budget planning system for income, expenses, savings goals, and monthly balance.",
    category: "Personal finance",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF setup guide with a clear monthly budgeting workflow",
      "Income, expense, savings, and balance planning sections",
      "Excel template for monthly numbers and goal tracking",
      "Review prompts for better end-of-month decisions",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "personal-budget-system", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "personal-budget-system", "xlsx"),
    isPublic: true,
    premiumCtaText: "Use this free system, then unlock the member area for deeper money tools.",
  },
  {
    id: "productivity-planner",
    title: "Productivity Planner",
    subtitle: "A weekly and monthly rhythm for focused, realistic progress.",
    description:
      "A weekly and monthly productivity planner for goals, tasks, priorities, and progress tracking.",
    category: "Productivity",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF planning guide for monthly goals and weekly priorities",
      "Task, priority, and progress review pages",
      "Excel planner for weekly planning and completion tracking",
      "Simple reflection prompts for protecting focus",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "productivity-planner", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "productivity-planner", "xlsx"),
    isPublic: true,
    premiumCtaText: "Start with the planner, then unlock premium systems for deeper weekly structure.",
  },
  {
    id: "12-month-savings-tracker",
    title: "12-Month Savings Tracker",
    subtitle: "A year-long tracker for consistent deposits and visible progress.",
    description:
      "A savings tracker for planning deposits, tracking progress, and building better money habits.",
    category: "Savings",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF guide for setting a savings target and monthly rhythm",
      "12-month progress view for planned and actual deposits",
      "Excel tracker with goal, balance, and variance fields",
      "Habit prompts for making saving easier to repeat",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "12-month-savings-tracker", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "12-month-savings-tracker", "xlsx"),
    isPublic: true,
    premiumCtaText: "Use the tracker freely, then unlock member tools for richer savings planning.",
  },
  {
    id: "business-idea-validation-kit",
    title: "Business Idea Validation Kit",
    subtitle: "A practical filter for turning an idea into a clearer next step.",
    description:
      "A simple system for checking if a business idea has demand, pricing potential, and clear next steps.",
    category: "Business",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF validation guide for demand, audience, offer, and pricing",
      "Question set for identifying buying intent and next actions",
      "Excel scoring sheet for comparing idea strength",
      "Decision prompts for choosing what to test first",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "business-idea-validation-kit", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "business-idea-validation-kit", "xlsx"),
    isPublic: true,
    premiumCtaText: "Validate the idea, then unlock premium business resources for launch planning.",
  },
  {
    id: "social-media-content-calendar",
    title: "Social Media Content Calendar",
    subtitle: "A simple weekly system for planning content with less noise.",
    description:
      "A content planning system for Instagram, TikTok, YouTube Shorts, and weekly post planning.",
    category: "Content",
    formats: ["PDF", "XLSX"],
    includedItems: [
      "PDF guide for content themes, weekly rhythm, and review",
      "Platform planning for Instagram, TikTok, and YouTube Shorts",
      "Excel calendar for posts, topics, status, and performance notes",
      "Weekly prompts for keeping content aligned and useful",
    ],
    pdfDownloadUrl: buildDownloadUrl("pdf", "social-media-content-calendar", "pdf"),
    excelDownloadUrl: buildDownloadUrl("excel", "social-media-content-calendar", "xlsx"),
    isPublic: true,
    premiumCtaText: "Plan your week here, then unlock member resources for deeper content systems.",
  },
];
