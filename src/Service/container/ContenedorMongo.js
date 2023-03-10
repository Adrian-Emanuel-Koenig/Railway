const model = require("../../DAO/models/products.js");
const modelMsgs = require("../../DAO/models/messages.js");
const logger = require("../../logs/logger.js");

class ContenedorMongo {
  constructor(collection) {
    this.collection = collection;
  }

  async save(obj) {
    try {
      if (this.collection == model) {
        const item = new model(obj);
        const productoNuevo = await item.save();
        return productoNuevo;
      } else {
        const item = new modelMsgs(obj);
        const author = await item.save();
        return author;
      }
    } catch (error) {
      throw logger.error(error);
    }
  }

  async getAll() {
    try {
      return await this.collection.find();
    } catch (error) {
      logger.error(error);
    }
  }

  async readObject(id) {
    try {
      return await this.collection.findOne(id);
    } catch (error) {
      logger.error(error);
    }
  }
}

module.exports = ContenedorMongo;
