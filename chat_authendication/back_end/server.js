const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const WebSocket = require("ws");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User"); // User model
const authRoutes = require("./routes/auth"); // Authentication routes

const app = express();
const PORT = 3000;
const JWT_SECRET = "your_jwt_secret"; // Replace with a secure secret

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "../front_end")));

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/chat_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully."))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Routes
app.use(authRoutes); // Authentication routes

// Serve index.html for the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../front_end", "index.html"));
});

// Protected route (example)
app.get("/chat", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    jwt.verify(token, JWT_SECRET);
    res.sendFile(path.join(__dirname, "../front_end", "chat.html")); // Serve chat page
  } catch {
    res.status(401).send("Invalid token.");
  }
});

// Start WebSocket server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("A new client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    // Broadcast message to other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.send("Welcome to the chat!");
});