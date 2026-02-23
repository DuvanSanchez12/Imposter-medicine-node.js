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

    const leavingPlayer = room.players.find((p) => p.id === socket.id);
    if (!leavingPlayer) return;

    room.players = room.players.filter((p) => p.id !== socket.id);

    if (room.players.length === 0) {
      roomManager.deleteRoom(roomCode);
      console.log(`🧹 Sala ${roomCode} eliminada.`);
    } else {
      if (leavingPlayer.role === "host") room.players[0].role = "host";

      if (room.gameStarted && room.turnData) {
        room.turnData.playerIds = room.players.map((p) => p.id);
        room.turnData.currentIndex = 0;
        io.to(roomCode).emit("next-turn", room.turnData.playerIds[0]);
      }

      broadcastUpdate(roomCode);
      io.to(roomCode).emit("system-message", {
        text: `DR. ${leavingPlayer.name.toUpperCase()} HA ABANDONADO LA UNIDAD.`, // Texto igual al original
        type: "leave",
      });
    }
    socket.leave(roomCode);
  };

  socket.on("create-room", ({ name }) => {
    const roomCode = roomManager.createRoom(socket.id, name);
    const room = roomManager.getRoom(roomCode);
    socket.join(roomCode);

    // Mismo formato que el original
    socket.emit("room-created", {
      roomCode,
      players: room.players,
      settings: room.settings,
    });
  });

  socket.on("join-room", ({ name, roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (room) {
      if (room.players.length < room.settings.maxPlayers) {
        room.players = room.players.filter((p) => p.id !== socket.id && p.name !== name);

        socket.join(roomCode);
        // El original no tenía el check de length === 0 aquí porque RoomManager ya crea el host, 
        // pero añadimos el rol doctor por defecto
        room.players.push({ id: socket.id, name, role: "doctor" });

        // IMPORTANTE: Timeout y nombres de llaves idénticos al original
        setTimeout(() => {
          socket.emit("room-joined", {
            roomCode,
            currentPlayers: room.players, // CLAVE: Volver a usar 'currentPlayers'
            settings: room.settings,
          });
          broadcastUpdate(roomCode);
          socket.to(roomCode).emit("system-message", {
            text: `DR. ${name.toUpperCase()} SE HA UNIDO AL EQUIPO.`, // Texto igual al original
            type: "join",
          });
        }, 100);
      } else {
        socket.emit("error-message", "La sala está llena.");
      }
    } else {
      socket.emit("error-message", "La sala no existe.");
    }
  });

  socket.on("update-settings", ({ roomCode, settings }) => {
    const room = roomManager.getRoom(roomCode);
    if (room) {
      const isHost = room.players.find((p) => p.id === socket.id && p.role === "host");
      if (isHost) {
        room.settings = { ...room.settings, ...settings };
        io.to(roomCode).emit("settings-updated", room.settings);
      }
    }
  });

  socket.on("start-game", (roomCode) => {
    const room = roomManager.getRoom(roomCode);
    if (room && room.players.length >= 3) {
      room.gameStarted = true;
      const selectedSet = medicalDeck[Math.floor(Math.random() * medicalDeck.length)];
      const impostorIndex = Math.floor(Math.random() * room.players.length);
      const impostorId = room.players[impostorIndex].id; // El original usaba el ID para comparar

      room.turnData = {
        currentIndex: 0,
        playerIds: room.players.map((p) => p.id),
      };

      room.players.forEach((player) => {
        const isImpostor = player.id === impostorId;
        io.to(player.id).emit("game-started", {
          role: isImpostor ? "impostor" : "doctor",
          word: isImpostor ? selectedSet.clue : selectedSet.word,
        });
      });

      console.log(`🎮 Partida en ${roomCode}: ${selectedSet.word}`);
      setTimeout(() => io.to(roomCode).emit("next-turn", room.turnData.playerIds[0]), 5000);
    }
  });

  socket.on("advance-turn", (roomCode) => {
    const room = roomManager.getRoom(roomCode);
    if (room && room.turnData) {
      const currentTurnId = room.turnData.playerIds[room.turnData.currentIndex];
      const isHost = room.players.find((p) => p.id === socket.id && p.role === "host");
      if (socket.id === currentTurnId || isHost) {
        room.turnData.currentIndex = (room.turnData.currentIndex + 1) % room.turnData.playerIds.length;
        const nextPlayerId = room.turnData.playerIds[room.turnData.currentIndex];
        io.to(roomCode).emit("next-turn", nextPlayerId);
      }
    }
  });

  socket.on("stop-game", (roomCode) => {
    const room = roomManager.getRoom(roomCode);
    if (room) {
      room.gameStarted = false;
      room.turnData = null;
      io.to(roomCode).emit("game-ended");
    }
  });

  socket.on("leave-room", (roomCode) => {
    handleLeave(roomCode);
  });

  socket.on("disconnect", () => {
    const roomCode = roomManager.findRoomByPlayerId(socket.id);
    if (roomCode) handleLeave(roomCode);
  });
};