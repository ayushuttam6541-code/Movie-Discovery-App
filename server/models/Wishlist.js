const mongoose = require("mongoose");

// Store only essential movie fields to keep storage lightweight and decoupled from TMDB internals
const wishlistSchema = new mongoose.Schema({
  // Anonymous client identifier passed via request headers (e.g., from browser localStorage)
  // to associate wishlist entries with a specific client browser without requiring user accounts
  clientId: {
    type: String,
    required: true,
    index: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  posterPath: {
    type: String,
    default: null,
  },
  releaseDate: {
    type: String,
    default: "Release date unavailable",
  },
  rating: {
    type: Number,
    default: 0,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce uniqueness per client + movie to prevent duplicate wishlist items
wishlistSchema.index({ clientId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
