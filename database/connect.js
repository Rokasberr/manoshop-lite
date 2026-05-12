const mongoose = require("mongoose");

const DEFAULT_DATABASE_NAME = "manoshop";

const getDatabaseNameFromUri = (mongoUri) => {
  try {
    const parsedUri = new URL(mongoUri);
    const pathDatabaseName = parsedUri.pathname.replace(/^\/+/, "").split("/")[0];

    return pathDatabaseName || "";
  } catch (_error) {
    return "";
  }
};

const resolveDatabaseName = (mongoUri) =>
  process.env.MONGO_DB_NAME || getDatabaseNameFromUri(mongoUri) || DEFAULT_DATABASE_NAME;

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI nerastas. Patikrink server/.env faila.");
  }

  const databaseName = resolveDatabaseName(process.env.MONGO_URI);

  await mongoose.connect(process.env.MONGO_URI, { dbName: databaseName });
  console.log(`MongoDB prijungta: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

module.exports = connectDatabase;
