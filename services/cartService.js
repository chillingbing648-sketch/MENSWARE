const crypto = require("crypto");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

function getSessionId(req, res) {
  let id = req.cookies?.cartSession;
  if (!id) {
    id = crypto.randomUUID();
    res.cookie("cartSession", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30
    });
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

async function addItem(req, res, { productId, variantId = null, quantity = 1 }) {
  const qty = Number(quantity);
  if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 20) {
    const error = new Error("Valid product and quantity are required"); error.statusCode = 400; throw error;
  }
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) { const error = new Error("Product not found"); error.statusCode = 404; throw error; }
  const variant = variantId ? product.variants.id(variantId) : null;
  if (variantId && (!variant || !variant.isActive)) { const error = new Error("Invalid variant"); error.statusCode = 400; throw error; }
  if (variant && variant.stock < qty) { const error = new Error("Insufficient stock"); error.statusCode = 409; throw error; }

  const cart = await loadCart(req, res);
  const existing = cart.items.find(item => item.product.toString() === String(productId) && String(item.variantId || "") === String(variantId || ""));
  if (existing) existing.quantity = Math.min(existing.quantity + qty, 20);
  else cart.items.push({ product: productId, variantId, quantity: qty });
  await cart.save();
  await cart.populate("items.product");
  return cart;
}

async function updateItem(req, res, itemId, quantity) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) { const error = new Error("Quantity must be between 1 and 20"); error.statusCode = 400; throw error; }
  const cart = await loadCart(req, res);
  const item = cart.items.id(itemId);
  if (!item) { const error = new Error("Cart item not found"); error.statusCode = 404; throw error; }
  item.quantity = qty;
  await cart.save();
  await cart.populate("items.product");
  return cart;
}

async function removeItem(req, res, itemId) {
  const cart = await loadCart(req, res);
  const item = cart.items.id(itemId);
  if (!item) { const error = new Error("Cart item not found"); error.statusCode = 404; throw error; }
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
