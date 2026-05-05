const express = require("express");
const pool    = require("../db/connection");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.id, t.user_id, t.heading, t.text, t.created_at,
              u.username AS author
       FROM topics t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});