const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const pool     = require("../db/connection");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password, role = "user" } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email och password krävs." });
  }

  const allowedRoles = ["user", "editor", "administrator"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: `Ogiltig roll. Välj bland: ${allowedRoles.join(", ")}` });
  }

  try {
    const SALT_ROUNDS = 12;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    res.status(201).json({
      message: "Användare skapad.",
      userId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Username eller email är redan registrerat." });
    }
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username och password krävs." });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Felaktigt användarnamn eller lösenord." });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Felaktigt användarnamn eller lösenord." });
    }

    const payload = {
      sub:      user.id,
      username: user.username,
      email:    user.email,
      role:     user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "2h",
    });

    res.json({
      message: "Inloggning lyckades.",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
      [req.user.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Användaren hittades inte." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, username, email, role, created_at FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  const param = req.params.id;

  try {
    const [rows] = await pool.execute(
      `SELECT id, username, email, role, created_at
       FROM users
       WHERE id = CAST(? AS UNSIGNED) OR username = ?`,
      [param, param]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Användaren hittades inte." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

router.delete("/:id", authenticate, requireRole("administrator"), async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Användaren hittades inte." });
    }

    res.json({ message: `Användare med id ${id} har tagits bort.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

router.get("/:id/topics", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT t.id, t.heading, t.text, t.created_at,
              u.username AS author
       FROM topics t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

module.exports = router;
