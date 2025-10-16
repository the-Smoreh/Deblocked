import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());

// Serve everything (since your HTML files and assets are all in root)
app.use(express.static(__dirname));

// Fallback: send index.html for root requests
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("⚡ User connected");
  socket.on("chat message", (msg) => io.emit("chat message", msg));
  socket.on("disconnect", () => console.log("🚪 User disconnected"));
});

// Railway’s dynamic port + host
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
});
