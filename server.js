const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const WebSocket = require("ws");

const app = express();

let sessions = {};
const symbolCount = 8;
const rows = 3;
const columns = 5;
const paylines = [
  [0, 3, 6, 9, 12],
  [0, 3, 7, 9, 12],
  [0, 4, 8, 10, 12],
  [1, 3, 6, 9, 13],
  [1, 4, 7, 10, 13],
  [1, 5, 8, 11, 13],
  [2, 4, 6, 10, 14],
  [2, 5, 7, 11, 14],
  [2, 5, 8, 11, 14]
];

const paytable = {
  1: { 3: 5, 4: 20, 5: 100 },
  2: { 3: 5, 4: 20, 5: 100 },
  3: { 3: 10, 4: 30, 5: 150 },
  4: { 3: 10, 4: 30, 5: 150 },
  5: { 3: 15, 4: 45, 5: 200 },
  6: { 3: 15, 4: 45, 5: 200 },
  7: { 3: 45, 4: 200, 5: 1200 },
  8: { 3: 45, 4: 200, 5: 1200 },
};

app.use("/assets", express.static(process.cwd() + "/assets/"));
app.use("/dist", express.static(process.cwd() + "/dist/"));
app.use("/", express.static(process.cwd() + "/"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/index.html");
});

app.listen(3000, function () {
  console.log("server is on");
});

const wsServer = new WebSocket.Server({ port: 8080 }, function () {
  console.log("ws server is on");
});
wsServer.on("connection", socket => {
  socket.on("message", msg => {
    const message = JSON.parse(msg);

    if (message.type === "start_session") {
      if (sessions[message.sessionId] === undefined) {
        const session = createSession();
        sessions[session.sessionId] = session;
        socket.send(JSON.stringify(session));
      } else {
        socket.send(JSON.stringify(sessions[message.sessionId]));
      }
    } else if (message.type === "game_turn") {
      sessions[message.sessionId].balance -= message.bet * message.lines;
      sessions[message.sessionId].bet = message.bet;
      sessions[message.sessionId].lines = message.lines;
      let reels = generateReels();
      let { prize } = determinePrize(reels, message.lines, message.bet);
      if (prize === 0 && Math.random() > .4) {
        while (prize === 0) {
          reels = generateReels();
          prize = determinePrize(reels, message.lines, message.bet).prize;
          if (Math.random() > .9) {
            while (prize < (message.lines * message.bet * 20)) {
              reels = generateReels();
              prize = determinePrize(reels, message.lines, message.bet).prize;
            }
          }
        }
      }
      let { wins } = determinePrize(reels, message.lines, message.bet);
      sessions[message.sessionId].symbols = reels;
      sessions[message.sessionId].prize = prize;
      sessions[message.sessionId].balance += prize;
      sessions[message.sessionId].state = prize > 0 ? "prizeState" : "normalState";
      sessions[message.sessionId].wins = wins;
      socket.send(JSON.stringify(sessions[message.sessionId]));
    }
  });
});

function createSession() {
  return {
    balance: 1000,
    sessionId: uuid.v4(),
    lines: 9,
    numSymbols: symbolCount,
    state: "normalState",
    bet: 1,
    symbols: "241356710441632"
  };
}

function determinePrize(reels, activeLines, bet) {
  let result = { prize: 0, wins: [] };
  let positions = [];
  for (let line = 1; line <= activeLines; line++) {
    let numSyms = 0;
    let sym = reels[paylines[line - 1][0]];
    for (let x = 0; x < paylines[line - 1].length; x++) {
      if (reels[paylines[line - 1][x]] === sym) {
        numSyms++;
        positions.push(paylines[line - 1][x]);
      } else {
        break;
      }
    }
    if (numSyms >= 3) {
      const linePrize = paytable[parseInt(sym) + 1][numSyms] * bet;
      result.prize += linePrize;
      result.wins.push({ line: line, prize: linePrize, positions: positions });
    }
    positions = [];
  }
  return result;
}

function generateReels() {
  let reels = "";
  for (let x = 0; x < rows * columns; x++) {
    reels += Math.floor(Math.random() * symbolCount).toString(16);
  }
  return reels;
}