const mongoose = require("mongoose");
const logger = require("../../logs/logger.js");

class MongoDBConnection {
  constructor(uri) {
    this.uri = uri;
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info("Connected to MongoDB Atlas");
    } catch (err) {
      logger.error(err);
      throw new Error("Failed to connect to MongoDB Atlas");
    }
  }

  getConnection() {
    return this.connection;
  }

  static async getInstance(uri) {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection(uri);
      await MongoDBConnection.instance.connect();
    }
    return MongoDBConnection.instance;
  }
}

module.exports = MongoDBConnection