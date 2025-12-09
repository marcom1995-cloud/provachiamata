//const express = require('express');
//const app = express();

//app.get('/', (req, res) => {
//  res.send('prova!');
//});
//app.listen(3000, () => {
//  console.log('Server listening on port 3000');
//});





// Installare: npm install express ws
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;

// Memorizza i WebSocket client connessi (assumiamo uno solo per semplicità)
let connectedClient = null;

// 1. Gestione della connessione WebSocket dal Client 3D
wss.on('connection', (ws) => {
    connectedClient = ws;
    console.log('Client 3D connesso.');

    ws.on('close', () => {
        connectedClient = null;
        console.log('Client 3D disconnesso.');
    });
});

// 2. Endpoint HTTP per ricevere istruzioni da n8n
app.post('/n8n-trigger', (req, res) => {
    const instruction = req.body;
    
    // 3. Inoltra i dati via WebSocket al Client 3D
    if (connectedClient && connectedClient.readyState === WebSocket.OPEN) {
        connectedClient.send(JSON.stringify(instruction));
        console.log('Istruzione inviata al client:', instruction);
        res.status(200).send({ status: 'success', message: 'Inviato al client 3D' });
    } else {
        console.error('Nessun client 3D connesso o WebSocket non pronto.');
        res.status(503).send({ status: 'error', message: 'Client 3D non disponibile' });
    }
});

server.listen(PORT, () => {
    console.log(`Gateway server avviato sulla porta ${PORT}`);
});