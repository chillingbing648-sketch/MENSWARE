const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: { type: String, required: true }, sku: { type: String, default: null }, image: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 }, unitPrice: { type: Number, required: true, min: 0 }, totalPrice: { type: Number, required: true, min: 0 }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullName: String, phone: String, addressLine1: String, addressLine2: String, city: String, state: String,
  postalCode: String, country: { type: String, default: "India" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  customer: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: null }
  },
  items: { type: [orderItemSchema], required: true, validate: items => items.length > 0 },
  shippingAddress: { type: addressSchema, required: true },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, min: 0, default: 0 },
  tax: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  payment: {
    method: { type: String, enum: ["cod", "online", "fampay"], required: true },
    status: { type: String, enum: ["pending", "processing", "paid", "failed", "refunded"], default: "pending" },
    transactionId: { type: String, default: null, index: true }
  },
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"], default: "pending", index: true },
  tracking: { carrier: String, trackingNumber: String, estimatedDelivery: Date },
  notes: { type: String, maxlength: 1000, default: null }
}, { timestamps: true });

orderSchema.index({ "customer.email": 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
