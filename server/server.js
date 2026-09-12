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

// Base health route
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    message: "Movie Discovery API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Mount application API routes
app.use("/api/movies", movieRoutes);
app.use("/api/wishlist", wishlistRoutes);

// 404 Catch-all handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
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