import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.static(path.join(__dirname, "public")));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const MESSAGES_FILE = path.join(__dirname, "messages.json");
let messages = [];

(async () => {
  try {
    const data = await fs.readFile(MESSAGES_FILE, "utf8");
    messages = JSON.parse(data);
    console.log(`Loaded ${messages.length} messages`);
  } catch {
    console.log("No existing messages file found. Starting fresh.");
    messages = [];
  }
})();

async function saveMessages() {
  try {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error("Error saving messages:", err.message);
  }
}

io.on("connection", socket => {
  console.log(`User connected: ${socket.id}`);
  socket.emit("message history", messages);

  socket.on("request history", () => socket.emit("message history", messages));

  socket.on("chat message", data => {
    if (data?.username && data?.message) {
      messages.push(data);
      saveMessages();
      io.emit("chat message", data);
    } else {
      console.warn("Invalid message:", data);
    }
  });

  socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
});

// Ping keepalive
setInterval(() => io.emit("ping"), 30000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Chat server running on port ${PORT}`)
);
