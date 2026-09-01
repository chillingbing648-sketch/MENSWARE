const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true, lowercase: true, trim: true, index: true },
  purpose: { type: String, enum: ["login", "admin_login", "verification"], required: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0, min: 0 },
  maxAttempts: { type: Number, default: 5 },
  expiresAt: { type: Date, required: true, index: true },
  consumedAt: { type: Date, default: null }
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("OTP", otpSchema);
