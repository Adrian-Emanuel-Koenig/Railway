const ContenedorMongo = require("../../../Service/container/ContenedorMongo.js");
const productosSchema = require("../../models/products.js");

class ProductosDaoMongoDB extends ContenedorMongo {
  constructor() {
    super(productosSchema);
  }
}

module.exports = ProductosDaoMongoDB;
