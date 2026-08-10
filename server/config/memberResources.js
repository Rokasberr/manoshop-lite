const path = require("path");

const MEMBER_RESOURCES_ROOT = path.resolve(__dirname, "..", "private-resources", "member-resources");

const definePdf = ({ id, minPlan, relativePath, fileName, title }) => ({
  id,
  minPlan,
  title,
  files: {
    pdf: {
      format: "pdf",
      relativePath,
      fileName,
      contentType: "application/pdf",
    },
  },
});

const memberResources = {
  "finansu-aiskumo-starter-kit": definePdf({
    id: "finansu-aiskumo-starter-kit",
    minPlan: "basic",
    title: "Finansu aiskumo starter kit",
    relativePath: path.join("digital-products", "bazinis", "stilloak-finansu-aiskumo-starter-kit.pdf"),
    fileName: "stilloak-finansu-aiskumo-starter-kit.pdf",
  }),
  "islaidu-audito-checklist": definePdf({
    id: "islaidu-audito-checklist",
    minPlan: "basic",
    title: "Islaidu audito checklist",
    relativePath: path.join("digital-products", "bazinis", "stilloak-islaidu-audito-checklist.pdf"),
    fileName: "stilloak-islaidu-audito-checklist.pdf",
  }),
  "taupymo-tikslu-planavimo-sablonas": definePdf({
    id: "taupymo-tikslu-planavimo-sablonas",
    minPlan: "basic",
    title: "Taupymo tikslu planavimo sablonas",
    relativePath: path.join("digital-products", "bazinis", "stilloak-taupymo-tikslu-planavimo-sablonas.pdf"),
    fileName: "stilloak-taupymo-tikslu-planavimo-sablonas.pdf",
  }),
  "pajamu-ir-islaidu-optimizavimo-planas": definePdf({
    id: "pajamu-ir-islaidu-optimizavimo-planas",
    minPlan: "personal",
    title: "Pajamu ir islaidu optimizavimo planas",
    relativePath: path.join("digital-products", "asmeninis", "stilloak-pajamu-ir-islaidu-optimizavimo-planas.pdf"),
    fileName: "stilloak-pajamu-ir-islaidu-optimizavimo-planas.pdf",
  }),
  "premium-finansiniu-tikslu-sistema": definePdf({
    id: "premium-finansiniu-tikslu-sistema",
    minPlan: "personal",
    title: "Premium finansiniu tikslu sistema",
    relativePath: path.join("digital-products", "asmeninis", "stilloak-premium-finansiniu-tikslu-sistema.pdf"),
    fileName: "stilloak-premium-finansiniu-tikslu-sistema.pdf",
  }),
  "skaitmeniniu-produktu-ideju-framework": definePdf({
    id: "skaitmeniniu-produktu-ideju-framework",
    minPlan: "personal",
    title: "Skaitmeniniu produktu ideju framework",
    relativePath: path.join("digital-products", "asmeninis", "stilloak-skaitmeniniu-produktu-ideju-framework.pdf"),
    fileName: "stilloak-skaitmeniniu-produktu-ideju-framework.pdf",
  }),
  "digital-product-launch-kit": definePdf({
    id: "digital-product-launch-kit",
    minPlan: "private_business",
    title: "Digital product launch kit",
    relativePath: path.join("digital-products", "privatus-verslas", "stilloak-digital-product-launch-kit.pdf"),
    fileName: "stilloak-digital-product-launch-kit.pdf",
  }),
  "mini-verslo-paleidimo-blueprint": definePdf({
    id: "mini-verslo-paleidimo-blueprint",
    minPlan: "private_business",
    title: "Mini verslo paleidimo blueprint",
    relativePath: path.join("digital-products", "privatus-verslas", "stilloak-mini-verslo-paleidimo-blueprint.pdf"),
    fileName: "stilloak-mini-verslo-paleidimo-blueprint.pdf",
  }),
  "premium-produkto-pasiulymo-framework": definePdf({
    id: "premium-produkto-pasiulymo-framework",
    minPlan: "private_business",
    title: "Premium produkto pasiulymo framework",
    relativePath: path.join("digital-products", "privatus-verslas", "stilloak-premium-produkto-pasiulymo-framework.pdf"),
    fileName: "stilloak-premium-produkto-pasiulymo-framework.pdf",
  }),
  "store-page-copy-kit": definePdf({
    id: "store-page-copy-kit",
    minPlan: "private_business",
    title: "Store page copy kit",
    relativePath: path.join("digital-products", "privatus-verslas", "stilloak-store-page-copy-kit.pdf"),
    fileName: "stilloak-store-page-copy-kit.pdf",
  }),
  "productivity-starter-kit": definePdf({
    id: "productivity-starter-kit",
    minPlan: "basic",
    title: "Productivity starter kit",
    relativePath: path.join("productivity", "stilloak-productivity-starter-kit.pdf"),
    fileName: "stilloak-productivity-starter-kit.pdf",
  }),
  "weekly-planner-pro": definePdf({
    id: "weekly-planner-pro",
    minPlan: "basic",
    title: "Weekly planner pro",
    relativePath: path.join("productivity", "stilloak-weekly-planner-pro.pdf"),
    fileName: "stilloak-weekly-planner-pro.pdf",
  }),
  "habit-tracker": definePdf({
    id: "habit-tracker",
    minPlan: "basic",
    title: "Habit tracker",
    relativePath: path.join("productivity", "stilloak-habit-tracker.pdf"),
    fileName: "stilloak-habit-tracker.pdf",
  }),
  "30-day-productivity-planner": definePdf({
    id: "30-day-productivity-planner",
    minPlan: "basic",
    title: "30 day productivity planner",
    relativePath: path.join("productivity", "stilloak-30-day-productivity-planner.pdf"),
    fileName: "stilloak-30-day-productivity-planner.pdf",
  }),
};

const normalizeResourceFormat = (format = "") => {
  const value = String(format || "").trim().toLowerCase();

  if (value === "pdf") {
    return "pdf";
  }

  if (value === "xlsx" || value === "excel") {
    return "xlsx";
  }

  return "";
};

const resolvePrivateResourcePath = (relativePath = "") => {
  const root = path.resolve(MEMBER_RESOURCES_ROOT);
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return filePath;
};

const getMemberResourceFile = (resourceId = "", format = "") => {
  const id = String(resourceId || "").trim().toLowerCase();
  const normalizedFormat = normalizeResourceFormat(format);
  const resource = memberResources[id] || null;

  if (!resource || !normalizedFormat) {
    return null;
  }

  const file = resource.files[normalizedFormat] || null;

  if (!file) {
    return null;
  }

  const filePath = resolvePrivateResourcePath(file.relativePath);

  if (!filePath) {
    return null;
  }

  return {
    ...resource,
    file: {
      ...file,
      filePath,
    },
  };
};

module.exports = {
  MEMBER_RESOURCES_ROOT,
  getMemberResourceFile,
  memberResources,
  normalizeResourceFormat,
  resolvePrivateResourcePath,
};
