const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  uname: { type: String, required: true },
  upass: { type: String, required: true },
});

const schema = model("User", userSchema);

module.exports = schema;
