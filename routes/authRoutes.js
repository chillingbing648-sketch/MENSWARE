const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

function signToken(user) { return jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }); }
function setAuthCookie(res, token) { res.cookie("accessToken", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 24 * 7 }); }

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || password.length < 8) return res.status(400).json({ success: false, message: "Name, email and an 8+ character password are required" });
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ success: false, message: "An account with this email already exists" });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, phone: phone || null, passwordHash });
    const token = signToken(user); setAuthCookie(res, token);
    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() }).select("+passwordHash");
    if (!user || !user.isActive || !user.passwordHash || !(await bcrypt.compare(password || "", user.passwordHash))) return res.status(401).json({ success: false, message: "Invalid email or password" });
    user.lastLoginAt = new Date(); await user.save();
    setAuthCookie(res, signToken(user));
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

router.get("/me", authenticate, (req, res) => res.json({ success: true, user: req.user }));
router.post("/logout", (req, res) => { res.clearCookie("accessToken"); res.json({ success: true, message: "Logged out" }); });

module.exports = router;
