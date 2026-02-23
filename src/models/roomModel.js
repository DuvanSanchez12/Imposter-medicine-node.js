const rooms = {};

export const getRoom = (roomCode) => rooms[roomCode] ?? null;

export const getRoomBySocketId = (socketId) => {
  const entry = Object.entries(rooms).find(([, room]) =>
    room.players.some((p) => p.id === socketId)
  );
  return entry ?? null;
};

export const createRoom = (roomCode, hostId, hostName) => {
  rooms[roomCode] = {
    players: [{ id: hostId, name: hostName, role: "host" }],
    gameStarted: false,
    settings: { maxPlayers: 5, timePerPerson: 60 },
    turnData: null,
  };
  return rooms[roomCode];
};

export const addPlayer = (roomCode, player) => {
  rooms[roomCode].players.push(player);
};

export const removePlayer = (roomCode, socketId) => {
  rooms[roomCode].players = rooms[roomCode].players.filter(
    (p) => p.id !== socketId
  );
};

export const deleteRoom = (roomCode) => {
  delete rooms[roomCode];
};

export const updateSettings = (roomCode, newSettings) => {
  rooms[roomCode].settings = { ...rooms[roomCode].settings, ...newSettings };
};

export const setTurnData = (roomCode, playerIds) => {
  rooms[roomCode].turnData = { currentIndex: 0, playerIds };
};

export const advanceTurn = (roomCode) => {
  const { turnData } = rooms[roomCode];
  turnData.currentIndex =
    (turnData.currentIndex + 1) % turnData.playerIds.length;
  return turnData.playerIds[turnData.currentIndex];
};

export const resetGame = (roomCode) => {
  rooms[roomCode].gameStarted = false;
  rooms[roomCode].turnData = null;
};