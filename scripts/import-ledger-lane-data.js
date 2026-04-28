const fs = require("fs");
const path = require("path");

const dotenv = require("dotenv");

const connectDatabase = require("../database/connect");
const User = require("../server/models/User");
const SavingsEntry = require("../server/models/SavingsEntry");

dotenv.config({ path: path.resolve(__dirname, "..", "server", ".env") });

const CATEGORY_MAP = {
  Housing: "Būstas",
  Food: "Maistas",
  Transport: "Transportas",
  Health: "Sveikata",
  Shopping: "Apsipirkimas",
  Bills: "Sąskaitos",
  Travel: "Kelionės",
  Entertainment: "Pramogos",
  Other: "Kita",
};

const DEFAULT_SOURCE_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "New project 2",
  "server",
  "data",
  "store.json"
);

const getArgValue = (flag) => {
  const argument = process.argv.find((entry) => entry.startsWith(`${flag}=`));
  return argument ? argument.slice(flag.length + 1).trim() : "";
};

const hasFlag = (flag) => process.argv.includes(flag);

const printUsage = () => {
  console.log(`
Naudojimas:
  npm run import:savings
  npm run import:savings -- --target-email=tavo@email.com
  npm run import:savings -- --source="C:\\kelias\\store.json" --target-email=tavo@email.com
  npm run import:savings -- --dry-run

Paaiškinimas:
  --target-email   priverstinai sukelia visas senas išlaidas į vieną dabartinę paskyrą
  --source         nurodo kitą store.json kelią
  --dry-run        nieko nerašo į DB, tik parodo kas būtų importuota
`);
};

const resolveSourcePath = () => {
  const provided = getArgValue("--source");
  return provided ? path.resolve(provided) : DEFAULT_SOURCE_PATH;
};

const mapCategory = (legacyCategory) => CATEGORY_MAP[legacyCategory] || "Kita";

const loadLegacyStore = (sourcePath) => {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Legacy duomenų failas nerastas: ${sourcePath}`);
  }

  return JSON.parse(fs.readFileSync(sourcePath, "utf8"));
};

const buildUserMap = (legacyStore) =>
  new Map((legacyStore.users || []).map((user) => [user.id, user]));

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

async function run() {
  if (hasFlag("--help")) {
    printUsage();
    return;
  }

  const sourcePath = resolveSourcePath();
  const dryRun = hasFlag("--dry-run");
  const forcedTargetEmail = normalizeEmail(getArgValue("--target-email"));

  await connectDatabase();

  const legacyStore = loadLegacyStore(sourcePath);
  const legacyUserMap = buildUserMap(legacyStore);
  const currentUsers = await User.find().select("_id email name");
  const currentUserByEmail = new Map(currentUsers.map((user) => [normalizeEmail(user.email), user]));
  const forcedTargetUser = forcedTargetEmail ? currentUserByEmail.get(forcedTargetEmail) : null;

  if (forcedTargetEmail && !forcedTargetUser) {
    throw new Error(`Dabartinėje sistemoje nerasta paskyra su email: ${forcedTargetEmail}`);
  }

  const summary = {
    scanned: 0,
    imported: 0,
    skippedDuplicate: 0,
    skippedMissingUser: 0,
    skippedMissingLegacyUser: 0,
  };

  for (const legacyExpense of legacyStore.expenses || []) {
    summary.scanned += 1;

    const legacyUser = legacyUserMap.get(legacyExpense.userId);

    if (!legacyUser) {
      summary.skippedMissingLegacyUser += 1;
      continue;
    }

    const targetUser = forcedTargetUser || currentUserByEmail.get(normalizeEmail(legacyUser.email));

    if (!targetUser) {
      summary.skippedMissingUser += 1;
      continue;
    }

    const existing = await SavingsEntry.findOne({
      user: targetUser._id,
      "importSource.system": "ledger-lane",
      "importSource.entryId": legacyExpense.id,
    }).select("_id");

    if (existing) {
      summary.skippedDuplicate += 1;
      continue;
    }

    if (!dryRun) {
      await SavingsEntry.create({
        user: targetUser._id,
        title: legacyExpense.title,
        amount: Number(legacyExpense.amount),
        category: mapCategory(legacyExpense.category),
        date: legacyExpense.date,
        notes: legacyExpense.notes || "",
        createdAt: legacyExpense.createdAt || new Date().toISOString(),
        updatedAt: legacyExpense.updatedAt || legacyExpense.createdAt || new Date().toISOString(),
        importSource: {
          system: "ledger-lane",
          entryId: legacyExpense.id,
        },
      });
    }

    summary.imported += 1;
  }

  console.log("\nLedger Lane import summary");
  console.log("--------------------------");
  console.log(`Source file: ${sourcePath}`);
  console.log(`Dry run: ${dryRun ? "taip" : "ne"}`);
  console.log(`Scanned: ${summary.scanned}`);
  console.log(`Imported: ${summary.imported}`);
  console.log(`Skipped duplicates: ${summary.skippedDuplicate}`);
  console.log(`Skipped missing current user: ${summary.skippedMissingUser}`);
  console.log(`Skipped missing legacy user: ${summary.skippedMissingLegacyUser}`);

  if (!summary.imported && summary.skippedMissingUser) {
    console.log("\nPatarimas:");
    console.log(
      "  Jei seni testiniai email nesutampa su tavo dabartine paskyra, naudok --target-email=tavo@email.com"
    );
  }
}

run()
  .catch((error) => {
    console.error("\nImportas nepavyko:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
    } catch (_error) {
      // ignore
    }
  });
