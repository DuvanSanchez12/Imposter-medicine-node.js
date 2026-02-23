/* eslint-disable import/no-anonymous-default-export */
import { getRoom, getRoomBySocketId, createRoom, addPlayer, removePlayer, deleteRoom, updateSettings, setTurnData } from "../models/roomManager";
const broadcastUpdate = (io, roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;
  io.to(roomCode).emit("update-players", room.players);
  io.to(roomCode).emit("settings-updated", room.settings);
};
const handlePlayerLeave = (io, socket, roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;

  const leavingPlayer = room.players.find((p) => p.id === socket.id);
  if (!leavingPlayer) return;

  removePlayer(roomCode, socket.id);
  console.log(`❌ Dr. ${leavingPlayer.name} fuera de la unidad ${roomCode}`);

  if (room.players.length === 0) {
    deleteRoom(roomCode);
    console.log(`🧹 Sala ${roomCode} vacía y eliminada.`);
    return;
  }

  if (leavingPlayer.role === "host") {
    room.players[0].role = "host";
  }

  if (room.gameStarted && room.turnData) {
    setTurnData(roomCode, room.players.map((p) => p.id));
    io.to(roomCode).emit("next-turn", room.turnData.playerIds[0]);
  }

  broadcastUpdate(io, roomCode);
  io.to(roomCode).emit("system-message", {
    text: `DR. ${leavingPlayer.name.toUpperCase()} HA ABANDONADO LA UNIDAD.`,
    type: "leave",
  });
};

const registerRoomHandlers = (io, socket) => {

  socket.on("create-room", ({ name }) => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    socket.join(roomCode);
    const room = createRoom(roomCode, socket.id, name);

    socket.emit("room-created", {
      roomCode,
      players: room.players,
      settings: room.settings,
    });
  });

  socket.on("join-room", ({ name, roomCode }) => {
    const room = getRoom(roomCode);
    if (!room) return socket.emit("error-message", "La sala no existe.");

    room.players = room.players.filter(
      (p) => p.id !== socket.id && p.name !== name
    );

    if (room.players.length >= room.settings.maxPlayers) {
      return socket.emit("error-message", "La sala está llena.");
    }

    socket.join(roomCode);
    const role = room.players.length === 0 ? "host" : "doctor";
    addPlayer(roomCode, { id: socket.id, name, role });

    setTimeout(() => {
      socket.emit("room-joined", {
        roomCode,
        currentPlayers: room.players,
        settings: room.settings,
      });
      broadcastUpdate(io, roomCode);
      socket.to(roomCode).emit("system-message", {
        text: `DR. ${name.toUpperCase()} SE HA UNIDO AL EQUIPO.`,
        type: "join",
      });
    }, 100);
  });

  socket.on("update-settings", ({ roomCode, settings }) => {
    const room = getRoom(roomCode);
    if (!room) return;
    const isHost = room.players.find(
      (p) => p.id === socket.id && p.role === "host"
    );
    if (!isHost) return;
    updateSettings(roomCode, settings);
    io.to(roomCode).emit("settings-updated", room.settings);
  });

  socket.on("leave-room", (roomCode) => {
    handlePlayerLeave(io, socket, roomCode);
    socket.leave(roomCode);
  });

  socket.on("disconnect", () => {
    const entry = getRoomBySocketId(socket.id);
    if (entry) {
      const [roomCode] = entry;
      handlePlayerLeave(io, socket, roomCode);
    }
  });
};

export default { registerRoomHandlers };