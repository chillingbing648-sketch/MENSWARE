const express = require("express");
const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

let adminOTP = null;

/* CREATE ORDER */
router.post("/create", async (req, res) => {
  const { name, email, product, amount, transactionId } = req.body;

  if(!name || !email || !transactionId){
    return res.status(400).json({ message: "Missing fields" });
  }

  const order = await Order.create({
    name, email, product, amount, transactionId
  });

  adminOTP = Math.floor(100000 + Math.random() * 900000);

  await sendEmail(
    process.env.ADMIN_EMAIL,
    "New FaMpay Order - OTP Verification",
    `Order ID: ${order._id}\nOTP: ${adminOTP}`
  );

  res.json({ message: "Order submitted. Awaiting admin verification." });
});

/* VERIFY ORDER */
router.post("/verify", async (req, res) => {
  const { orderId, otp } = req.body;

  if(otp != adminOTP){
    return res.status(401).json({ message: "Invalid OTP" });
  }

  await Order.findByIdAndUpdate(orderId, { verified: true });
  adminOTP = null;

  res.json({ message: "Order verified successfully" });
});

/* ADMIN VIEW */
router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
