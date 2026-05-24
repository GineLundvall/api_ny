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
router.get("/admin-only", authenticate, requireRole("administrator"), (req, res) => {
  res.json({
    message: `Välkommen ${req.user.username}! Du har administratörsåtkomst.`,
    secretData: "Detta är hemlig administratörsinformation.",
  });
});

router.get("/editor-only", authenticate, (req, res, next) => {
  const allowed = ["editor", "administrator"];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: "Rollen 'editor' eller 'administrator' krävs." });
  }
  next();
}, (req, res) => {
  res.json({
    message: `Välkommen ${req.user.username}! Du har editor-åtkomst.`,
  });
});

module.exports = router;
