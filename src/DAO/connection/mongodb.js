const config = require("dotenv").config();
const MongoDBConnection = require("./constructor");
const mongoose = require("mongoose");
const logger = require("../../logs/logger.js");

mongoose.set("strictQuery", true);
async function connection() {
  try {
    const mongoDBConnection = await MongoDBConnection.getInstance(process.env.MONGO_URI);
    const connection = mongoDBConnection.getConnection();
  } catch (error) {
    logger.warn(error);
    throw "can not connect to the db";
  }
}

module.exports = {
  connectionMDB: connection(),
};
