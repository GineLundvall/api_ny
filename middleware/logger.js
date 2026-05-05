const fs   = require("fs");
const path = require("path");

const logDir  = path.join(__dirname, "../logs");
const logFile = path.join(logDir, "access.log");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
