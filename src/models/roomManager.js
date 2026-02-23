const rooms = {};
const getRoom = (roomCode) => rooms[roomCode] ?? null;
const getRoomBySocketId = (socketId) =>
  Object.entries(rooms).find(([, room]) =>
    room.players.some((p) => p.id === socketId)
  ) ?? null;

const createRoom = (roomCode, hostId, hostName) => {
  rooms[roomCode] = {
    players: [{ id: hostId, name: hostName, role: "host" }],
    gameStarted: false,
    settings: { maxPlayers: 5, timePerPerson: 60 },
    turnData: null,
  };
  return rooms[roomCode];
};

const addPlayer = (roomCode, player) => {
  rooms[roomCode].players.push(player);
};

const removePlayer = (roomCode, socketId) => {
  rooms[roomCode].players = rooms[roomCode].players.filter(
    (p) => p.id !== socketId
  );
};

const deleteRoom = (roomCode) => {
  delete rooms[roomCode];
};

const updateSettings = (roomCode, newSettings) => {
  rooms[roomCode].settings = { ...rooms[roomCode].settings, ...newSettings };
};

const setTurnData = (roomCode, playerIds) => {
  rooms[roomCode].turnData = { currentIndex: 0, playerIds };
};

const advanceTurn = (roomCode) => {
  const { turnData } = rooms[roomCode];
  turnData.currentIndex =
    (turnData.currentIndex + 1) % turnData.playerIds.length;
  return turnData.playerIds[turnData.currentIndex];
};

const resetGame = (roomCode) => {
  rooms[roomCode].gameStarted = false;
  rooms[roomCode].turnData = null;
};

module.exports = {
  getRoom,
  getRoomBySocketId,
  createRoom,
  addPlayer,
  removePlayer,
  deleteRoom,
  updateSettings,
  setTurnData,
  advanceTurn,
  resetGame,
};