const uuid = require("uuid");
const express = require("express");
const app = express();

app.use(express.static("public"));

const { PORT = 3000 } = process.env;

let clientId = 0;
let clients = {};

function keepClients(clientId, req, res) {
  clients[clientId] = res;

  req.on("close", function () {
    console.log("Clients: " + clientId + " <- closed");
    delete clients[clientId];
  });
}

app.get("/sse", function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream", // text/event-stream を追加
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  keepClients(++clientId, req, res);

  // res.write("\n");
  //
  // ((clientId) => {
  //   clients[clientId] = res;
  //
  //   req.on("close", function () {
  //     console.log("Clients: " + clientId + " <- closed");
  //     delete clients[clientId];
  //   });
  // })(++clientId);
});

setInterval(() => {
  const msg = Math.random();
  const id = uuid.v4();

  console.log(
    "[message] Clients: " + Object.keys(clients) + " <- " + msg + "  " + id
  );
  for (let clientId in clients) {
    // メッセージの送信 \n\nが必要
    clients[clientId].write("id: " + id + "\n\n");
    clients[clientId].write("data: " + msg + "\n\n");
  }
}, 2000);

setInterval(() => {
  const msg = Math.random();
  const id = uuid.v4();

  console.log(
    "[ping] Clients: " + Object.keys(clients) + " <- " + msg + "  " + id
  );

  for (let clientId in clients) {
    // メッセージの送信 \n\nが必要
    clients[clientId].write("event: ping" + "\n");

    const data = {
      msg,
      time: new Date().toISOString(),
    };

    clients[clientId].write("data: " + JSON.stringify(data) + "\n\n");
  }
}, 5000);

app.listen(PORT);
