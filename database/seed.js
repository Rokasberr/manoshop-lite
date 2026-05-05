const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

const connectDatabase = require("./connect");
const User = require("../server/models/User");
const Product = require("../server/models/Product");
const Order = require("../server/models/Order");

const users = [
  {
    name: "Admin ManoShop",
    email: "admin@manoshop.lt",
    password: "Admin123!",
    role: "admin",
  },
  {
    name: "Laura Pirkėja",
    email: "laura@manoshop.lt",
    password: "Customer123!",
    role: "customer",
  },
];

const products = [
  {
    name: "Aurora Desk Lamp",
    description:
      "Skulptūriškas stalo šviestuvas su šilta, minkšta šviesa ramesniam darbo kampui.",
    price: 89.9,
    category: "Namai",
    images: [
      "/stilloak/collection/budget-clarity.svg",
    ],
    stock: 18,
    featured: true,
  },
  {
    name: "Studio Headphones X2",
    description:
      "Belaidės ausinės su aktyviu triukšmo slopinimu ir švariu, giliu garsu.",
    price: 159,
    category: "Technika",
    images: [
      "/stilloak/collection/ai-summaries.svg",
    ],
    stock: 24,
    featured: true,
  },
  {
    name: "Atlas Carry Backpack",
    description:
      "Kasdienė kuprinė su paminkštintu kompiuterio skyriumi ir vandeniui atspariu audiniu.",
    price: 74.5,
    category: "Aksesuarai",
    images: [
      "/stilloak/collection/recurring-flow.svg",
    ],
    stock: 32,
    featured: false,
  },
  {
    name: "Linen Relax Set",
    description:
      "Lengvas lininis komplektas namams, sukurtas komfortui ir santūriam stiliui.",
    price: 64.9,
    category: "Apranga",
    images: [
      "/stilloak/collection/private-archive.svg",
    ],
    stock: 27,
    featured: true,
  },
  {
    name: "Stoneware Brew Kit",
    description:
      "Keraminis kavos rinkinys ramiam rytui: puodelis, filtras ir matavimo šaukštelis.",
    price: 54,
    category: "Virtuvė",
    images: [
      "/stilloak/collection/goal-pace.svg",
    ],
    stock: 14,
    featured: false,
  },
  {
    name: "Motion Sneakers",
    description:
      "Universalūs sportbačiai su minkštu padu ir kvėpuojančiu viršumi aktyviai dienai.",
    price: 119,
    category: "Avalynė",
    images: [
      "/stilloak/collection/monthly-rhythm.svg",
    ],
    stock: 21,
    featured: true,
  },
  {
    name: "Calm Home Poster Bundle",
    description:
      "Šiltas spausdinamų sienos darbų rinkinys ramesniems namams, paruoštas keliems rėminimo formatams.",
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

const seedDatabase = async () => {
  try {
    await connectDatabase();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    await User.create(users);
    await Product.insertMany(products);

    console.log("Demo duomenys sėkmingai įrašyti.");
    process.exit(0);
  } catch (error) {
    console.error("Seed klaida:", error.message);
    process.exit(1);
  }
};

seedDatabase();
