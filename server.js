const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid");

let sessions = {};
const rows = 3;
const columns = 5;
const symbolCount = 8;

app.use("/assets", express.static(process.cwd() + "/assets/"));
app.use("/dist", express.static(process.cwd() + "/dist/"));
app.use("/", express.static(process.cwd() + "/"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/index.html");
});

app.get("/start-session/", function (req, res) {
  let newSession = createSession();
  sessions[newSession.id] = newSession;
  res.send(newSession);
});

app.listen(3000, function () {
  console.log("server is on");
});

function createSession() {
  return {
    balance: 1000,
    id: uuid.v4(),
    lines: 9,
    numSymbols: symbolCount,
    rows: rows,
    columns: columns,
    bet: 1,
    reelSymbols: generateReels()
  };
}

function generateReels() {
  let reels = "";
  for (let x = 0; x < rows * columns; x++) {
    reels += Math.floor(Math.random() * symbolCount).toString(16);
  }
  return reels;
}