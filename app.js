const express = require("express");
const connectionMDB = require("./src/connection/mongodb.js").connectionMDB;
const { dirname, format } = require("path");
const { fileURLToPath } = require("url");
const engine = require("express-handlebars").engine;
const Router = require("express").Router;
const Server = require("socket.io").Server;
const http = require("http");
const productos = require("./src/controllers/products.js").productos;
const mensajes = require("./src/controllers/products.js").mensajes;
const { normalize, schema } = require("normalizr");
const faker = require("@faker-js/faker");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const Usuarios = require("./src/models/userSchema.js");
const bcrypt = require("bcrypt");
const routes = require("./src/routes/routes.js");
const minimist = require("minimist");
const { fork } = require("child_process");
const compression = require("compression");
const logger = require("./src/logs/logger.js");
const whatsapp = require("./src/notification/whatsapp.js");
const email = require("./src/notification/emails.js");
const { product, price, image } = faker;

const args = minimist(process.argv.slice(2));
const app = express();
const port = args.p;
// const __dirname = dirname(fileURLToPath(import.meta.url));

const server = http.createServer(app);
const io = new Server(server);

/* -------------------------------------------------------------------------- */
/*                                   Server                                   */
/* -------------------------------------------------------------------------- */

server.listen(port, async () => {
  await connectionMDB;
  logger.info("Server on: http://localhost:" + port);
});

app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/src/public"));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://Koenig:24042503@coderhouse.haylz8i.mongodb.net/usuario?retryWrites=true&w=majority",
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    }),

    secret: "secreto",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 60000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "hbs");
app.set("views", "./src/views");
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/src/views/layouts",
    partialsDir: __dirname + "/src/views/partials",
  })
);
app.enable("trust proxy");

app.use("/api/productos", Router);

// app.use("/api/productos-test", (req, res) => {
//   res.render("cart");
// });

app.use("/api/nombre", (req, res) => {
  res.json(req.session.username);
});

/* -------------------------------------------------------------------------- */
/*                                    Fork                                    */
/* -------------------------------------------------------------------------- */

let visitas = 0;

app.get("/api/randoms/", (req, res) => {
  const computo = fork("./computo.js");

  computo.send({
    mensaje: "start",
    cantidad: 100000000,
  });

  computo.on("message", (msg) => {
    res.json(msg);
  });
});

app.get("/api/randoms/:cant", (req, res) => {
  const { cant } = req.params;
  const computo = fork("./computo.js");

  computo.send({
    mensaje: "start",
    cantidad: cant,
  });

  computo.on("message", (msg) => {
    res.json(msg);
  });
});

/* -------------------------------------------------------------------------- */
/*                                    Rutas                                   */
/* -------------------------------------------------------------------------- */
// app.get("/", (req, res) => {
//   res.end("Ok " + ++visitas);
// });
app.get("/", routes.home);

app.get("/login", routes.getLogin);
app.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/failureLogin" }),
  routes.postLogin
);
app.get("/logout", routes.renderizar, routes.logout);
app.get("/signup", routes.getSignIn);
app.post(
  "/signup",
  passport.authenticate("signup", { failureRedirect: "/failureSignin" }),
  routes.postSignIn
);
app.get("/failureLogin", (req, res) => {
  res.render("failureLogin");
});
app.get("/failureSignin", (req, res) => {
  res.render("failureSignin");
});

app.get("/info", compression(), (req, res) => {
  res.json({
    "Nombre de la plataforma": process.platform,
    "Argumentos de entrada": process.argv,
    "Carpeta del proyecto": process.execPath,
    "Process id": process.pid,
    "Path de ejecución": process.cwd(),
    "Memoria total reservada": process.memoryUsage().rss,
    "Versión de node.js": process.version,
  });
});

/* -------------------------------------------------------------------------- */
/*                                   Carrito                                  */
/* -------------------------------------------------------------------------- */
let cartItems = [];

