import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const wsServer = Server(server);

server.listen(3000, () => {});
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// const sockets = [];

// wss.on("connection", (socket) => {
//   //   console.log(socket);
//   sockets.push(socket);
//   socket["nickname"] = "Anon";
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((entry) =>
//           entry.send(`${socket.nickname}: ${message.payload}`)
//         );
//         break;

//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
//   socket.on("close", () => {});
// });
