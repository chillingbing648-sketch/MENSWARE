const express = require("express");
const { authenticate, requireAdmin } = require("../middleware/auth");
const productService = require("../services/productService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try { res.json({ success: true, ...(await productService.listProducts(req.query)) }); }
  catch (error) { next(error); }
});

router.get("/:idOrSlug", async (req, res, next) => {
  try { res.json({ success: true, product: await productService.getProduct(req.params.idOrSlug) }); }
  catch (error) { next(error); }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try { res.status(201).json({ success: true, product: await productService.createProduct(req.body) }); }
  catch (error) { next(error); }
});

router.patch("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try { res.json({ success: true, product: await productService.updateProduct(req.params.id, req.body) }); }
  catch (error) { next(error); }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try { res.json({ success: true, message: "Product archived", product: await productService.archiveProduct(req.params.id) }); }
  catch (error) { next(error); }
});

module.exports = router;
