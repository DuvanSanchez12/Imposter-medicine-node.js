/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { registerRoomHandlers } = require("./sockets/roomHandler");
const { registerGameHandlers } = require("./src/sockets/gameHandler");

// ---------------------------------------------------------------------------
// Configuración de Express
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());

// ---------------------------------------------------------------------------
// Configuración de Socket.IO
// ---------------------------------------------------------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ---------------------------------------------------------------------------
// Registro de eventos por conexión
// ---------------------------------------------------------------------------
io.on("connection", (socket) => {
  console.log(`🔌 Socket conectado: ${socket.id}`);

  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
});

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 SERVIDOR MÉDICO CORRIENDO EN http://localhost:${PORT}`);
});