const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Ingen token angiven. Logga in och skicka med ett Bearer-token.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; 
    next();
  } catch (err) {
    
    const message =
      err.name === "TokenExpiredError"
        ? "Token har gått ut. Logga in igen."
        : "Ogiltig token.";
    return res.status(403).json({ error: message });
  }
}

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Ej autentiserad." });
    }
    if (req.user.role !== role) {
      return res.status(403).json({
        error: `Åtkomst nekad. Rollen '${role}' krävs.`,
      });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
