const email = require("../notification/emails.js");
const logger = require("../logs/logger.js");
const Usuarios = require("../models/userSchema.js");
const whatsapp = require("../notification/whatsapp.js");

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
  logger.log("info", req.session.username + " login");
  res.redirect("/");
};

const renderizar = (req, res, next) => {
  res.render("logout");
  next();
};

const logout = (req, res) => {
  const nombre = req.session.nombre;
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
  // email("nuevo registro", JSON.stringify(req.body));
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

const buyCart = (req, res) => {
  const listado = cartItems;
  const total = req.body.total;
  console.log(listado);
  console.log(total);
  res.redirect("/");
  // whatsapp("S")
};
module.exports = {
  home,
  getLogin,
  postLogin,
  renderizar,
  logout,
  getSignIn,
  postSignIn,
  buyCart,
};
