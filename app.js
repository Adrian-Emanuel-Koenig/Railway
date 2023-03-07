const express = require("express");
const connectionMDB = require("./src/DAO/connection/mongodb.js").connectionMDB;
const engine = require("express-handlebars").engine;
const Server = require("socket.io").Server;
const http = require("http");
const productos = require("./src/DAO/controllers/products.js").productos;
const mensajes = require("./src/DAO/controllers/products.js").mensajes;

const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const minimist = require("minimist");
const compression = require("compression");
const logger = require("./src/logs/logger.js");
const router = require("./src/Router/router.js");

const args = minimist(process.argv.slice(2));
const app = express();
const port = args.p;

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
app.use(express.static(__dirname + "/src/View/public"));

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
app.use("/", router);

app.set("view engine", "hbs");
app.set("views", "./src/View/views");
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/src/View/views/layouts",
    partialsDir: __dirname + "/src/View/views/partials",
  })
);
app.enable("trust proxy");

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
