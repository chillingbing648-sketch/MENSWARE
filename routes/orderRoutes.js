const express = require("express");
const { optionalAuthenticate, authenticate, requireAdmin } = require("../middleware/auth");
const orderService = require("../services/orderService");

const router = express.Router();

router.post("/", optionalAuthenticate, async (req, res, next) => {
  try {
    const order = await orderService.createOrder({ userId: req.user?._id, ...req.body });
    res.status(201).json({ success: true, message: "Order created successfully", order });
  } catch (error) { next(error); }
});

router.get("/my", authenticate, async (req, res, next) => {
  try { res.json({ success: true, orders: await orderService.listMyOrders(req.user._id) }); }
  catch (error) { next(error); }
});

router.get("/admin/all", authenticate, requireAdmin, async (req, res, next) => {
  try { res.json({ success: true, orders: await orderService.listAdminOrders() }); }
  catch (error) { next(error); }
});

router.patch("/admin/:id/status", authenticate, requireAdmin, async (req, res, next) => {
  try { res.json({ success: true, order: await orderService.updateStatus(req.params.id, req.body.status) }); }
  catch (error) { next(error); }
});

router.get("/:id", optionalAuthenticate, async (req, res, next) => {
  try { res.json({ success: true, order: await orderService.getOrder(req.params.id, req.user) }); }
  catch (error) { next(error); }
});

module.exports = router;
