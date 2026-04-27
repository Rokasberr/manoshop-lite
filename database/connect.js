const mongoose = require("mongoose");

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI nerastas. Patikrink server/.env failą.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB prijungta: ${mongoose.connection.host}`);
};

module.exports = connectDatabase;

