const express = require("express");
const { optionalAuthenticate } = require("../middleware/auth");
const cartService = require("../services/cartService");

const router = express.Router();
router.use(optionalAuthenticate);

router.get("/", async (req, res, next) => {
  try { res.json({ success: true, cart: await cartService.loadCart(req, res) }); }
  catch (error) { next(error); }
});

router.post("/items", async (req, res, next) => {
  try { res.status(201).json({ success: true, cart: await cartService.addItem(req, res, req.body) }); }
  catch (error) { next(error); }
});

router.patch("/items/:itemId", async (req, res, next) => {
  try { res.json({ success: true, cart: await cartService.updateItem(req, res, req.params.itemId, req.body.quantity) }); }
  catch (error) { next(error); }
});

router.delete("/items/:itemId", async (req, res, next) => {
  try { res.json({ success: true, cart: await cartService.removeItem(req, res, req.params.itemId) }); }
  catch (error) { next(error); }
});

router.delete("/", async (req, res, next) => {
  try { res.json({ success: true, cart: await cartService.clearCart(req, res) }); }
  catch (error) { next(error); }
});

module.exports = router;
