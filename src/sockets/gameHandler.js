import { getRoom, setTurnData, advanceTurn, resetGame } from "../models/roomModel.js";
import { getRandomCard } from "../data/medicalDeck.js";

export const registerGameHandlers = (io, socket) => {
  socket.on("start-game", (roomCode) => {
    const room = getRoom(roomCode);
    if (!room || room.players.length < 3) return;
    room.gameStarted = true;
    const card = getRandomCard();
    const impostorIndex = Math.floor(Math.random() * room.players.length);
    const impostorId = room.players[impostorIndex].id;
    setTurnData(roomCode, room.players.map((p) => p.id));
    room.players.forEach((player) => {
      const isImpostor = player.id === impostorId;
      io.to(player.id).emit("game-started", {
        role: isImpostor ? "impostor" : "doctor",
        word: isImpostor ? card.clue : card.word,
      });
    });
    setTimeout(() => {
      io.to(roomCode).emit("next-turn", room.turnData.playerIds[0]);
    }, 5000);
  });

  socket.on("advance-turn", (roomCode) => {
    const room = getRoom(roomCode);
    if (!room || !room.turnData) return;
    const currentTurnId = room.turnData.playerIds[room.turnData.currentIndex];
    const isHost = room.players.find((p) => p.id === socket.id && p.role === "host");
    if (socket.id !== currentTurnId && !isHost) return;
    io.to(roomCode).emit("next-turn", advanceTurn(roomCode));
  });

  socket.on("stop-game", (roomCode) => {
    const room = getRoom(roomCode);
    if (!room) return;
    resetGame(roomCode);
    io.to(roomCode).emit("game-ended");
  });
};