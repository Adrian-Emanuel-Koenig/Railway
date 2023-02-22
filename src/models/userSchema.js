const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new Schema({
  name: { type: String, required: true, max: 20 },
  surname: { type: String, required: true, max: 20 },
  age: { type: Number, required: true, min: 0, max: 100 },
  address: { type: String, required: true, max: 100 },
  number: { type: Number, required: true, min: 0},
  avatar: { type: String, required: true },
  username: { type: String, required: true, max: 30 },
  password: { type: String, required: true, max: 30 },
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model("usuarios", userSchema);
