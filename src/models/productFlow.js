const mongoose = require("mongoose");

const productFlowSchema = mongoose.Schema({
  productRef: { type: String, required: true },
  productName: { type: String, required: true },
  status: { type: String, required: true },
  qty: { type: Number, required: true },
  remaining: { type: Number, required: true },
  date: { type: Date, required: true },
});

const model = mongoose.model("productFlow", productFlowSchema);

module.exports = model;
