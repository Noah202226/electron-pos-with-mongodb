const { Schema, model } = require("mongoose");

const saleItemizedSchema = new Schema({
  productRef: { type: Number, required: true },
  quantityOfOrder: { type: Number, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  profit: { type: Number, required: true },
});

const schema = model("SaleItemized", saleItemizedSchema);

module.exports = schema;
