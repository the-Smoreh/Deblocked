const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins (update to your Neocities domain in production)
    methods: ['GET', 'POST']
  }
});

// Serve static files from the 'public' directory if needed (optional for chat server)
app.use(express.static(path.join(__dirname, 'public')));

// File to store messages
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Load messages from file
let messages = [];
(async () => {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    messages = JSON.parse(data);
    console.log('Loaded messages:', messages.length);
  } catch (error) {
    console.error('Error loading messages:', error.message);
    messages = [];
  }
})();

// Save messages to file
async function saveMessages() {
  try {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    console.log('Saved messages:', messages.length);
  } catch (error) {
    console.error('Error saving messages:', error.message);
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send message history to the new client
  socket.emit('message history', messages);

  socket.on('request history', () => {
    socket.emit('message history', messages);
  });

  socket.on('chat message', (data) => {
    console.log('Received message:', data);
    if (data && data.username && data.message) {
      messages.push(data);
      saveMessages(); // Save to file for persistence
      io.emit('chat message', data); // Broadcast to all clients
    } else {
      console.warn('Invalid message data:', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Ping-pong for connection keep-alive
  socket.on('pong', () => {
    console.log('Pong received from', socket.id);
  });
});

// Periodically send ping to clients
setInterval(() => {
  io.emit('ping');
}, 30000);

server.listen(3000, () => console.log('Chat server running on port 3000'));
