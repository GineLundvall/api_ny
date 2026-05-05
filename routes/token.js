const express = require("express");
const jwt     = require("jsonwebtoken");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/token-info", authenticate, (req, res) => {
  const payload = req.user;

  res.json({
    message:    "Token är giltig.",
    payload,
    issuedAt:   new Date(payload.iat * 1000).toISOString(),
    expiresAt:  new Date(payload.exp * 1000).toISOString(),
  });
});