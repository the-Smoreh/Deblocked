const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Enable CORS and serve all static files (no 'public' folder needed)
app.use(cors());
app.use(express.static(__dirname));

// Serve your index.html from root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("⚡ User connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("🚪 User disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
