// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// ✅ make sure we use Railway's port or default to 3000
const PORT = process.env.PORT || 3000;

// ✅ allow any frontend to connect to sockets (for testing)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Simple route to test server status
app.get("/", (req, res) => {
  res.send("✅ Server is alive on Railway.");
});

// Socket handling
io.on("connection", socket => {
  console.log("A user connected:", socket.id);

  socket.on("chat message", msg => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