app.post("/add-to-cart", (req, res) => {
  const { name, stock, price } = req.body;
  const product = {
    name,
    stock,
    price: parseFloat(price),
    quantity: 1,
  };
  console.log(product);
  // Verificar si el producto ya está en el carrito
  const existingProductIndex = cartItems.findIndex(
    (item) => item.name === product.name
  );
  if (existingProductIndex !== -1) {
    // Si el producto ya está en el carrito, aumentar su cantidad
    cartItems[existingProductIndex].quantity++;
  } else {
    // Si el producto no está en el carrito, agregarlo
    cartItems.push(product);
  }

  res.redirect("/");
});

app.get("/api/productos-test", (req, res) => {
  const total = cartItems.reduce(
    (acc, curr) => acc + curr.quantity * curr.price,
    0
  );
  res.render("cart", { cartItems, total });
});

app.post("/comprar", (req, res) => {
  const total = req.body.total;
  whatsapp(
    "Orden realizada, total a pagar: $" + total +
    ".Productos: " + JSON.stringify(cartItems)
  );
  email("nuevo pedido de", JSON.stringify(cartItems)  + "Total a pagar: " + total);
  res.redirect("/");
});
app.post("/vaciar", (req, res) => {
  cartItems = [];
  res.redirect("/");
});
/* -------------------------------------------------------------------------- */
/*                                  Passport                                  */
/* -------------------------------------------------------------------------- */

function isValidPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}
function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

passport.use(
  "login",
  new Strategy((username, password, done) => {
    Usuarios.findOne({ username }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        logger.warn("User Not Found with username " + username);
        return done(null, false);
      }

      if (!isValidPassword(user, password)) {
        logger.error("Invalid Password");
        return done(null, false);
      }

      return done(null, user);
    });
  })
);

passport.use(
  "signup",
  new Strategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      Usuarios.findOne({ username: username }, function (err, user) {
        if (err) {
          logger.error("Error in SignUp: " + err);
          return done(err);
        }

        if (user) {
          logger.warn("User already exists");
          return done(null, false);
        }

        const newUser = {
          username: username,
          password: createHash(password),
          name: req.body.name,
          surname: req.body.surname,
          age: req.body.age,
          address: req.body.address,
          number: req.body.number,
          avatar: req.body.avatar,
          products: [],
        };
        logger.log(newUser);
        Usuarios.create(newUser, (err, userWithId) => {
          if (err) {
            logger.error("Error in Saving user: " + err);
            return done(err);
          }
          logger.info(user);
          logger.info("User Registration succesful");
          return done(null, userWithId);
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  Usuarios.findById(id, done);
});

/* -------------------------------------------------------------------------- */
/*                                Normalización                               */
/* -------------------------------------------------------------------------- */

const authorSchema = new schema.Entity("authors", {}, { idAttribute: "email" });
const messageSchema = new schema.Entity("messages", { author: authorSchema });
const chatSchema = new schema.Entity("chats", { messages: [messageSchema] });
const normalizarData = (data) => {
  const dataNormalizada = normalize(
    { id: "chatHistory", messages: data },
    chatSchema
  );
  return dataNormalizada;
};
const normalizarMensajes = async () => {
  const messages = await mensajes.getAll();
  console.log(messages);
  const normalizedMessages = normalizarData(messages);
  console.log(JSON.stringify(normalizedMessages, null, 4));

  return normalizedMessages;
};

/* -------------------------------------------------------------------------- */
/*                                  Socket.io                                 */
/* -------------------------------------------------------------------------- */

io.on("connection", async (socket) => {
  const products = await productos.getAll();
  socket.emit("allProducts", products);
  socket.on("msg", async (data) => {
    const today = new Date();
    const now = today.toLocaleString();
    await mensajes.save({ timestamp: now, ...data });
    io.sockets.emit("msg-list", await mensajes.getAll());
    io.sockets.emit("msg-list2", await normalizarMensajes());
  });

  socket.on("productoEnviado", saveProduct);
});

async function saveProduct(data) {
  await productos.save(data);
  productos.getAll().then((element) => io.sockets.emit("allProducts", element));
}
