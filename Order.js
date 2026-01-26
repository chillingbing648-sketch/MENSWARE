const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  product: String,
  amount: Number,
  transactionId: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
