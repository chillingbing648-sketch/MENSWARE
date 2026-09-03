const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const PAYMENT_METHODS = ["cod", "online", "fampay"];
const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];

function generateOrderNumber() {
  return `MW-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function validateCheckout({ name, email, items, shippingAddress, paymentMethod }) {
  if (!name || !email || !Array.isArray(items) || !items.length) { const error = new Error("Customer and order items are required"); error.statusCode = 400; throw error; }
  if (!shippingAddress?.addressLine1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.postalCode) { const error = new Error("Complete shipping address is required"); error.statusCode = 400; throw error; }
  if (!PAYMENT_METHODS.includes(paymentMethod)) { const error = new Error("Invalid payment method"); error.statusCode = 400; throw error; }
  if (items.length > 50) { const error = new Error("Order contains too many items"); error.statusCode = 400; throw error; }
}

async function createOrder({ userId, name, email, phone, items, shippingAddress, paymentMethod = "cod" }) {
  validateCheckout({ name, email, items, shippingAddress, paymentMethod });
  const session = await mongoose.startSession();
  try {
    let createdOrder;
    await session.withTransaction(async () => {
      const ids = items.map(item => item.productId);
      const products = await Product.find({ _id: { $in: ids }, isActive: true }).session(session);
      const map = new Map(products.map(product => [product._id.toString(), product]));
      const orderItems = [];
      let subtotal = 0;

      for (const requested of items) {
        const product = map.get(String(requested.productId));
        const quantity = Number(requested.quantity);
        if (!product) { const error = new Error("One or more products no longer exist"); error.statusCode = 404; throw error; }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) { const error = new Error("Invalid product quantity"); error.statusCode = 400; throw error; }
        const variant = requested.variantId ? product.variants.id(requested.variantId) : null;
        if (requested.variantId && (!variant || !variant.isActive)) { const error = new Error(`Invalid variant for ${product.name}`); error.statusCode = 400; throw error; }

        const unitPrice = variant ? variant.price : product.basePrice;
        const stock = variant ? variant.stock : null;
        if (stock !== null && stock < quantity) { const error = new Error(`${product.name} is out of stock`); error.statusCode = 409; throw error; }
        if (stock !== null) variant.stock -= quantity;
        const totalPrice = unitPrice * quantity;
        subtotal += totalPrice;
        orderItems.push({ productId: product._id, variantId: variant?._id || null, name: product.name, sku: variant?.sku || null, image: product.images?.[0] || null, quantity, unitPrice, totalPrice });
      }

      for (const product of products) await product.save({ session });
      const shippingFee = subtotal >= 2000 ? 0 : 99;
      const tax = Math.round(subtotal * 0.18 * 100) / 100;
      const [order] = await Order.create([{
        orderNumber: generateOrderNumber(), user: userId || null,
        customer: { name: String(name).trim(), email: String(email).toLowerCase().trim(), phone: phone || null },
        items: orderItems, shippingAddress, subtotal, shippingFee, tax,
        total: subtotal + shippingFee + tax,
        payment: { method: paymentMethod, status: paymentMethod === "cod" ? "pending" : "processing" }
      }], { session });
      createdOrder = order;
    });
    return createdOrder;
  } finally {
    await session.endSession();
  }
}

async function listMyOrders(userId) { return Order.find({ user: userId }).sort({ createdAt: -1 }).lean(); }
async function listAdminOrders() { return Order.find().sort({ createdAt: -1 }).limit(100).lean(); }

async function updateStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) { const error = new Error("Invalid order status"); error.statusCode = 400; throw error; }
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!order) { const error = new Error("Order not found"); error.statusCode = 404; throw error; }
  return order;
}

async function getOrder(id, reqUser) {
  const order = await Order.findById(id).lean();
  if (!order) { const error = new Error("Order not found"); error.statusCode = 404; throw error; }
  if (order.user && (!reqUser || (order.user.toString() !== reqUser._id.toString() && reqUser.role !== "admin"))) { const error = new Error("Order access denied"); error.statusCode = 403; throw error; }
  return order;
}

module.exports = { createOrder, listMyOrders, listAdminOrders, updateStatus, getOrder, PAYMENT_METHODS, ORDER_STATUSES };
