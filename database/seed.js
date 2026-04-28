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
      "Skulptūriškas stalo šviestuvas su šilta šviesa, puikiai tinkantis moderniam darbo kampui.",
    price: 89.9,
    category: "Home",
    images: [
      "/stilloak/collection/budget-clarity.svg",
    ],
    stock: 18,
    featured: true,
  },
  {
    name: "Studio Headphones X2",
    description:
      "Belaidės ausinės su aktyviu triukšmo slopinimu ir giliu, švariu garsu.",
    price: 159,
    category: "Tech",
    images: [
      "/stilloak/collection/ai-summaries.svg",
    ],
    stock: 24,
    featured: true,
  },
  {
    name: "Atlas Carry Backpack",
    description:
      "Kasdienė kuprinė su paminkštintu skyriumi nešiojamam kompiuteriui ir vandeniui atspariu audiniu.",
    price: 74.5,
    category: "Accessories",
    images: [
      "/stilloak/collection/recurring-flow.svg",
    ],
    stock: 32,
    featured: false,
  },
  {
    name: "Linen Relax Set",
    description:
      "Lengvas lininis namų drabužių komplektas, skirtas komfortui ir minimalistiniam stiliui.",
    price: 64.9,
    category: "Fashion",
    images: [
      "/stilloak/collection/private-archive.svg",
    ],
    stock: 27,
    featured: true,
  },
  {
    name: "Stoneware Brew Kit",
    description:
      "Keraminis kavos paruošimo rinkinys su puodeliu, filtru ir matavimo šaukšteliu.",
    price: 54,
    category: "Kitchen",
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
    category: "Footwear",
    images: [
      "/stilloak/collection/monthly-rhythm.svg",
    ],
    stock: 21,
    featured: true,
  },
  {
    name: "Calm Home Poster Bundle",
    description:
      "10 minimalist printable pieces for a calmer, warmer home. Instant digital download in multiple frame-ready sizes.",
    price: 24,
    category: "Digital Products",
    productType: "digital",
    images: [
      "/stilloak/collection/digital-bundle.svg",
    ],
    stock: 0,
    featured: true,
    digitalAsset: {
      storagePath: "posters/calm-home-poster-bundle-guide.pdf",
      fileName: "calm-home-poster-bundle-guide.pdf",
      downloadLabel: "Atsisiųsti poster bundle",
      mimeType: "application/pdf",
    },
  },
  {
    name: "The Atelier Living Room Guide",
    description:
      "A premium digital guide to layout, palette, texture, and styling choices that make your living room feel calmer and more elevated.",
    price: 29,
    category: "Digital Products",
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
      "A calm digital planner for weekly resets, self-care rituals, reflection, and more intentional routines.",
    price: 16,
    category: "Digital Products",
    productType: "digital",
    images: [
      "/stilloak/collection/monthly-rhythm.svg",
    ],
    stock: 0,
    featured: false,
    digitalAsset: {
      storagePath: "planners/sunday-reset-ritual-planner.pdf",
      fileName: "sunday-reset-ritual-planner.pdf",
      downloadLabel: "Atsisiųsti plannerį",
      mimeType: "application/pdf",
    },
  },
  {
    name: "Home Edit Bundle",
    description:
      "A premium two-part digital set that combines the Calm Home Poster Bundle with The Atelier Living Room Guide for a quiet but practical room refresh.",
    price: 39,
    category: "Digital Products",
    productType: "digital",
    images: [
      "/stilloak/collection/digital-bundle.svg",
    ],
    stock: 0,
    featured: true,
    digitalAsset: {
      storagePath: "bundles/home-edit-bundle.pdf",
      fileName: "home-edit-bundle.pdf",
      downloadLabel: "Atsisiųsti Home Edit Bundle",
      mimeType: "application/pdf",
    },
  },
  {
    name: "Calm Living Bundle",
    description:
      "The full three-part digital collection with printable wall art, an interior styling guide, and the Sunday Reset planner in one higher-value bundle.",
    price: 49,
    category: "Digital Products",
    productType: "digital",
    images: [
      "/stilloak/collection/private-archive.svg",
    ],
    stock: 0,
    featured: true,
    digitalAsset: {
      storagePath: "bundles/calm-living-bundle.pdf",
      fileName: "calm-living-bundle.pdf",
      downloadLabel: "Atsisiųsti Calm Living Bundle",
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
