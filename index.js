/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let rooms = {};

// --- BASE DE DATOS MÉDICA (100 PALABRAS) ---
const medicalDeck = [
  { word: "Diabetes", clue: "Metabolismo" },
  { word: "EPOC", clue: "Moco" },
  { word: "Lesión prerrenal", clue: "Hipoperfusión" },
  { word: "Colecistitis", clue: "Irritación diafragmática" },
  { word: "Infarto Miocardio", clue: "Troponinas" },
  { word: "Apendicitis", clue: "Fosa ilíaca derecha" },
  { word: "Neumonía", clue: "Crépitos" },
  { word: "Ictus", clue: "Escala Cincinnati" },
  { word: "Anemia", clue: "Hemoglobina" },
  { word: "Asma", clue: "Sibilancias" },
  { word: "Cirrosis", clue: "Ascitis" },
  { word: "Hipotiroidismo", clue: "TSH elevada" },
  { word: "Hipertensión", clue: "Presión arterial" },
  { word: "Artritis Reumatoide", clue: "Rigidez matutina" },
  { word: "Meningitis", clue: "Signo de Brudzinski" },
  { word: "Embolismo Pulmonar", clue: "Dímero D" },
  { word: "Pancreatitis", clue: "Amilasa" },
  { word: "Cushing", clue: "Cortisol" },
  { word: "Sepsis", clue: "Lactato" },
  { word: "Falla Cardíaca", clue: "Péptido natriurético" },
  { word: "Glaucoma", clue: "Presión intraocular" },
  { word: "Gota", clue: "Ácido úrico" },
  { word: "Herpes Zóster", clue: "Dermatoma" },
  { word: "Sarna", clue: "Prurito nocturno" },
  { word: "Dengue", clue: "Plaquetopenia" },
  { word: "Malaria", clue: "Frotis de sangre" },
  { word: "Tuberculosis", clue: "Bacilo de Koch" },
  { word: "VIH", clue: "CD4" },
  { word: "Lupus", clue: "Anticuerpos ANA" },
  { word: "Pielonefritis", clue: "Puño percusión renal" },
  { word: "Cataratas", clue: "Cristalino opaco" },
  { word: "Cáncer de Colon", clue: "Colonoscopia" },
  { word: "Leucemia", clue: "Blastos" },
  { word: "Párkinson", clue: "Dopamina" },
  { word: "Alzheimer", clue: "Placas amiloides" },
  { word: "Migraña", clue: "Fotofobia" },
  { word: "Epilepsia", clue: "Crisis convulsiva" },
  { word: "Esclerosis Múltiple", clue: "Desmielinización" },
  { word: "Enfisema", clue: "Atrapamiento aéreo" },
  { word: "Fibrosis Quística", clue: "Cloro en sudor" },
  { word: "Edema Pulmonar", clue: "Líquido alveolar" },
  { word: "Aneurisma", clue: "Dilatación arterial" },
  { word: "Varices", clue: "Insuficiencia venosa" },
  { word: "Trombosis", clue: "Triada de Virchow" },
  { word: "Gastritis", clue: "Helicobacter pylori" },
  { word: "Úlcera Péptica", clue: "Melenas" },
  { word: "Hepatitis A", clue: "Transmisión fecal-oral" },
  { word: "Cálculos Renales", clue: "Cólico nefrítico" },
  { word: "Cistitis", clue: "Disuria" },
  { word: "Prostatitis", clue: "Antígeno prostático" },
  { word: "Endometritis", clue: "Infección uterina" },
  { word: "Eclampsia", clue: "Convulsiones embarazo" },
  { word: "Osteoporosis", clue: "Densidad ósea" },
  { word: "Raquitismo", clue: "Vitamina D" },
  { word: "Escorbuto", clue: "Vitamina C" },
  { word: "Beriberi", clue: "Vitamina B1" },
  { word: "Pelagra", clue: "Vitamina B3" },
  { word: "Hipoglucemia", clue: "Glucagón" },
  { word: "Acromegalia", clue: "Hormona del crecimiento" },
  { word: "Feocromocitoma", clue: "Catecolaminas" },
  { word: "Addison", clue: "Insuficiencia adrenal" },
  { word: "Sarampión", clue: "Manchas de Koplik" },
  { word: "Varicela", clue: "Exantema polimorfo" },
  { word: "Parotiditis", clue: "Glándulas salivales" },
  { word: "Rabia", clue: "Hidrofobia" },
  { word: "Tetanos", clue: "Trismo" },
  { word: "Cólera", clue: "Agua de arroz" },
  { word: "Sífilis", clue: "Treponema pallidum" },
  { word: "Gonorrea", clue: "Diplococos gram negativos" },
  { word: "Clamidia", clue: "Infección intracelular" },
  { word: "Candidiasis", clue: "Hifas" },
  { word: "Botulismo", clue: "Parálisis flácida" },
  { word: "Psoriasis", clue: "Placas eritematosas" },
  { word: "Vitíligo", clue: "Despigmentación" },
  { word: "Melanoma", clue: "ABCDE del lunar" },
  { word: "Shock Anafiláctico", clue: "Epinefrina" },
  { word: "Shock Hipovolémico", clue: "Pérdida de volumen" },
  { word: "Osteomielitis", clue: "Infección ósea" },
  { word: "Rabdomiólisis", clue: "Mioglobina" },
  { word: "Sinusitis", clue: "Senos paranasales" },
  { word: "Otitis Media", clue: "Membrana timpánica" },
  { word: "Conjuntivitis", clue: "Ojo rojo" },
  { word: "Uveítis", clue: "Inflamación ocular" },
  { word: "Acalasia", clue: "Esfínter esofágico" },
  { word: "Diverticulitis", clue: "Colon sigmoide" },
  { word: "Crohn", clue: "Afectación transmural" },
  { word: "Colitis Ulcerosa", clue: "Afectación mucosa" },
  { word: "Hemofilia", clue: "Factor VIII" },
  { word: "Trombocitopenia", clue: "Recuento plaquetario" },
  { word: "Aplasia Medular", clue: "Pancitopenia" },
  { word: "Linfoma Hodgkin", clue: "Células Reed-Sternberg" },
  { word: "Sarcoidosis", clue: "Granulomas no caseificantes" },
  { word: "Silicosis", clue: "Exposición a sílice" },
  { word: "Pericarditis", clue: "Dolor pleurítico" },
  { word: "Endocarditis", clue: "Vegetaciones valvulares" },
  { word: "Miocarditis", clue: "Inflamación muscular" },
  { word: "Hipotermia", clue: "Ondas de Osborne" },
  { word: "Quemaduras", clue: "Regla de los nueve" },
  { word: "Insolaicón", clue: "Hipertermia" },
  { word: "Anquilosis", clue: "Fusión articular" }
];

