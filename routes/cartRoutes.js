const express = require("express");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { optionalAuthenticate } = require("../middleware/auth");

const router = express.Router();
router.use(optionalAuthenticate);

function sessionId(req, res) {
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
  const id = sessionId(req, res);
  let cart = await Cart.findOne({ sessionId: id }).populate("items.product");
  if (!cart) cart = await Cart.create({ sessionId: id });
  return cart;
}

router.get("/", async (req, res, next) => { try { res.json({ success: true, cart: await loadCart(req, res) }); } catch (e) { next(e); } });

router.post("/items", async (req, res, next) => {
  try {
    const { productId, variantId = null, quantity = 1 } = req.body;
    const qty = Number(quantity);
    if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ success: false, message: "Valid product and quantity are required" });
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const variant = variantId ? product.variants.id(variantId) : null;
    if (variantId && (!variant || !variant.isActive)) return res.status(400).json({ success: false, message: "Invalid variant" });
    if (variant && variant.stock < qty) return res.status(409).json({ success: false, message: "Insufficient stock" });
    const cart = await loadCart(req, res);
    const existing = cart.items.find(item => item.product.toString() === productId && String(item.variantId || "") === String(variantId || ""));
    if (existing) existing.quantity = Math.min(existing.quantity + qty, 20); else cart.items.push({ product: productId, variantId, quantity: qty });
    await cart.save(); await cart.populate("items.product"); res.status(201).json({ success: true, cart });
  } catch (e) { next(e); }
});

router.patch("/items/:itemId", async (req, res, next) => {
  try { const qty = Number(req.body.quantity); if (!Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ success: false, message: "Quantity must be between 1 and 20" }); const cart = await loadCart(req, res); const item = cart.items.id(req.params.itemId); if (!item) return res.status(404).json({ success: false, message: "Cart item not found" }); item.quantity = qty; await cart.save(); await cart.populate("items.product"); res.json({ success: true, cart });
  } catch (e) { next(e); }
});

router.delete("/items/:itemId", async (req, res, next) => {
  try { const cart = await loadCart(req, res); const item = cart.items.id(req.params.itemId); if (!item) return res.status(404).json({ success: false, message: "Cart item not found" }); item.deleteOne(); await cart.save(); await cart.populate("items.product"); res.json({ success: true, cart });
  } catch (e) { next(e); }
});

router.delete("/", async (req, res, next) => { try { const cart = await loadCart(req, res); cart.items = []; await cart.save(); res.json({ success: true, cart }); } catch (e) { next(e); } });
module.exports = router;
