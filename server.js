const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Replace with your domain in production
    methods: ['GET', 'POST']
  }
});

// Serve static files (optional)
app.use(express.static(path.join(__dirname, 'public')));

// File to store messages
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Load messages from file
let messages = [];
(async () => {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    messages = JSON.parse(data);
    console.log(`Loaded ${messages.length} messages.`);
  } catch (error) {
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

  // Send history
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

// Keep connections alive
setInterval(() => {
  io.emit('ping');
}, 30000);

// PORT handling for local and Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
