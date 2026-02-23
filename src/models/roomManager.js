export class RoomManager {
  constructor() {
    this.rooms = {};
  }

  generateCode() {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    return this.rooms[code] ? this.generateCode() : code;
  }

  getRoom(code) {
    return this.rooms[code];
  }

  createRoom(hostId, hostName) {
    const code = this.generateCode();
    this.rooms[code] = {
      players: [{ id: hostId, name: hostName, role: "host" }],
      gameStarted: false,
      settings: { maxPlayers: 5, timePerPerson: 60 },
      turnData: null
    };
    return code;
  }

  deleteRoom(code) {
    delete this.rooms[code];
  }

  findRoomByPlayerId(playerId) {
    return Object.keys(this.rooms).find(code => 
      this.rooms[code].players.some(p => p.id === playerId)
    );
  }
}