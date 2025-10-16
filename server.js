import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// serve all .json files, icons, html, etc directly from root
app.use(express.static(__dirname));

// fallback: serve index.html for root requests
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("⚡ User connected");
  socket.on("chat message", (msg) => io.emit("chat message", msg));
  socket.on("disconnect", () => console.log("🚪 User disconnected"));
});

// Railway assigns PORT automatically
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));
