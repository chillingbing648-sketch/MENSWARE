const express = require("express");
const { authenticate } = require("../middleware/auth");
const { register, login, setAuthCookie, publicUser } = require("../services/authService");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const result = await register(req.body);
    setAuthCookie(res, result.token);
    res.status(201).json({ success: true, user: publicUser(result.user) });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await login(req.body);
    setAuthCookie(res, result.token);
    res.json({ success: true, user: publicUser(result.user) });
  } catch (error) { next(error); }
});

router.get("/me", authenticate, (req, res) => res.json({ success: true, user: req.user }));
router.post("/logout", (req, res) => { res.clearCookie("accessToken", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }); res.json({ success: true, message: "Logged out" }); });

module.exports = router;
