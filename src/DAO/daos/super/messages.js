const ContenedorMongo = require("../../../Service/container/ContenedorMongo.js");
const msgSchema = require("../../models/messages.js");

class MensajesDaoMongoDB extends ContenedorMongo {
  constructor() {
    super(msgSchema);
  }
}

module.exports = MensajesDaoMongoDB;