// --- FUNCIONES DE UTILIDAD ---

const broadcastUpdate = (roomCode) => {
  if (rooms[roomCode]) {
    io.to(roomCode).emit("update-players", rooms[roomCode].players);
    io.to(roomCode).emit("settings-updated", rooms[roomCode].settings);
  }
};

const handlePlayerLeave = (socket, roomCode) => {
  const room = rooms[roomCode];
  if (!room) return;

  const leavingPlayer = room.players.find((p) => p.id === socket.id);
  if (!leavingPlayer) return;

  room.players = room.players.filter((p) => p.id !== socket.id);
  console.log(`❌ Dr. ${leavingPlayer.name} fuera de la unidad ${roomCode}`);

  if (room.players.length === 0) {
    delete rooms[roomCode];
    console.log(`🧹 Sala ${roomCode} vacía y eliminada.`);
  } else {
    if (leavingPlayer.role === "host") {
      room.players[0].role = "host";
    }

    if (room.gameStarted && room.turnData) {
      room.turnData.playerIds = room.players.map(p => p.id);
      room.turnData.currentIndex = 0;
      io.to(roomCode).emit("next-turn", room.turnData.playerIds[0]);
    }

    broadcastUpdate(roomCode);
    io.to(roomCode).emit("system-message", {
      text: `DR. ${leavingPlayer.name.toUpperCase()} HA ABANDONADO LA UNIDAD.`,
      type: "leave",
    });
  }
};

