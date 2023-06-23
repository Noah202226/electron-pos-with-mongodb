const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  barcode: { type: Number, required: true },
  productRef: { type: String, required: true },
  productName: { type: String, required: true },
  productExpiry: { type: Date, required: true },
  productCos: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  StockRemaining: { type: Number, required: true },
  startStock: { type: Number, required: true },
  sold: { type: Number },
  pullout: { type: Number },
  add: { type: Number },
});

const schema = model("Product", productSchema);

module.exports = schema;
