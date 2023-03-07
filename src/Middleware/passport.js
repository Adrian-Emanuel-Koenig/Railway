// const bcrypt = require("bcrypt-nodejs");
const logger = require("../logs/logger.js");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { Strategy } = require("passport-local");
const Usuarios = require("../DAO/models/users.js");

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

module.exports = passport;
