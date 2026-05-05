const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

const connectDatabase = require("./connect");
const Product = require("../server/models/Product");

const digitalProducts = [
  {
    name: "Ramių namų plakatų rinkinys",
    description:
      "Skaitmeninis spausdinamų sienos darbų rinkinys namams, darbo kampui ar dovanai. Klientas gauna PDF resursą su ramiomis vizualinėmis kryptimis, kurios padeda greitai atnaujinti erdvę be fizinės siuntos.",
    price: 24,
    category: "Skaitmeniniai produktai",
    productType: "digital",
    images: [
      "/stilloak/collection/digital-bundle.svg",
    ],
    stock: 0,
    featured: true,
    digitalAsset: {
      storagePath: "posters/calm-home-poster-bundle-guide.pdf",
      fileName: "calm-home-poster-bundle-guide.pdf",
      downloadLabel: "Atsisiųsti plakatų rinkinį",
      mimeType: "application/pdf",
    },
  },
  {
    name: "Svetainės atnaujinimo mini gidas",
    description:
      "Skaitmeninis PDF gidas žmogui, kuris nori aiškiau susidėlioti svetainės išdėstymą, paletę ir tekstūras. Klientas gauna praktinę kryptį jaukesniam kambario atnaujinimui be didelio remonto.",
    price: 29,
    category: "Skaitmeniniai produktai",
    productType: "digital",
    images: [
      "/stilloak/collection/ai-summaries.svg",
    ],
    stock: 0,
    featured: true,
    digitalAsset: {
      storagePath: "guides/the-atelier-living-room-guide.pdf",
      fileName: "the-atelier-living-room-guide.pdf",
      downloadLabel: "Atsisiųsti gidą",
      mimeType: "application/pdf",
    },
  },
  {
    name: "Sekmadienio savaitės peržiūros planuoklis",
    description:
      "Skaitmeninis planuoklis savaitės peržiūrai, refleksijai ir ramesniam pasiruošimui. Klientas gauna PDF įrankį, kuris padeda užbaigti savaitę aiškiau ir pradėti kitą su mažiau chaoso.",
    price: 16,
    category: "Skaitmeniniai produktai",
    productType: "digital",
    images: [
      "/stilloak/collection/monthly-rhythm.svg",
    ],
    stock: 0,
    featured: false,
    digitalAsset: {
      storagePath: "planners/sunday-reset-ritual-planner.pdf",
      fileName: "sunday-reset-ritual-planner.pdf",
      downloadLabel: "Atsisiųsti planavimo įrankį",
      mimeType: "application/pdf",
    },
  },
  {
    name: "Namų atnaujinimo skaitmeninis rinkinys",
    description:
      "Dviejų dalių skaitmeninis rinkinys žmogui, kuris nori greito, ramaus kambario atnaujinimo. Klientas gauna sienos darbų ir svetainės gido paketą, kad interjero sprendimai būtų aiškesni ir lengviau pritaikomi.",
    price: 39,
    category: "Skaitmeniniai produktai",
    productType: "digital",
    images: [
      "/stilloak/collection/digital-bundle.svg",
    ],
    stock: 0,
    featured: true,
    digitalAsset: {
      storagePath: "bundles/home-edit-bundle.pdf",
      fileName: "home-edit-bundle.pdf",
      downloadLabel: "Atsisiųsti Home Edit rinkinį",
      mimeType: "application/pdf",
    },
  },
  {
    name: "Calm Living pilnas skaitmeninis paketas",
    description:
      "Pilnas skaitmeninis paketas namų estetikai ir savaitės ritmui. Klientas gauna plakatų, interjero gido ir savaitės planuoklio rinkinį, kuris padeda vienoje vietoje susijungti erdvei, rutinai ir aiškesniam planui.",
    price: 49,
    category: "Skaitmeniniai produktai",
    productType: "digital",
    images: [
      "/stilloak/collection/private-archive.svg",
    ],
    stock: 0,
    featured: true,
    digitalAsset: {
      storagePath: "bundles/calm-living-bundle.pdf",
      fileName: "calm-living-bundle.pdf",
      downloadLabel: "Atsisiųsti Calm Living rinkinį",
      mimeType: "application/pdf",
    },
  },
];

const seedDigitalProducts = async () => {
  try {
    await connectDatabase();

    for (const product of digitalProducts) {
      await Product.findOneAndUpdate(
        { name: product.name },
        { $set: product },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log("Skaitmeniniai produktai sėkmingai įrašyti arba atnaujinti.");
    process.exit(0);
  } catch (error) {
    console.error("Digital seed klaida:", error.message);
    process.exit(1);
  }
};

seedDigitalProducts();
