import mongoose from "mongoose";
import { getConfig } from "./config.js";

let connectionPromise;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const { mongoUri, mongoDbName } = getConfig();

  if (!mongoUri) {
    throw Object.assign(new Error("Database is not configured."), { statusCode: 503 });
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(mongoUri, {
        dbName: mongoDbName || undefined,
        serverSelectionTimeoutMS: 7000,
        maxPoolSize: 8
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
  return mongoose.connection;
};
