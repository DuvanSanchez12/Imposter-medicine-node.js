import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerRoomHandlers } from "./src/sockets/roomHanldler";
import { registerGameHandlers } from "./src/sockets/gameHandler";
const app = express();
app.use(cors());
const server = createServer(app);

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