const { Schema, model } = require("mongoose");

const incrementOnSaleSchema = new Schema({
  refIdNo: { type: Number, required: true },
  name: { type: String, required: true },
});

const schema = model("incrementOnsale", incrementOnSaleSchema);

module.exports = schema;
