const { config } = require("dotenv").config();
const MemoryCrud = require("../../Service/container/memory");
const MongoCrud = require("../../Service/container/mongodb");
const userSchema = require("../models/users.js");

let User;
let mode = process.env.DB;

if (mode == "mongo") {
  console.log("DB: mongo");
  class UserDaosModel extends MongoCrud {
    constructor() {
      super(userSchema);
    }
  }
  User = new UserDaosModel();
}

if (mode == "memory") {
  console.log("DB: memory");
  class UserDaosModel extends MemoryCrud {
    constructor() {
      super(userSchema);
    }
  }
  User = new UserDaosModel();
}

if (!mode) {
  throw new Error("No database Selected");
}

module.exports = User;
