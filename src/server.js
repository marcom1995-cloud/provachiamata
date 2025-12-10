// server.js
const express = require('express');
const cors = require('cors'); // Necessario per comunicare col frontend
const app = express();
const port = 3000;

const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permetti connessioni da qualsiasi dominio (per testing)
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json()); // Middleware per analizzare il corpo JSON delle richieste

// --- Endpoint per il controllo 3D ---
app.post('/api/control', (req, res) => {
    const { valore, oggetto } = req.body; // Riceve i dati da n8n
    
    if (!valore || !oggetto) {
        return res.status(400).send({ message: "Dati mancanti: element o state" });
    }
    
    console.log(`Comando ricevuto: Oggetto: ${oggetto}, Azione: ${valore}`);
    // Inoltra il comando a tutti i client (browser) connessi
    io.emit('3d_command', { valore, oggetto }); // <--- QUESTO È IL PASSAGGIO CHIAVE
    
    // NOTA CHIAVE: Qui il server deve inviare il comando al Frontend (Visualizzatore 3D)
    // Usiamo WebSockets per l'aggiornamento in tempo reale (vedi Sezione 3)
    // Esempio: io.emit('3d_command', { valore, oggetto });

    // Risposta a n8n per confermare la ricezione
    res.status(200).send({ 
        message: `Comando per ${oggetto} in stato ${valore} ricevuto e inoltrato.` 
    });
});


// Listener per le connessioni Socket.io
io.on('connection', (socket) => {
  console.log('Un utente si è connesso al visualizzatore 3D');
});

// Fai partire il server HTTP (non l'app Express direttamente)
server.listen(port,'0.0.0.0', () => {
    console.log(`Server Socket.io/API in ascolto su http://localhost:${port}`);
});

