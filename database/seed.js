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
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
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
