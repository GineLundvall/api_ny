const fs   = require("fs");
const path = require("path");

const logDir  = path.join(__dirname, "../logs");
const logFile = path.join(logDir, "access.log");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function apacheDate(date) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  const pad = (n) => String(n).padStart(2, "0");
  const d   = date;
  const tz  = d.getTimezoneOffset();
  const sign = tz <= 0 ? "+" : "-";
  const tzH  = pad(Math.abs(Math.floor(tz / 60)));
  const tzM  = pad(Math.abs(tz % 60));
  return (
    `${pad(d.getDate())}/${months[d.getMonth()]}/${d.getFullYear()}:` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ` +
    `${sign}${tzH}${tzM}`
  );
}

function getClientIp(req) {
  return (
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ip      = getClientIp(req);
    const date    = apacheDate(new Date());
    const method  = req.method;
    const url     = req.originalUrl;
    const status  = res.statusCode;
    const ms      = Date.now() - start;

    const line = `${ip} [${date}] "${method} ${url}" ${status} ${ms}ms`;

    console.log(line);

    fs.appendFile(logFile, line + "\n", (err) => {
      if (err) console.error("Logger: kunde inte skriva till fil:", err.message);
    });
  });

  next();
}

module.exports = logger;