io.on("connection", (socket) => {
  
  socket.on("create-room", ({ name }) => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    socket.join(roomCode);

    rooms[roomCode] = {
      players: [{ id: socket.id, name, role: "host" }],
      gameStarted: false,
      settings: { maxPlayers: 5, timePerPerson: 60 },
      turnData: null
    };

    socket.emit("room-created", {
      roomCode,
      players: rooms[roomCode].players,
      settings: rooms[roomCode].settings,
    });
  });

  socket.on("join-room", ({ name, roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      room.players = room.players.filter((p) => p.id !== socket.id && p.name !== name);
      if (room.players.length < room.settings.maxPlayers) {
        socket.join(roomCode);
        const role = room.players.length === 0 ? "host" : "doctor";
        room.players.push({ id: socket.id, name, role });

        setTimeout(() => {
          socket.emit("room-joined", {
            roomCode,
            currentPlayers: room.players,
            settings: room.settings,
          });
          broadcastUpdate(roomCode);
          socket.to(roomCode).emit("system-message", {
            text: `DR. ${name.toUpperCase()} SE HA UNIDO AL EQUIPO.`,
            type: "join",
          });
        }, 100);
      } else {
        socket.emit("error-message", "La sala está llena.");
      }
    }
  });

  socket.on("update-settings", ({ roomCode, settings }) => {
    const room = rooms[roomCode];
    if (room) {
      const isHost = room.players.find((p) => p.id === socket.id && p.role === "host");
      if (isHost) {
        room.settings = { ...room.settings, ...settings };
        io.to(roomCode).emit("settings-updated", room.settings);
      }
    }
  });

  // --- LÓGICA DE INICIO DE JUEGO ACTUALIZADA ---
  socket.on('start-game', (roomCode) => {
    const room = rooms[roomCode];
    if (room && room.players.length >= 3) {
      room.gameStarted = true;
      
      // Selección aleatoria del par Palabra-Pista
      const selectedSet = medicalDeck[Math.floor(Math.random() * medicalDeck.length)];
      const impostorIndex = Math.floor(Math.random() * room.players.length);
      const impostorId = room.players[impostorIndex].id;

      room.turnData = {
        currentIndex: 0,
        playerIds: room.players.map(p => p.id)
      };

      room.players.forEach((player) => {
        const isImpostor = player.id === impostorId;
        io.to(player.id).emit('game-started', {
          role: isImpostor ? 'impostor' : 'doctor',
          // El doctor recibe la PALABRA, el impostor recibe la PISTA
          word: isImpostor ? selectedSet.clue : selectedSet.word
        });
      });
      
      setTimeout(() => {
        io.to(roomCode).emit("next-turn", room.turnData.playerIds[0]);
      }, 5000);

      console.log(`🎮 Partida iniciada en ${roomCode}. Palabra: ${selectedSet.word} | Pista Impostor: ${selectedSet.clue}`);
    }
  });

  socket.on("advance-turn", (roomCode) => {
    const room = rooms[roomCode];
    if (room && room.turnData) {
      const currentTurnId = room.turnData.playerIds[room.turnData.currentIndex];
      const isHost = room.players.find(p => p.id === socket.id && p.role === "host");

      if (socket.id === currentTurnId || isHost) {
        room.turnData.currentIndex = (room.turnData.currentIndex + 1) % room.turnData.playerIds.length;
        const nextPlayerId = room.turnData.playerIds[room.turnData.currentIndex];
        io.to(roomCode).emit("next-turn", nextPlayerId);
      }
    }
  });

  socket.on("stop-game", (roomCode) => {
    const room = rooms[roomCode];
    if (room) {
      room.gameStarted = false;
      room.turnData = null;
      io.to(roomCode).emit("game-ended");
    }
  });

  socket.on("leave-room", (roomCode) => {
    handlePlayerLeave(socket, roomCode);
    socket.leave(roomCode);
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      handlePlayerLeave(socket, roomCode);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 SERVIDOR MÉDICO CORRIENDO EN http://localhost:${PORT}`);
});