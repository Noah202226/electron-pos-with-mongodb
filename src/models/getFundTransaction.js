const { Schema, model } = require("mongoose");

const getFundSchema = new Schema({
  dateTransact: { type: Date, required: true },
  reason: { type: String, required: true },
  amount: { type: Number, required: true },
  lastRemainingValueOfProduct: { type: Number, required: true },
  lastTotalSales: { type: Number, required: true },
  lastOverAll: { type: Number, required: true },
});

const schema = model("getFundTransaction", getFundSchema);

module.exports = schema;
