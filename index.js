/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { registerRoomHandlers } = require("./src/sockets/roomHanldler");
const { registerGameHandlers } = require("./src/sockets/gameHandler");
const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket conectado: ${socket.id}`);

  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 SERVIDOR MÉDICO CORRIENDO EN http://localhost:${PORT}`);
});