const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const movieRoutes = require("./routes/movieRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API health route
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Movie Discovery API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Mount application API routes
app.use("/api/movies", movieRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Frontend static assets path
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Catch-all handler
app.use((req, res) => {
  // If API route was requested and not found
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
    });
  }

  // If frontend build exists, serve index.html for React Router SPA routes
  if (fs.existsSync(clientDistPath)) {
    return res.sendFile(path.join(clientDistPath, "index.html"));
  }

  // Fallback if backend is running standalone without client dist
  res.json({
    status: "healthy",
    message: "Movie Discovery API is running (client build not detected)",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack || err.message);
  res.status(500).json({
    message: "An internal server error occurred. Please try again later.",
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/movie-discovery";

// Connect to MongoDB with timeout to prevent hanging if local MongoDB is offline
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.warn("MongoDB connection warning:", err.message);
    console.warn("Server will continue running. Wishlist features require an active MongoDB connection.");
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});