const Product = require("../models/Product");

function paginationValue(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), max);
}

async function listProducts({ q, category, featured, page = 1, limit = 24 }) {
  const filter = { isActive: true };
  if (category) filter.category = String(category).trim();
  if (featured === "true") filter.isFeatured = true;
  if (q) filter.$text = { $search: String(q).trim() };

  const safeLimit = paginationValue(limit, 24, 100);
  const safePage = paginationValue(page, 1, Number.MAX_SAFE_INTEGER);
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Product.countDocuments(filter)
  ]);

  return { products, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } };
}

async function getProduct(idOrSlug) {
  const value = String(idOrSlug || "");
  const filter = /^[0-9a-fA-F]{24}$/.test(value)
    ? { _id: value, isActive: true }
    : { slug: value.toLowerCase(), isActive: true };
  const product = await Product.findOne(filter).lean();
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
}

async function createProduct(payload) {
  return Product.create(payload);
}

async function updateProduct(id, payload) {
  const product = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
}

async function archiveProduct(id) {
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, archiveProduct };
