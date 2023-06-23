const mongoose = require("mongoose");

const pulloutSchema = mongoose.Schema({
  productID: { type: String, required: true },
  productName: { type: String, required: true },
  stockRemaining: { type: Number, required: true },
  pulloutQty: { type: Number, required: true },
  newStock: { type: Number, required: true },
  pulloutReason: { type: String, required: true },
  date: { type: Date, required: true },
});

const model = mongoose.model("Pullout", pulloutSchema);

module.exports = model;
