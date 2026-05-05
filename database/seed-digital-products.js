const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

const connectDatabase = require("./connect");
const Product = require("../server/models/Product");

const digitalProducts = [
  {
    name: "Calm Home Poster Bundle",
    description:
      "Šiltas spausdinamų sienos darbų rinkinys su švelniais neutralais, abstrakčiomis formomis ir ramia tipografija.",
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
    name: "The Atelier Living Room Guide",
    description:
      "Ramus gidas svetainės išdėstymui, paletei, tekstūroms ir jaukesniems stilistikos sprendimams.",
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
    name: "Sunday Reset Ritual Planner",
    description:
      "Ramus skaitmeninis planavimo įrankis savaitės peržiūrai, refleksijai ir sąmoningesnėms rutinoms.",
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
    name: "Home Edit Bundle",
    description:
      "Dviejų dalių skaitmeninis rinkinys su sienos darbais ir svetainės gidu ramiam kambario atnaujinimui.",
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
    name: "Calm Living Bundle",
    description:
      "Pilnas skaitmeninis rinkinys su spausdinamais sienos darbais, interjero gidu ir Sunday Reset planuokliu.",
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
