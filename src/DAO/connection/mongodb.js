const config = require("dotenv").config;
config();

const mongoose = require("mongoose");
const logger = require("../../logs/logger.js");
const connect = mongoose.connect;

mongoose.set("strictQuery", true);

async function connection() {
  try {
    await connect(process.env.MONGO_URI)
      .then(() => logger.info("Connected to MongoDB Atlas"))
      .catch((error) => logger.error(error));
  } catch (error) {
    logger.warn(error);
    throw "can not connect to the db";
  }
}

module.exports = {
  connectionMDB: connection(),
};
