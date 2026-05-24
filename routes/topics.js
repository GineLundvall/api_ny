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

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT t.id, t.user_id, t.heading, t.text, t.created_at,
              u.username AS author
       FROM topics t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Topic hittades inte." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { heading, text } = req.body;

  if (!heading || !text) {
    return res.status(400).json({ error: "heading och text krävs." });
  }

  const userId = req.user.sub;

  try {
    const [result] = await pool.execute(
      "INSERT INTO topics (user_id, heading, text) VALUES (?, ?, ?)",
      [userId, heading, text]
    );
    res.status(201).json({
      message: "Topic skapat.",
      topicId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { sub: userId, role } = req.user;

  try {
    const [rows] = await pool.execute("SELECT * FROM topics WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Topic hittades inte." });
    }

    const topic = rows[0];

    if (topic.user_id !== userId && role !== "administrator") {
      return res.status(403).json({ error: "Du har inte behörighet att ta bort detta topic." });
    }

    await pool.execute("DELETE FROM topics WHERE id = ?", [id]);
    res.json({ message: `Topic med id ${id} har tagits bort.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfel." });
  }
});

module.exports = router;
