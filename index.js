import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { RoomManager } from "./src/models/roomManager.js";
import { registerGameHandlers } from "./src/sockets/gameHandler.js";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

const roomManager = new RoomManager();

io.on("connection", (socket) => {
  console.log(`👤 Nuevo usuario conectado: ${socket.id}`);
  registerGameHandlers(io, socket, roomManager);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 SERVIDOR EN PUERTO ${PORT}`));