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