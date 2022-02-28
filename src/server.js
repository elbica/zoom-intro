import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.listen(3000, () => {});

const sockets = [];

wss.on("connection", (socket) => {
  //   console.log(socket);
  sockets.push(socket);
  socket["nickname"] = "Anon";
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((entry) =>
          entry.send(`${socket.nickname}: ${message.payload}`)
        );
        break;

      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
  socket.on("close", () => {});
});
