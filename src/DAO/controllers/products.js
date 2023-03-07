const ProductosDaoMongoDB = require("../daos/super/products.js");
const MensajesDaoMongoDB = require("../daos/super/messages.js");

const productos = new ProductosDaoMongoDB();
const mensajes = new MensajesDaoMongoDB();

module.exports = { productos, mensajes };
