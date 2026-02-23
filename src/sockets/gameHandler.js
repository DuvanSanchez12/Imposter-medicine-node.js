import { medicalDeck } from "../data/medicalDeck.js";

export const registerGameHandlers = (io, socket, roomManager) => {
  
  const broadcastUpdate = (roomCode) => {
    const room = roomManager.getRoom(roomCode);
    if (room) {
      io.to(roomCode).emit("update-players", room.players);
      io.to(roomCode).emit("settings-updated", room.settings);
    }
  };

  const handleLeave = (roomCode) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const leavingPlayer = room.players.find(p => p.id === socket.id);
    if (!leavingPlayer) return;

    room.players = room.players.filter(p => p.id !== socket.id);

    if (room.players.length === 0) {
      roomManager.deleteRoom(roomCode);
    } else {
      if (leavingPlayer.role === "host") room.players[0].role = "host";
      
      if (room.gameStarted && room.turnData) {
        room.turnData.playerIds = room.players.map(p => p.id);
        room.turnData.currentIndex = 0;
        io.to(roomCode).emit("next-turn", room.turnData.playerIds[0]);
      }

      broadcastUpdate(roomCode);
      io.to(roomCode).emit("system-message", {
        text: `DR. ${leavingPlayer.name.toUpperCase()} SALIÓ.`,
        type: "leave",
      });
    }
    socket.leave(roomCode);
  };
  socket.on("create-room", ({ name }) => {
    const roomCode = roomManager.createRoom(socket.id, name);
    const room = roomManager.getRoom(roomCode);
    socket.join(roomCode);
    socket.emit("room-created", { roomCode, ...room });
  });

  socket.on("join-room", ({ name, roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (room && room.players.length < room.settings.maxPlayers) {
      socket.join(roomCode);
      room.players.push({ id: socket.id, name, role: "doctor" });
      
      socket.emit("room-joined", { roomCode, currentPlayers: room.players, settings: room.settings });
      broadcastUpdate(roomCode);
      socket.to(roomCode).emit("system-message", { text: `DR. ${name.toUpperCase()} SE UNIÓ.`, type: "join" });
    } else {
      socket.emit("error-message", "Sala llena o no existe.");
    }
  });

  socket.on("start-game", (roomCode) => {
    const room = roomManager.getRoom(roomCode);
    if (room && room.players.length >= 3) {
      const selectedSet = medicalDeck[Math.floor(Math.random() * medicalDeck.length)];
      const impostorIndex = Math.floor(Math.random() * room.players.length);
      
      room.gameStarted = true;
      room.turnData = { currentIndex: 0, playerIds: room.players.map(p => p.id) };

      room.players.forEach((player, i) => {
        io.to(player.id).emit('game-started', {
          role: i === impostorIndex ? 'impostor' : 'doctor',
          word: i === impostorIndex ? selectedSet.clue : selectedSet.word
        });
      });
      setTimeout(() => io.to(roomCode).emit("next-turn", room.turnData.playerIds[0]), 5000);
    }
  });

  socket.on("advance-turn", (roomCode) => {
    const room = roomManager.getRoom(roomCode);
    if (room?.turnData) {
      room.turnData.currentIndex = (room.turnData.currentIndex + 1) % room.turnData.playerIds.length;
      io.to(roomCode).emit("next-turn", room.turnData.playerIds[room.turnData.currentIndex]);
    }
  });

  socket.on("leave-room", (roomCode) => handleLeave(roomCode));
  socket.on("disconnect", () => {
    const roomCode = roomManager.findRoomByPlayerId(socket.id);
    if (roomCode) handleLeave(roomCode);
  });
};