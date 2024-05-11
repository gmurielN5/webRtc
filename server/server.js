// create express and socket io server
const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');

const socketio = require('socket.io');
const app = express();

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(express.json());

const options = {
  key: fs.readFileSync(`./certs/cert-key.pem`, 'utf8'),
  cert: fs.readFileSync(`./certs/cert-cert.pem`, 'utf8'),
};

const expressServer = https.createServer(options, app);
const io = socketio(expressServer, {
  cors: ['https://localhost:5173', 'https://localhost:3000'],
});

expressServer.listen(443, () => {
  console.log('App listening at https://localhost');
});

module.exports = { io, expressServer, app };
