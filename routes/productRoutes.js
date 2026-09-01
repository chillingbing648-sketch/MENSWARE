const express = require("express");
const Product = require("../models/Product");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { q, category, featured, page = 1, limit = 24 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (q) filter.$text = { $search: q };
    const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
      Product.countDocuments(filter)
    ]);
    res.json({ success: true, products, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { next(error); }
});

router.get("/:idOrSlug", async (req, res, next) => {
  try {
    const value = req.params.idOrSlug;
    const filter = /^[0-9a-fA-F]{24}$/.test(value) ? { _id: value, isActive: true } : { slug: value, isActive: true };
    const product = await Product.findOne(filter);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) { next(error); }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try { const product = await Product.create(req.body); res.status(201).json({ success: true, product }); } catch (error) { next(error); }
});

router.patch("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) { next(error); }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product archived", product });
  } catch (error) { next(error); }
});

module.exports = router;
