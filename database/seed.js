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
    name: "StillOak šiltos šviesos stalo šviestuvas",
    description:
      "Skulptūriškas fizinis šviestuvas darbo stalui, skaitymo kampui ar miegamojo zonai. Klientas gauna švelnaus apšvietimo akcentą, kuris padeda sukurti ramesnę, labiau sutelktą erdvę.",
    price: 89.9,
    category: "Namai",
    images: [
      "/stilloak/collection/budget-clarity.svg",
    ],
    stock: 18,
    featured: true,
  },
  {
    name: "StillOak Focus belaidės ausinės",
    description:
      "Belaidės ausinės darbui, mokymuisi ir tyliam kasdieniam ritmui. Klientas gauna patogų garso aksesuarą su triukšmo slopinimu, kuris padeda lengviau susikaupti namuose ar kelionėje.",
    price: 159,
    category: "Technika",
    images: [
      "/stilloak/collection/ai-summaries.svg",
    ],
    stock: 24,
    featured: true,
  },
  {
    name: "StillOak kasdienė darbo kuprinė",
    description:
      "Fizinė kuprinė darbui, studijoms ir miesto dienoms. Klientas gauna talpų kasdienį aksesuarą su paminkštintu kompiuterio skyriumi ir vandeniui atspariu audiniu, kad svarbiausi daiktai keliautų tvarkingai.",
    price: 74.5,
    category: "Aksesuarai",
    images: [
      "/stilloak/collection/recurring-flow.svg",
    ],
    stock: 32,
    featured: false,
  },
  {
    name: "StillOak lininis namų komplektas",
    description:
      "Lengvas lininis komplektas ramiems rytams, darbui iš namų ir lėtesniems vakarams. Klientas gauna santūrų fizinį aprangos rinkinį, kuris sujungia komfortą, natūralią tekstūrą ir tvarkingą namų estetiką.",
    price: 64.9,
    category: "Apranga",
    images: [
      "/stilloak/collection/private-archive.svg",
    ],
    stock: 27,
    featured: true,
  },
  {
    name: "StillOak keraminis kavos ritualo rinkinys",
    description:
      "Keraminis kavos rinkinys žmogui, kuris nori ramesnio rytinio ritualo. Klientas gauna puodelį, filtrą ir matavimo šaukštelį, kad kasdienė kava taptų aiškesne, gražesne pauze.",
    price: 54,
    category: "Virtuvė",
    images: [
      "/stilloak/collection/goal-pace.svg",
    ],
    stock: 14,
    featured: false,
  },
  {
    name: "StillOak lengvi miesto sportbačiai",
    description:
      "Universalūs fiziniai sportbačiai aktyviai miesto dienai, kelionei ar lengvam savaitgalio ritmui. Klientas gauna minkštą padą ir kvėpuojantį viršų, kad judėjimas išliktų patogus ir santūriai stilingas.",
    price: 119,
    category: "Avalynė",
    images: [
      "/stilloak/collection/monthly-rhythm.svg",
    ],
    stock: 21,
    featured: true,
  },
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
