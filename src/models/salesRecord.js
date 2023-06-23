const { Schema, model } = require("mongoose");

const salesSchema = new Schema({
  saleRef: { type: String, required: true },
  dateTransact: { type: Date, required: true },
  totalAmount: { type: String, required: true },
  profit: { type: Number, required: true },
});

const schema = model("SaleRecord", salesSchema);

module.exports = schema;
