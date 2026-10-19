const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const initDB = async () => {
  await Listing.deleteMany({});
  console.log("data deleted");

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6ad13dd865bc26ce6b32246f",
  }));

  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connection made successfully to db");

  await initDB();

  await mongoose.connection.close();
}

main().catch((err) => {
  console.log("facing error:", err);
});