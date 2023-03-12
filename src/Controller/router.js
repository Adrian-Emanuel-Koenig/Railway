const email = require("../Service/notification/emails.js");
const logger = require("../logs/logger.js");
const Usuarios = require("../DAO/models/users.js");
const whatsapp = require("../Service/notification/whatsapp.js");
const User = require("../DAO/daos/users.js");
let cartItems = [];

const home = (req, res) => {
  if (req.session?.username) {
    res.render("home", { username: req.session?.username });
  } else {
    res.redirect("/login");
  }
};

const getLogin = (req, res) => {
  res.render("login", { login: true });
};

const postLogin = (req, res) => {
  req.session.username = req.body.username;
  if (User.read(req.body.username)) {
    logger.log("info", req.session.username + " login");
    res.redirect("/");
  } else {
    res.render("login", { login: true });
  }
};

const renderizar = (req, res, next) => {
  res.render("logout");
  next();
};

const logout = (req, res) => {
  cartItems = [];
  const nombre = req.session.nombre;
  console.log(cartItems);
  setTimeout(() => {
    req.session.destroy((err) => {
      if (err) {
        logger.error("Error al desloguear");
      } else {
        logger.info(nombre + " deslogueado");
      }
    });
  }, 2000);
};

const getSignIn = (req, res) => {
  res.render("signup");
};

const postSignIn = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const avatar = req.body.avatar;
  const name = req.body.name;
  const surname = req.body.surname;
  const age = req.body.age;
  const address = req.body.address;
  const number = req.body.number;
  logger.info(username + " Registrado");
  /* ------------------------------ Sin Passport ------------------------------ */
  User.create({
    username,
    password,
    avatar,
    name,
    surname,
    age,
    address,
    number,
  });
  /* -------------------------------------------------------------------------- */
  email("nuevo registro", JSON.stringify(req.body));
  res.render("login", {
    username,
    password,
    avatar,
    name,
    surname,
    age,
    address,
    number,
  });
};

const failureLogin = (req, res) => {
  res.render("failureLogin");
};

const failureSignin = (req, res) => {
  res.render("failureSignin");
};

const info = (req, res) => {
  res.json({
    "Nombre de la plataforma": process.platform,
    "Argumentos de entrada": process.argv,
    "Carpeta del proyecto": process.execPath,
    "Process id": process.pid,
    "Path de ejecución": process.cwd(),
    "Memoria total reservada": process.memoryUsage().rss,
    "Versión de node.js": process.version,
  });
};

const addToCart = (req, res) => {
  const { name, stock, price } = req.body;
  const product = {
    name,
    stock,
    price: parseFloat(price),
    quantity: 1,
  };
  console.log(product);
  const existingProductIndex = cartItems.findIndex(
    (item) => item.name === product.name
  );
  if (existingProductIndex !== -1) {
    cartItems[existingProductIndex].quantity++;
  } else {
    cartItems.push(product);
  }
  res.redirect("/");
};

const getCart = (req, res) => {
  console.log(cartItems);
  const total = cartItems.reduce(
    (acc, curr) => acc + curr.quantity * curr.price,
    0
  );
  res.render("cart", { cartItems, total });
};

const postCart = (req, res) => {
  const total = req.body.total;
  whatsapp(
    "Orden realizada, total a pagar: $" +
      total +
      ".Productos: " +
      JSON.stringify(cartItems)
  );
  email(
    "nuevo pedido de",
    JSON.stringify(cartItems) + "Total a pagar: " + total
  );
  res.redirect("/");
};

const clearCart = (req, res) => {
  cartItems = [];
  res.redirect("/");
};

const sessionName = (req, res) => {
  res.json(req.session.username);
};
module.exports = {
  home,
  getLogin,
  postLogin,
  renderizar,
  logout,
  getSignIn,
  postSignIn,
  failureLogin,
  failureSignin,
  info,
  addToCart,
  cartItems,
  getCart,
  postCart,
  clearCart,
  sessionName,
};
