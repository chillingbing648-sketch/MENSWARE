const crypto = require("crypto");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

function getSessionId(req, res) {
  let id = req.cookies?.cartSession;
  if (!id) {
    id = crypto.randomUUID();
    res.cookie("cartSession", id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 24 * 30 });
  }
  return id;
}

async function loadCart(req, res) {
  if (req.user) {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) cart = await Cart.create({ user: req.user._id });
    return cart;
  }
  const sessionId = getSessionId(req, res);
  let cart = await Cart.findOne({ sessionId }).populate("items.product");
  if (!cart) cart = await Cart.create({ sessionId });
  return cart;
}

function fail(message, statusCode) { const error = new Error(message); error.statusCode = statusCode; throw error; }

async function addItem(req, res, { productId, variantId = null, quantity = 1 }) {
  const qty = Number(quantity);
  if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 20) fail("Valid product and quantity are required", 400);
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) fail("Product not found", 404);
  const variant = variantId ? product.variants.id(variantId) : null;
  if (variantId && (!variant || !variant.isActive)) fail("Invalid variant", 400);

  const cart = await loadCart(req, res);
  const existing = cart.items.find(item => item.product.toString() === String(productId) && String(item.variantId || "") === String(variantId || ""));
  const nextQuantity = (existing?.quantity || 0) + qty;
  if (nextQuantity > 20) fail("Maximum quantity per item is 20", 400);
  if (variant && variant.stock < nextQuantity) fail("Insufficient stock", 409);
  if (existing) existing.quantity = nextQuantity;
  else cart.items.push({ product: productId, variantId, quantity: qty });
  await cart.save();
  await cart.populate("items.product");
  return cart;
}

async function updateItem(req, res, itemId, quantity) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) fail("Quantity must be between 1 and 20", 400);
  const cart = await loadCart(req, res);
  const item = cart.items.id(itemId);
  if (!item) fail("Cart item not found", 404);
  const product = await Product.findOne({ _id: item.product, isActive: true });
  if (!product) fail("Product is no longer available", 409);
  if (item.variantId) {
    const variant = product.variants.id(item.variantId);
    if (!variant || !variant.isActive) fail("Selected variant is no longer available", 409);
    if (variant.stock < qty) fail("Insufficient stock", 409);
  }
  item.quantity = qty;
  await cart.save();
  await cart.populate("items.product");
  return cart;
}

async function removeItem(req, res, itemId) {
  const cart = await loadCart(req, res);
  const item = cart.items.id(itemId);
  if (!item) fail("Cart item not found", 404);
  item.deleteOne();
  await cart.save();
  await cart.populate("items.product");
  return cart;
}

async function clearCart(req, res) {
  const cart = await loadCart(req, res);
  cart.items = [];
  await cart.save();
  return cart;
}

module.exports = { loadCart, addItem, updateItem, removeItem, clearCart };
