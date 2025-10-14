const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);

// Allow CORS for both local testing and Railway deployment
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://deblocked-production.up.railway.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Serve static files (optional, if you have frontend in /public)
app.use(express.static(path.join(__dirname, 'public')));

const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Load previous messages
let messages = [];
(async () => {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    messages = JSON.parse(data);
    console.log(`Loaded ${messages.length} messages.`);
  } catch {
    console.warn('No existing messages file found. Starting fresh.');
    messages = [];
  }
})();

// Save messages to file
async function saveMessages() {
  try {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    console.log(`Saved ${messages.length} messages.`);
  } catch (error) {
    console.error('Error saving messages:', error.message);
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.emit('message history', messages);

  socket.on('request history', () => {
    socket.emit('message history', messages);
  });

  socket.on('chat message', (data) => {
    if (data && data.username && data.message) {
      messages.push(data);
      saveMessages();
      io.emit('chat message', data);
    } else {
      console.warn('Invalid message data:', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('pong', () => {
    console.log('Pong from', socket.id);
  });
});

// Keep clients alive
setInterval(() => {
  io.emit('ping');
}, 30000);

// Use Railway's port and host properly
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Chat server running on http://${HOST}:${PORT}`);
});
