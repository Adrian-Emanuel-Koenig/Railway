const { Router } = require("express");
const passport = require("../Middleware/passport.js");
const router = new Router();
const routes = require("../Controller/router.js");

router.get("/", routes.home);
router.get("/login", routes.getLogin);
router.get("/signup", routes.getSignIn);
/* -------------------------------- Passport -------------------------------- */
// router.post("/login", passport.authenticate("login", { failureRedirect: "/failureLogin" }), routes.postLogin);
// router.post("/signup", passport.authenticate("signup", { failureRedirect: "/failureSignin" }), routes.postSignIn);
/* ----------------------------------- DAO ---------------------------------- */
router.post("/login", routes.postLogin);
router.post("/signup", routes.postSignIn);
/* -------------------------------------------------------------------------- */
router.get("/failureLogin", routes.failureLogin);
router.get("/failureSignin", routes.failureSignin);
router.get("/logout", routes.renderizar, routes.logout);
router.post("/add-to-cart", routes.addToCart);
router.get("/cart", routes.getCart);
router.post("/comprar", routes.postCart);
router.post("/vaciar", routes.clearCart);
router.use("/api/nombre", routes.sessionName);
module.exports = router
