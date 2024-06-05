// create express and socket io server
const fs = require('fs');
// const https = require('https'); // https local development
const http = require('http');
const express = require('express');
const cors = require('cors');

const socketio = require('socket.io');
const app = express();

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(express.json());

// const options = {
//   key: fs.readFileSync(`./certs/cert-key.pem`, 'utf8'), // https local development
//   cert: fs.readFileSync(`./certs/cert-cert.pem`, 'utf8'), // https local development
// };

// const expressServer = https.createServer(options, app); // https local development

const expressServer = http.createServer({}, app);
const io = socketio(expressServer, {
  cors: [
    'https://localhost:5173',
    'https://localhost:3000',
    'https://www.mgan.xyz',
  ],
});

expressServer.listen(443, () => {
  console.log('App listening at https://localhost');
});

module.exports = { io, expressServer, app };
