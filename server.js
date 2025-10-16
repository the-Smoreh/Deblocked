// server.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all files in the current directory
app.use(express.static(__dirname));

// If someone visits the root, serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Example: serve your JSON files dynamically
app.get("/:file", (req, res, next) => {
  const file = req.params.file;

  // If it's a known .json file, serve it properly
  if (file.endsWith(".json")) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send({ error: "JSON file not found" });
    }
  } else {
    next(); // let express.static handle other files
  }
});

// Handle 404s (anything not found)
app.use((req, res) => {
  const notFoundPage = path.join(__dirname, "not_found.html");
  if (fs.existsSync(notFoundPage)) {
    res.status(404).sendFile(notFoundPage);
  } else {
    res.status(404).send("404: Not Found");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
