const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

const connectDatabase = require("./connect");
const Product = require("../server/models/Product");

const digitalProducts = [
  {
    name: "Calm Home Poster Bundle",
    description:
      "A curated printable wall art bundle with warm neutrals, abstract forms, and quiet typography for a calmer, more elevated home.",
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
