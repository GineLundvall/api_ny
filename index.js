require("dotenv").config(); 

const express = require("express");

const logger      = require("./middleware/logger");
const usersRouter = require("./routes/users");
const topicsRouter = require("./routes/topics");
const tokenRouter  = require("./routes/token");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());          
app.use(logger);                  

app.use("/users",  usersRouter);
app.use("/topics", topicsRouter);
app.use("/",       tokenRouter);   

app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.method} ${req.path}' finns inte.` });
});

app.use((err, req, res, next) => {
  console.error("Ohanterat fel:", err);
  res.status(500).json({ error: "Internt serverfel." });
});

app.listen(PORT, () => {
  console.log(`\nAPI-server körs på http://localhost:${PORT}`);
  console.log("Tillgängliga routes:");
  console.log("  POST   /users/register");
  console.log("  POST   /users/login");
  console.log("  GET    /users/me          (token krävs)");
  console.log("  GET    /users             (token krävs)");
  console.log("  GET    /users/:id         (token krävs, id eller username)");
  console.log("  DELETE /users/:id         (token + administrator-roll krävs)");
  console.log("  GET    /users/:id/topics  (token krävs)");
  console.log("  GET    /topics");
  console.log("  GET    /topics/:id");
  console.log("  POST   /topics            (token krävs)");
  console.log("  DELETE /topics/:id        (token krävs, ägare eller admin)");
  console.log("  GET    /token-info        (token krävs)");
  console.log("  GET    /admin-only        (token + administrator-roll krävs)");
  console.log("  GET    /editor-only       (token + editor/administrator-roll krävs)\n");
});
